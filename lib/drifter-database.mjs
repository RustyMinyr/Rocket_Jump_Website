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
function postgres(text) {
 let index=0;
 return text.replace(/\b(players|sessions|saves|limits)\b/g,'drifter_$1').replace(/\?/g,()=>'$'+(++index));
}

export async function openGameDatabase({databasePath,databaseUrl}) {
 let query,batch,close;
 if(databaseUrl){
  const {neon}=await import('@neondatabase/serverless');
  const sql=neon(databaseUrl,{fetchOptions:{cache:'no-store'}});
  query=(text,values=[])=>sql.query(postgres(text),values);
  batch=statements=>sql.transaction(statements.map(([text,values=[]])=>sql.query(postgres(text),values)));
  close=()=>{};
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
 await batch(schema.map(text=>[text,[]]));
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
