import {mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';

const schema = [
 'CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,created BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,expires BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS saves(player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,body TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,updated BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires BIGINT NOT NULL)',
 'CREATE INDEX IF NOT EXISTS drifter_session_expiry ON sessions(expires)',
 'CREATE INDEX IF NOT EXISTS drifter_limit_expiry ON limits(expires)',
];

// SQL strings are application-owned; every variable value is passed separately.
// Only rewrite table positions and table-qualified columns, never result aliases or literals.
function postgres(text) {
 let parameter=0;
 return text.split(/('(?:''|[^'])*'|"(?:""|[^"])*")/g).map((part,index)=>{
  if(index%2)return part;
  return part
   .replace(/(\b(?:FROM|JOIN|INTO|UPDATE|REFERENCES|ON)\s+|\bTABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?)(players|sessions|saves|limits)\b/gi,(_,prefix,name)=>prefix+'drifter_'+name.toLowerCase())
   .replace(/\b(players|sessions|saves|limits)(?=\s*\.)/gi,name=>'drifter_'+name.toLowerCase())
   .replace(/\?/g,()=>'$'+(++parameter));
 }).join('');
}

export async function openGameDatabase({databasePath,databaseUrl,databaseDriver,pgPool}={}) {
 let query,batch,close;
 const driver=databaseDriver||(databaseUrl?'neon':'sqlite');
 if(!['neon','pg','sqlite'].includes(driver))throw Error('Unsupported game database driver.');
 if(driver!=='sqlite'&&!databaseUrl)throw Error('Game database URL is required.');
 if(driver==='sqlite'&&!databasePath)throw Error('Game database path is required.');
 if(driver==='neon'){
  const {neon}=await import('@neondatabase/serverless');
  const sql=neon(databaseUrl,{fetchOptions:{cache:'no-store'}});
  query=(text,values=[])=>sql.query(postgres(text),values);
  batch=statements=>sql.transaction(statements.map(([text,values=[]])=>sql.query(postgres(text),values)));
  close=()=>{};
 }else if(driver==='pg'){
  let pool=pgPool;
  if(!pool){
   const {default:pg}=await import('pg');
   pool=new pg.Pool({connectionString:databaseUrl,max:5,connectionTimeoutMillis:10000});
   pool.on('error',()=>console.error('Game database idle connection error.'));
  }
  query=async(text,values=[])=>(await pool.query(postgres(text),values)).rows;
  batch=async statements=>{
   const client=await pool.connect();
   try{
    await client.query('BEGIN');
    const results=[];
    for(const [text,values=[]] of statements)results.push((await client.query(postgres(text),values)).rows);
    await client.query('COMMIT');
    return results;
   }catch(error){
    try{await client.query('ROLLBACK');}catch{}
    throw error;
   }finally{client.release();}
  };
  close=()=>pool.end();
 }else{
  const {DatabaseSync}=await import('node:sqlite');
  await mkdir(dirname(databasePath),{recursive:true});
  const db=new DatabaseSync(databasePath);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  query=async(text,values=[])=>db.prepare(text).all(...values);
  batch=async statements=>{
   db.exec('BEGIN IMMEDIATE');
   try{const results=statements.map(([text,values=[]])=>db.prepare(text).all(...values));db.exec('COMMIT');return results;}
   catch(error){db.exec('ROLLBACK');throw error;}
  };
  close=()=>db.close();
 }
 try{await batch(schema.map(text=>[text,[]]));}
 catch(error){await close();throw error;}
 const one=async(text,values=[])=>((await query(text,values))[0]||null);
 async function consumeLimit(key,max){
  const now=Date.now(),expires=now+15*60*1000;
  const row=await one(`INSERT INTO limits(key,count,expires) VALUES(?,1,?)
   ON CONFLICT(key) DO UPDATE SET
    count=CASE WHEN limits.expires<? THEN 1 ELSE limits.count+1 END,
    expires=CASE WHEN limits.expires<? THEN ? ELSE limits.expires END
   RETURNING count`,[key,expires,now,now,expires]);
  return Number(row.count)<=max;
 }
 return{query,batch,one,consumeLimit,close};
}
