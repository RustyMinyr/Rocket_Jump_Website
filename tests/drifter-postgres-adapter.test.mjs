import test from 'node:test';
import assert from 'node:assert/strict';
import {openGameDatabase} from '../lib/drifter-database.mjs';
import {createGameService} from '../lib/roland-account.mjs';

function fakePool() {
 const calls=[];
 let clients=0;
 let rejectText='';
 const run=async(source,text,values)=>{
  calls.push({source,text,values});
  if(rejectText&&text.includes(rejectText))throw Error('Simulated database failure');
  return {rows:text.includes('RETURNING count')?[{count:1}]:text.startsWith('SELECT')?[{id:'player-1'}]:[]};
 };
 return {
  calls,
  setRejectText(value){rejectText=value;},
  async query(text,values){return run('pool',text,values);},
  async connect(){
   const source=`client-${++clients}`;
   return {query:(text,values)=>run(source,text,values),release:()=>calls.push({source,text:'RELEASE'})};
  },
  async end(){calls.push({source:'pool',text:'END'});},
 };
}

test('Coolify PostgreSQL mode uses parameterized SQL and a single client for each transaction',async()=>{
 const pool=fakePool();
 const db=await openGameDatabase({databaseDriver:'pg',databaseUrl:'postgresql://unused.example.test/game',pgPool:pool});
 try{
  assert.equal(pool.calls[0].text,'BEGIN');
  assert.equal(pool.calls[0].source,'client-1');
  assert.ok(pool.calls.some(call=>call.text?.includes('CREATE TABLE IF NOT EXISTS drifter_players')));
  assert.ok(pool.calls.some(call=>call.text?.includes('REFERENCES drifter_players(id)')));
  assert.deepEqual(pool.calls.slice(-2).map(call=>call.text),['COMMIT','RELEASE']);

  const player=await db.one('SELECT players.id FROM sessions JOIN players ON players.id=sessions.player_id WHERE token=? AND expires>?',['secret-token',42]);
  assert.equal(player.id,'player-1');
  assert.deepEqual(pool.calls.at(-1),{
   source:'pool',
   text:'SELECT drifter_players.id FROM drifter_sessions JOIN drifter_players ON drifter_players.id=drifter_sessions.player_id WHERE token=$1 AND expires>$2',
   values:['secret-token',42],
  });

  await db.batch([['INSERT INTO saves(player_id,body,updated) VALUES(?,?,?)',['player-1','{"ok":true}',42]],['DELETE FROM sessions WHERE expires<?',[42]]]);
  const transaction=pool.calls.slice(-5);
  assert.deepEqual(transaction.map(call=>call.text),[
   'BEGIN',
   'INSERT INTO drifter_saves(player_id,body,updated) VALUES($1,$2,$3)',
   'DELETE FROM drifter_sessions WHERE expires<$1',
   'COMMIT',
   'RELEASE',
  ]);
  assert.ok(transaction.every(call=>call.source==='client-2'));
  assert.equal(await db.consumeLimit('ip:example',8),true);
  assert.equal(pool.calls.at(-1).values.length,5);
 }finally{await db.close();}
 assert.equal(pool.calls.at(-1).text,'END');
});

test('Coolify PostgreSQL mode rolls back and releases a failed transaction',async()=>{
 const pool=fakePool();
 const db=await openGameDatabase({databaseDriver:'pg',databaseUrl:'postgresql://unused.example.test/game',pgPool:pool});
 try{
  pool.setRejectText('INSERT INTO drifter_saves');
  await assert.rejects(db.batch([['INSERT INTO saves(player_id) VALUES(?)',['player-1']]]),/Simulated database failure/);
  assert.deepEqual(pool.calls.slice(-4).map(call=>call.text),[
   'BEGIN',
   'INSERT INTO drifter_saves(player_id) VALUES($1)',
   'ROLLBACK',
   'RELEASE',
  ]);
  assert.ok(pool.calls.slice(-4).every(call=>call.source==='client-2'));
 }finally{await db.close();}
});

test('Explicit PostgreSQL configuration fails closed without a URL',async()=>{
 await assert.rejects(openGameDatabase({databaseDriver:'pg',databasePath:'should-not-be-created.sqlite'}),/URL is required/);
 await assert.rejects(openGameDatabase({databaseDriver:'unsupported',databaseUrl:'postgresql://unused.example.test/game'}),/Unsupported/);
 const service=await createGameService({databaseDriver:'pg',databasePath:'should-not-be-created.sqlite',origin:'https://game.test'});
 const status=await (await service.handle(new Request('https://game.test/api/roland/status'))).json();
 assert.equal(status.available,false);
});
