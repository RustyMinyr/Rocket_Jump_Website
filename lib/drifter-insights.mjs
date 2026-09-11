import {randomBytes,randomUUID,createHash,timingSafeEqual} from 'node:crypto';
import {PLANETS,stageNames,experience,normalizeSave} from '../public/roland-home/data.js';

const hash=value=>createHash('sha256').update(value).digest('hex');
const DAY=86400000,UUID=/^[a-f0-9-]{36}$/i;
const kinds=new Set(['planet_start','planet_complete','planet_exit','stage_enter','death','gear','repair','vehicle','error']);
const reasons=new Set(['movement','combat','art','difficulty','exploration','controls','performance','other']);
const schema=[
 'CREATE TABLE IF NOT EXISTS drifter_visits(id TEXT PRIMARY KEY,token TEXT NOT NULL,visitor TEXT NOT NULL,started BIGINT NOT NULL,last_seen BIGINT NOT NULL,active INTEGER NOT NULL DEFAULT 0,seq INTEGER NOT NULL DEFAULT 0,device TEXT NOT NULL)',
 'CREATE INDEX IF NOT EXISTS drifter_visits_seen ON drifter_visits(last_seen)',
 'CREATE TABLE IF NOT EXISTS drifter_activity(visitor TEXT NOT NULL,bucket BIGINT NOT NULL,last_seen BIGINT NOT NULL,seconds INTEGER NOT NULL,PRIMARY KEY(visitor,bucket))',
 'CREATE INDEX IF NOT EXISTS drifter_activity_seen ON drifter_activity(last_seen)',
 'CREATE TABLE IF NOT EXISTS drifter_events(id TEXT PRIMARY KEY,visit TEXT NOT NULL REFERENCES drifter_visits(id) ON DELETE CASCADE,at BIGINT NOT NULL,kind TEXT NOT NULL,planet TEXT NOT NULL,stage INTEGER NOT NULL,value TEXT NOT NULL)',
 'CREATE INDEX IF NOT EXISTS drifter_events_at ON drifter_events(at,kind)',
 'CREATE TABLE IF NOT EXISTS drifter_attempts(id TEXT PRIMARY KEY,visit TEXT NOT NULL REFERENCES drifter_visits(id) ON DELETE CASCADE,planet TEXT NOT NULL,started BIGINT NOT NULL,finished BIGINT,outcome TEXT NOT NULL,stage INTEGER NOT NULL)',
 'CREATE INDEX IF NOT EXISTS drifter_attempts_started ON drifter_attempts(started,planet)',
 'CREATE TABLE IF NOT EXISTS drifter_feedback(visitor TEXT NOT NULL,planet TEXT NOT NULL,rating INTEGER NOT NULL,reason TEXT NOT NULL,updated BIGINT NOT NULL,PRIMARY KEY(visitor,planet))',
 'CREATE TABLE IF NOT EXISTS drifter_profiles(player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,alias TEXT NOT NULL,alias_key TEXT NOT NULL UNIQUE,xp INTEGER NOT NULL,worlds INTEGER NOT NULL,joined BIGINT NOT NULL,updated BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS drifter_admins(player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,created BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS drifter_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL)',
];
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const world=id=>typeof id==='string'&&(Object.hasOwn(PLANETS,id)||id==='asteroids');
const worldCount=save=>save.completed.filter(id=>PLANETS[id]&&!PLANETS[id].fatal).length;
const display=id=>PLANETS[id]?.name||(id==='asteroids'?'The Scenic Route':id);

export async function createInsightsService({db,json,body,rate,load,adminEmail='',bootstrapToken='',now=Date.now}){
 await db.batch(schema.map(sql=>[sql,[]]));
 const owner=adminEmail.trim().toLowerCase();
 async function isAdmin(user){return !!user&&!!await db.one('SELECT player_id FROM drifter_admins WHERE player_id=?',[user.id]);}
 async function refreshProfile(id,save){const s=normalizeSave(save);await db.query('UPDATE drifter_profiles SET xp=?,worlds=?,updated=? WHERE player_id=?',[experience(s),worldCount(s),now(),id]);}
 async function visit(input){if(!UUID.test(input.visit||'')||typeof input.token!=='string'||!/^[a-f0-9]{48}$/.test(input.token))fail('Invalid play session.',401);const v=await db.one('SELECT * FROM drifter_visits WHERE id=? AND token=?',[input.visit,hash(input.token)]);if(!v||now()-Number(v.started)>DAY)fail('Play session expired.',401);return v;}
 async function cleanup(){const t=now();const lock=await db.one("INSERT INTO drifter_settings(key,value) VALUES('cleanup',?) ON CONFLICT(key) DO UPDATE SET value=? WHERE CAST(drifter_settings.value AS BIGINT)<? RETURNING key",[String(t),String(t),t-DAY]);if(lock)await db.batch([
  ['DELETE FROM drifter_visits WHERE last_seen<?',[t-35*DAY]],['DELETE FROM drifter_activity WHERE last_seen<?',[t-35*DAY]],['DELETE FROM drifter_feedback WHERE updated<?',[t-35*DAY]],
 ]);}
 async function dashboard(days){
  const t=now(),since=t-days*DAY;
  const count=async(sql,args=[])=>Number((await db.one(sql,args))?.n||0);
  const [active,windows,attempts,stages,feedback,trend,errors,first,seconds]=await Promise.all([
   count('SELECT COUNT(DISTINCT visitor) AS n FROM drifter_visits WHERE active=1 AND last_seen>?',[t-60000]),
   Promise.all([1,7,30].map(async d=>({days:d,players:await count('SELECT COUNT(DISTINCT visitor) AS n FROM drifter_activity WHERE last_seen>=?',[t-d*DAY])}))),
   db.query("SELECT a.planet,COUNT(*) AS starts,SUM(CASE WHEN a.outcome='complete' THEN 1 ELSE 0 END) AS completions,SUM(CASE WHEN a.outcome='dead' THEN 1 ELSE 0 END) AS deaths,SUM(CASE WHEN a.outcome='left' OR (a.outcome='active' AND v.last_seen<?) THEN 1 ELSE 0 END) AS exits FROM drifter_attempts a JOIN drifter_visits v ON v.id=a.visit WHERE a.started>=? GROUP BY a.planet ORDER BY starts DESC",[t-120000,since]),
   db.query("SELECT planet,stage,COUNT(*) AS plays,COUNT(DISTINCT v.visitor) AS players FROM drifter_events e JOIN drifter_visits v ON v.id=e.visit WHERE e.at>=? AND kind='stage_enter' GROUP BY planet,stage ORDER BY plays DESC LIMIT 30",[since]),
   db.query('SELECT planet,rating,reason,COUNT(*) AS votes FROM drifter_feedback WHERE updated>=? GROUP BY planet,rating,reason',[since]),
   db.query('SELECT CAST(bucket / 86400000 AS BIGINT) AS day,COUNT(DISTINCT visitor) AS players,SUM(seconds) AS seconds FROM drifter_activity WHERE last_seen>=? GROUP BY CAST(bucket / 86400000 AS BIGINT) ORDER BY day',[since]),
   db.query("SELECT planet,value,COUNT(*) AS reports FROM drifter_events WHERE kind='error' AND at>=? GROUP BY planet,value ORDER BY reports DESC LIMIT 10",[since]),
   db.one("SELECT value AS at FROM drifter_settings WHERE key='tracking_started'"),
   count('SELECT COALESCE(SUM(seconds),0) AS n FROM drifter_activity WHERE last_seen>=?',[since]),
  ]);
  const planets=attempts.map(a=>({...Object.fromEntries(Object.entries(a).map(([k,v])=>[k,k==='planet'?v:Number(v)])),name:display(a.planet)}));
  const insights=[];const total=planets.reduce((n,p)=>n+p.starts,0);
  if(total<5)insights.push({tone:'neutral',title:'Early days',text:'There are fewer than five planet attempts in this period. Keep collecting data before changing the game.'});
  if(planets[0])insights.push({tone:'positive',title:'Most visited world',text:`${planets[0].name} received ${planets[0].starts} starts. Popularity is a behaviour signal, not a satisfaction rating.`});
  const friction=planets.filter(p=>p.starts>=5&&!PLANETS[p.planet]?.fatal&&p.planet!=='asteroids').sort((a,b)=>(b.deaths+b.exits)/b.starts-(a.deaths+a.exits)/a.starts)[0];
  if(friction&&(friction.deaths+friction.exits)/friction.starts>.5)insights.push({tone:'attention',title:'Worth playtesting',text:`${friction.name}: ${friction.deaths} deaths and ${friction.exits} exits from ${friction.starts} attempts. Check difficulty and controls; this does not prove players dislike it.`});
  const likes=new Map();for(const f of feedback){const value=likes.get(f.planet)||{up:0,down:0};value[Number(f.rating)>0?'up':'down']+=Number(f.votes);likes.set(f.planet,value);}
  for(const [planet,votes]of [...likes].filter(([,v])=>v.up+v.down>=3).sort((a,b)=>(b[1].up+b[1].down)-(a[1].up+a[1].down)).slice(0,3))insights.push({tone:votes.up>=votes.down?'positive':'attention',title:display(planet)+' · player feedback',text:`${votes.up} positive and ${votes.down} negative ratings. Optional feedback comes from players who chose to respond.`});
  if(errors.length)insights.push({tone:'attention',title:'Technical issues reported',text:`${errors.reduce((n,e)=>n+Number(e.reports),0)} error reports were received. Check the affected worlds before promoting the game.`});
  return{generatedAt:t,trackingSince:first?.at?Number(first.at):null,days,active,windows,activeMinutes:Math.round(seconds/60),attempts:total,completions:planets.reduce((n,p)=>n+p.completions,0),planets,stages:stages.map(s=>({...s,plays:Number(s.plays),players:Number(s.players),name:display(s.planet),stageName:PLANETS[s.planet]?stageNames(PLANETS[s.planet])[Number(s.stage)]:'Trap'})),feedback:feedback.map(f=>({...f,name:display(f.planet),rating:Number(f.rating),votes:Number(f.votes)})),trend:trend.map(x=>({day:Number(x.day)*DAY,players:Number(x.players),minutes:Math.round(Number(x.seconds)/60)})),errors:errors.map(e=>({...e,name:display(e.planet),reports:Number(e.reports)})),insights,definitions:{active:'Unique opted-in browsers sending active gameplay updates in the last 60 seconds. Paused, hidden and menu screens are excluded.',players:'Unique opted-in browsers, not verified individual people. One person on two devices can count twice.',exits:'Explicit departures plus unfinished attempts with no heartbeat for two minutes; a connection failure can look like an exit.',minutes:'Observed foreground play time, grouped hourly. Boundary hours can include time just outside the selected period.',leaderboard:'Friendly exploration rankings from normalized account saves, not cheat-proof competitive scores.'}};
 }
 async function handle(action,request,user,clientAddress){const method=request.method,t=now();
  if(action==='leaderboard'&&method==='GET'){const rows=await db.query('SELECT alias,xp,worlds FROM drifter_profiles ORDER BY worlds DESC,xp DESC,joined ASC LIMIT 50');return json({entries:rows.map((r,i)=>({rank:i+1,alias:r.alias,xp:Number(r.xp),worlds:Number(r.worlds)})),basis:'Planets explored, then adventure XP. Friendly rankings from synced account saves.'});}
  if(action==='leaderboard-profile'){
   if(!user)fail('Sign in to join the explorer board.',401);
   if(method==='GET')return json({profile:await db.one('SELECT alias,xp,worlds FROM drifter_profiles WHERE player_id=?',[user.id])});
   if(method==='DELETE'){await db.query('DELETE FROM drifter_profiles WHERE player_id=?',[user.id]);return json({ok:true});}
   if(method==='PUT'){if(!await rate('board:'+user.id,12))fail('Please wait before changing your callsign again.',429);const input=await body(request),alias=String(input.alias||'').trim().replace(/\s+/g,' ');if(!/^[a-zA-Z0-9][a-zA-Z0-9 _-]{2,19}$/.test(alias)||input.listed!==true)fail('Choose a public callsign of 3–20 letters or numbers and opt in.');const {save}=await load(user.id);try{await db.query('INSERT INTO drifter_profiles(player_id,alias,alias_key,xp,worlds,joined,updated) VALUES(?,?,?,?,?,?,?) ON CONFLICT(player_id) DO UPDATE SET alias=?,alias_key=?,xp=?,worlds=?,updated=?',[user.id,alias,alias.toLowerCase(),experience(save),worldCount(save),t,t,alias,alias.toLowerCase(),experience(save),worldCount(save),t]);}catch(error){if(error.code==='23505'||String(error).includes('UNIQUE'))fail('That callsign is already in use.',409);throw error;}return json({ok:true});}
  }
  if(action==='admin-access'&&method==='GET')return json({signedIn:!!user,admin:await isAdmin(user),setupAvailable:!!owner&&!!bootstrapToken&&!(await db.one('SELECT player_id FROM drifter_admins LIMIT 1'))});
  if(action==='admin-claim'&&method==='POST'){
   if(!user)fail('Sign in before activating owner access.',401);if(!await rate('admin:'+hash(clientAddress),8))fail('Too many attempts. Try again later.',429);
   const input=await body(request);if(!owner||!bootstrapToken||user.email!==owner||typeof input.token!=='string'||input.token.length>256||!timingSafeEqual(Buffer.from(hash(input.token)),Buffer.from(hash(bootstrapToken))))fail('Owner invitation is invalid.',403);
   const inserted=await db.one('INSERT INTO drifter_admins(player_id,created) SELECT ?,? WHERE NOT EXISTS (SELECT 1 FROM drifter_admins) ON CONFLICT(player_id) DO NOTHING RETURNING player_id',[user.id,t]);if(!inserted&&!await isAdmin(user))fail('Owner access is already activated.',403);return json({ok:true});
  }
  if(action==='admin-insights'&&method==='GET'){if(!await isAdmin(user))fail('Owner access required.',403);if(!await rate('dashboard:'+user.id,100))fail('Please wait before refreshing.',429);const days=Number(new URL(request.url).searchParams.get('days')||7);if(![1,7,30].includes(days))fail('Choose 24 hours, 7 days or 30 days.');return json(await dashboard(days));}
  if(action==='telemetry-start'&&method==='POST'){
   if(!await rate('metrics-start:'+hash(clientAddress),60))fail('Too many play sessions.',429);const input=await body(request);if(!UUID.test(input.visitor||''))fail('Invalid anonymous visitor.');const id=randomUUID(),token=randomBytes(24).toString('hex');await cleanup();await db.batch([['INSERT INTO drifter_visits(id,token,visitor,started,last_seen,active,seq,device) VALUES(?,?,?,?,?,0,0,?)',[id,hash(token),hash(input.visitor),t,t,input.device==='phone'?'phone':'desktop']],["INSERT INTO drifter_settings(key,value) VALUES('tracking_started',?) ON CONFLICT(key) DO NOTHING",[String(t)]]]);return json({visit:id,token});
  }
  if(action==='telemetry'&&method==='POST'){
   const input=await body(request),v=await visit(input);if(!await rate('metrics:'+v.id,900))fail('Too many updates.',429);
   if(!Number.isSafeInteger(input.seq)||input.seq<1||input.seq>1000000||typeof input.active!=='boolean'||!Array.isArray(input.events)||input.events.length>16)fail('Invalid gameplay update.');
   const events=input.events.map(e=>{if(!e||!UUID.test(e.id||'')||!kinds.has(e.kind)||!world(e.planet)||!Number.isInteger(e.stage)||e.stage<0||e.stage>4||!UUID.test(e.attempt||''))fail('Invalid gameplay event.');return{id:e.id,kind:e.kind,planet:e.planet,stage:e.stage,attempt:e.attempt,value:['runtime','asset','save','fall','collision','projectile','fire','eaten','asteroids','manual'].includes(e.value)?e.value:''};});
   const changed=await db.one('UPDATE drifter_visits SET seq=?,last_seen=?,active=? WHERE id=? AND seq<? RETURNING id',[input.seq,t,input.active?1:0,v.id,input.seq]);if(!changed)return json({ok:true,duplicate:true});
   const seconds=Number(v.active)?Math.max(0,Math.min(30,Math.floor((t-Number(v.last_seen))/1000))):0,bucket=Math.floor(t/3600000)*3600000,statements=[];
   if(input.active||Number(v.active))statements.push(['INSERT INTO drifter_activity(visitor,bucket,last_seen,seconds) VALUES(?,?,?,?) ON CONFLICT(visitor,bucket) DO UPDATE SET last_seen=?,seconds=CASE WHEN drifter_activity.seconds+?>3600 THEN 3600 ELSE drifter_activity.seconds+? END',[v.visitor,bucket,t,seconds,t,seconds,seconds]]);
   for(const e of events){statements.push(['INSERT INTO drifter_events(id,visit,at,kind,planet,stage,value) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',[e.id,v.id,t,e.kind,e.planet,e.stage,e.value]]);
    if(e.kind==='planet_start')statements.push(["INSERT INTO drifter_attempts(id,visit,planet,started,finished,outcome,stage) VALUES(?,?,?,?,NULL,'active',?) ON CONFLICT(id) DO NOTHING",[e.attempt,v.id,e.planet,t,e.stage]]);
    if(e.kind==='stage_enter')statements.push(['UPDATE drifter_attempts SET stage=? WHERE id=? AND visit=?',[e.stage,e.attempt,v.id]]);
    if(['planet_complete','planet_exit','death'].includes(e.kind))statements.push(["UPDATE drifter_attempts SET finished=?,outcome=?,stage=? WHERE id=? AND visit=? AND outcome='active'",[t,{planet_complete:'complete',planet_exit:'left',death:'dead'}[e.kind],e.stage,e.attempt,v.id]]);
   }
   if(statements.length)await db.batch(statements);return json({ok:true});
  }
  if(action==='feedback'&&method==='POST'){const input=await body(request),v=await visit(input);if(!world(input.planet)||![1,-1].includes(input.rating)||!reasons.has(input.reason))fail('Choose a planet rating and reason.');if(!await rate('feedback:'+v.visitor,25))fail('Please wait before sending more feedback.',429);if(!await db.one('SELECT id FROM drifter_attempts WHERE visit=? AND planet=? LIMIT 1',[v.id,input.planet]))fail('Visit this planet before rating it.');await db.query('INSERT INTO drifter_feedback(visitor,planet,rating,reason,updated) VALUES(?,?,?,?,?) ON CONFLICT(visitor,planet) DO UPDATE SET rating=?,reason=?,updated=?',[v.visitor,input.planet,input.rating,input.reason,t,input.rating,input.reason,t]);return json({ok:true});}
  return null;
 }
 return{handle,refreshProfile};
}
