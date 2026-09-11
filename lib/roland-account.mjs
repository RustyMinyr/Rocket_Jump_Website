import {randomBytes,randomUUID,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {openGameDatabase} from './drifter-database.mjs';
import {fresh,normalizeSave,mergeSaves} from '../public/roland-home/data.js';

const derive=promisify(scrypt),hash=value=>createHash('sha256').update(value).digest('hex');
const COOKIE='roland_session',MAX_BODY=128000,MONTH=30*24*60*60*1000;
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const unavailable=()=>json({available:false,storage:null,message:'Account saves are not connected on this server. Freeplay is available.'});

// Production uses durable Postgres; SQLite is limited to explicitly configured local/persistent hosts.
/** @param {{databasePath?: string, databaseUrl?: string, origin?: string, origins?: string[], local?: boolean}} options */
export async function createGameService({databasePath,databaseUrl,origin,origins=[],local=false}={}){
 if(!origin||(!databaseUrl&&(!databasePath||process.env.VERCEL&&!local)))return{handle:async request=>new URL(request.url).pathname.endsWith('/status')?unavailable():json({error:'Account saves are not connected on this server.'},503),close:()=>{}};
 const db=await openGameDatabase({databasePath,databaseUrl}),storage=databaseUrl?'cloud':local?'local':'server';
 let hashing=0;
 const allowedOrigins=new Set([origin,...origins].map(value=>new URL(value).origin));
 const cookie=(request,token,expires)=>`${COOKIE}=${token}; Path=/api/roland; HttpOnly; SameSite=Lax; Max-Age=${expires};${new URL(request.url).protocol==='https:'?' Secure;':''}`;
 async function session(request){const token=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return db.one('SELECT players.id,players.email FROM sessions JOIN players ON players.id=sessions.player_id WHERE token=? AND expires>?',[hash(token),Date.now()]);}
 async function load(id){const row=await db.one('SELECT body,revision FROM saves WHERE player_id=?',[id]);return{save:normalizeSave(JSON.parse(row.body)),revision:Number(row.revision)};}
 const rate=(key,max)=>db.consumeLimit(key,max);
 async function passwordDigest(password,salt){if(hashing>=3)throw Object.assign(Error('A few explorers are signing in. Try again shortly.'),{status:429});hashing++;try{return await derive(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024});}finally{hashing--;}}
 async function check(password,stored){const [salt,expected]=stored.split(':');const actual=await passwordDigest(password,salt);const bytes=Buffer.from(expected,'hex');return bytes.length===actual.length&&timingSafeEqual(actual,bytes);}
 async function body(request){if(!request.headers.get('content-type')?.startsWith('application/json'))throw Object.assign(Error('JSON is required.'),{status:415});if(Number(request.headers.get('content-length'))>MAX_BODY)throw Object.assign(Error('Request is too large.'),{status:413});const reader=request.body?.getReader();let size=0,chunks=[];if(reader)while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();throw Object.assign(Error('Request is too large.'),{status:413});}chunks.push(value);}try{const parsed=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error();return parsed;}catch{throw Object.assign(Error('This request could not be read.'),{status:400});}}
 async function handle(request,{clientAddress='local'}={}){try{
  const url=new URL(request.url),action=url.pathname.split('/').filter(Boolean).pop(),method=request.method;
  if(!allowedOrigins.has(url.origin))return json({error:'Unrecognized server address.'},403);
  if(!['GET','POST','PUT','DELETE'].includes(method))return json({error:'Method not allowed.'},405);
  if(method!=='GET'&&(request.headers.get('origin')!==url.origin||!['same-origin','none',null].includes(request.headers.get('sec-fetch-site'))))return json({error:'This request must come from the game.'},403);
  if(action==='status'&&method==='GET')return json({available:true,storage});
  const user=await session(request);
  if(action==='session'&&method==='GET')return json(user?{user,...await load(user.id),storage}:{user:null});
  if(action==='logout'&&method==='POST'){if(user){const token=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(token)await db.query('DELETE FROM sessions WHERE token=?',[hash(token)]);}return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});}
  if(['register','login'].includes(action)&&method==='POST'){
   if(!await rate('ip:'+hash(clientAddress),35))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
   const input=await body(request),email=typeof input.email==='string'?input.email.trim().toLowerCase():'',password=input.password;
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length<10||password.length>128)return json({error:'Enter an email and a password between 10 and 128 characters.'},400);
   if(!await rate('email:'+hash(email),12))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
   let player=await db.one('SELECT id,email,password FROM players WHERE email=?',[email]);
   if(action==='register'){
    if(!await rate('register:'+hash(clientAddress),8))return json({error:'Please try again later.'},429);
    if(player)return json({error:'Unable to create that account. Try signing in instead.'},409);
    const salt=randomBytes(24).toString('hex'),digest=await passwordDigest(password,salt);player={id:randomUUID(),email};
    try{await db.batch([['INSERT INTO players VALUES(?,?,?,?)',[player.id,email,salt+':'+digest.toString('hex'),Date.now()]],['INSERT INTO saves VALUES(?,?,0,?)',[player.id,JSON.stringify(fresh()),Date.now()]]]);}catch(error){if(error.code==='23505'||String(error).includes('UNIQUE'))return json({error:'Unable to create that account. Try signing in instead.'},409);throw error;}
   }else{const dummy='012345678901234567890123456789012345678901234567:'+Buffer.alloc(64).toString('hex');if(!await check(password,player?.password||dummy)||!player)return json({error:'Email or password is incorrect.'},401);}
   const token=randomBytes(32).toString('hex');await db.batch([['DELETE FROM sessions WHERE expires<?',[Date.now()]],['DELETE FROM limits WHERE expires<?',[Date.now()]],['INSERT INTO sessions VALUES(?,?,?)',[hash(token),player.id,Date.now()+MONTH]]]);
   return json({user:{id:player.id,email:player.email},...await load(player.id),storage},200,{'Set-Cookie':cookie(request,token,MONTH/1000)});
  }
  if(action==='save'){
   if(!user)return json({error:'Sign in to save this adventure.'},401);
   if(method==='GET')return json(await load(user.id));
   if(method==='PUT'){
    const input=await body(request);if(input.accountId!==user.id)return json({error:'The signed-in player changed. Sign in again.'},409);
    if(!input.save||input.save.version!==2||!Number.isSafeInteger(input.revision)||input.revision<0)return json({error:'Invalid adventure save.'},400);
    if(!await rate('save:'+user.id,400))return json({error:'Please wait a moment before saving again.'},429);
    const safe=normalizeSave(input.save),old=await load(user.id);
    if(old.revision!==input.revision)return json({error:'Another session saved progress.',...old},409);
    const revision=old.revision+1,merged=mergeSaves(old.save,safe);
    // One atomic compare-and-swap works across serverless instances without an interactive transaction.
    const written=await db.one('UPDATE saves SET body=?,revision=?,updated=? WHERE player_id=? AND revision=? RETURNING revision',[JSON.stringify(merged),revision,Date.now(),user.id,old.revision]);
    if(!written)return json({error:'Another session saved progress.',...await load(user.id)},409);
    return json({save:merged,revision});
   }
  }
  return json({error:'Not found.'},404);
 }catch(error){return json({error:error.status?error.message:'Your save could not be stored. Please try again.'},error.status||503);}}
 return{handle,close:()=>db.close()};
}
