import test from 'node:test';
import assert from 'node:assert/strict';
import {GameInsights} from '../public/roland-home/insights.js';

test('Opting out during an in-flight heartbeat sends a final inactive update',async()=>{
 const updates=[];let release;
 const metrics=Object.assign(Object.create(GameInsights.prototype),{
  enabled:true,planet:'moo',attempt:'attempt',done:false,engine:{stage:0},
  session:{visit:'visit',token:'token'},queue:[],seq:0,busy:false,pendingFlush:false,
  storage:{setItem(){}},active(){return this.enabled;},
  async request(action,body){updates.push({action,...body});if(updates.length===1)await new Promise(resolve=>{release=resolve;});return{ok:true};},
 });
 const initial=metrics.flush();metrics.setEnabled(false);release();await initial;
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(updates.length,2);assert.equal(updates[0].active,true);
 assert.equal(updates[1].active,false);assert.equal(updates[1].events[0].kind,'planet_exit');
 assert.equal(metrics.queue.length,0);assert.equal(metrics.busy,false);
});

test('Analytics transport failures leave gameplay running and queue bounded',async()=>{
 const engine={state:'playing',stage:1},metrics=Object.assign(Object.create(GameInsights.prototype),{
  enabled:true,planet:'ice',attempt:'attempt',done:false,engine,
  session:{visit:'visit',token:'token'},queue:Array.from({length:96},()=>({kind:'stage_enter'})),
  seq:0,busy:false,pendingFlush:false,active(){return true;},async request(){throw Error('Offline');},
 });
 await metrics.flush();assert.equal(engine.state,'playing');assert.equal(metrics.queue.length,96);
 assert.ok(metrics.retryAt>Date.now());assert.equal(metrics.busy,false);
});
