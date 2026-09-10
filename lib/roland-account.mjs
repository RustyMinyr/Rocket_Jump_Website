import {randomBytes,randomUUID,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {fresh,normalizeSave,mergeSaves} from '../public/roland-home/data.js';

const derive=promisify(scrypt),hash=value=>createHash('sha256').update(value).digest('hex');
const COOKIE='roland_session',MAX_BODY=128000,MONTH=30*24*60*60*1000;
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const unavailable=()=>json({available:false,storage:null,message:'Account saves are not connected on this server. Freeplay is available.'});

// Vercel's ephemeral filesystem must never be presented as durable account storage.
// A persistent server may supply a SQLite path; the local preview supplies it explicitly.
/** @param {{databasePath?: string, origin?: string, local?: boolean}} options */
export async function createGameService({databasePath,origin,local=false}={}){
 if(!databasePath||!origin||process.env.VERCEL&&!local)return{handle:async request=>new URL(request.url).pathname.endsWith('/status')?unavailable():json({error:'Account saves are not connected on this server.'},503),close:()=>{}};
 const {DatabaseSync}=await import('node:sqlite');await mkdir(dirname(databasePath),{recursive:true});
 const db=new DatabaseSync(databasePath);db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS saves(player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,body TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,updated INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
 let hashing=0;
 const secure=new URL(origin).protocol==='https:',allowedOrigin=new URL(origin).origin;
 const cookie=(token,expires)=>`${COOKIE}=${token}; Path=/api/roland; HttpOnly; SameSite=Lax; Max-Age=${expires};${secure?' Secure;':''}`;
 function session(request){const token=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT players.id,players.email FROM sessions JOIN players ON players.id=sessions.player_id WHERE token=? AND expires>?').get(hash(token),Date.now())||null;}
 function load(id){const row=db.prepare('SELECT body,revision FROM saves WHERE player_id=?').get(id);return{save:normalizeSave(JSON.parse(row.body)),revision:row.revision};}
 function rate(key,max){const now=Date.now();db.prepare('DELETE FROM limits WHERE expires<?').run(now);db.prepare('INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+15*60*1000);return db.prepare('SELECT count FROM limits WHERE key=?').get(key).count<=max;}
 async function passwordDigest(password,salt){if(hashing>=3)throw Object.assign(Error('A few explorers are signing in. Try again shortly.'),{status:429});hashing++;try{return await derive(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024});}finally{hashing--;}}
 async function check(password,stored){const [salt,expected]=stored.split(':');const actual=await passwordDigest(password,salt);const bytes=Buffer.from(expected,'hex');return bytes.length===actual.length&&timingSafeEqual(actual,bytes);}
 async function body(request){if(!request.headers.get('content-type')?.startsWith('application/json'))throw Object.assign(Error('JSON is required.'),{status:415});if(Number(request.headers.get('content-length'))>MAX_BODY)throw Object.assign(Error('Request is too large.'),{status:413});const reader=request.body?.getReader();let size=0,chunks=[];if(reader)while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();throw Object.assign(Error('Request is too large.'),{status:413});}chunks.push(value);}try{const parsed=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error();return parsed;}catch{throw Object.assign(Error('This request could not be read.'),{status:400});}}
 async function handle(request,{clientAddress='local'}={}){try{
  const url=new URL(request.url),action=url.pathname.split('/').filter(Boolean).pop(),method=request.method;
  if(url.origin!==allowedOrigin)return json({error:'Unrecognized server address.'},403);
  if(!['GET','POST','PUT','DELETE'].includes(method))return json({error:'Method not allowed.'},405);
  if(method!=='GET'&&(request.headers.get('origin')!==allowedOrigin||!['same-origin','none',null].includes(request.headers.get('sec-fetch-site'))))return json({error:'This request must come from the game.'},403);
  if(action==='status'&&method==='GET')return json({available:true,storage:local?'local':'server'});
  const user=session(request);
  if(action==='session'&&method==='GET')return json(user?{user,...load(user.id),storage:local?'local':'server'}:{user:null});
  if(action==='logout'&&method==='POST'){if(user){const token=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));}return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
  if(['register','login'].includes(action)&&method==='POST'){
   if(!rate('ip:'+hash(clientAddress),35))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
   const input=await body(request),email=typeof input.email==='string'?input.email.trim().toLowerCase():'',password=input.password;
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length<10||password.length>128)return json({error:'Enter an email and a password between 10 and 128 characters.'},400);
   if(!rate('email:'+hash(email),12))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
   let player=db.prepare('SELECT id,email,password FROM players WHERE email=?').get(email);
   if(action==='register'){
    if(!rate('register:'+hash(clientAddress),8))return json({error:'Please try again later.'},429);
    if(player)return json({error:'Unable to create that account. Try signing in instead.'},409);
    const salt=randomBytes(24).toString('hex'),digest=await passwordDigest(password,salt);player={id:randomUUID(),email};
    db.exec('BEGIN IMMEDIATE');try{db.prepare('INSERT INTO players VALUES(?,?,?,?)').run(player.id,email,salt+':'+digest.toString('hex'),Date.now());db.prepare('INSERT INTO saves VALUES(?,?,0,?)').run(player.id,JSON.stringify(fresh()),Date.now());db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');if(String(error).includes('UNIQUE'))return json({error:'Unable to create that account. Try signing in instead.'},409);throw error;}
   }else{const dummy='012345678901234567890123456789012345678901234567:'+Buffer.alloc(64).toString('hex');if(!await check(password,player?.password||dummy)||!player)return json({error:'Email or password is incorrect.'},401);}
   const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),player.id,Date.now()+MONTH);
   return json({user:{id:player.id,email:player.email},...load(player.id),storage:local?'local':'server'},200,{'Set-Cookie':cookie(token,MONTH/1000)});
  }
  if(action==='save'){
   if(!user)return json({error:'Sign in to save this adventure.'},401);
   if(method==='GET')return json(load(user.id));
   if(method==='PUT'){
    const input=await body(request);if(input.accountId!==user.id)return json({error:'The signed-in player changed. Sign in again.'},409);
    if(!input.save||input.save.version!==2||!Number.isSafeInteger(input.revision)||input.revision<0)return json({error:'Invalid adventure save.'},400);
    if(!rate('save:'+user.id,400))return json({error:'Please wait a moment before saving again.'},429);
    const safe=normalizeSave(input.save);db.exec('BEGIN IMMEDIATE');try{const old=load(user.id);if(old.revision!==input.revision){db.exec('ROLLBACK');return json({error:'Another session saved progress.',...old},409);}const revision=old.revision+1,merged=mergeSaves(old.save,safe);db.prepare('UPDATE saves SET body=?,revision=?,updated=? WHERE player_id=?').run(JSON.stringify(merged),revision,Date.now(),user.id);db.exec('COMMIT');return json({save:merged,revision});}catch(error){if(db.isTransaction)db.exec('ROLLBACK');throw error;}
   }
  }
  return json({error:'Not found.'},404);
 }catch(error){return json({error:error.status?error.message:'Your save could not be stored. Please try again.'},error.status||503);}}
 return{handle,close:()=>db.close()};
}
