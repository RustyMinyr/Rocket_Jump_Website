import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../public/roland-home/physics.js';
import {PLANETS} from '../public/roland-home/data.js';

function scene(id='moo'){const events=[],e=new Adventure(type=>events.push({type,time:e.timer}));e.start(id);e.enemies=[];e.items=[];e.fields=[];e.gates=[];e.vents=[];e.boss=null;e.terrain=[{x:0,w:e.length+300,y:e.floor,baseY:e.floor}];return{e,events};}
function advance(e,seconds,hz=60){for(let i=0;i<seconds*hz;i++)e.update(1/hz);}
function apices(e,seconds=6){const heights=[];for(let i=0;i<seconds*60;i++){e.update(1/60);heights.push(e.floor-e.hero.y-e.hero.r);}return heights;}

test('The default bounce reaches almost the original height with longer full rise-and-land cycles',()=>{
 const {e,events}=scene();advance(e,3);events.length=0;const heights=apices(e);
 const original=PLANETS.moo.bounce**2/(2*PLANETS.moo.gravity);
 assert.ok(Math.max(...heights)>original*.8&&Math.max(...heights)<original*.87);
 assert.ok(Math.min(...heights)<2,'Each bounce reaches the ground');
 const contacts=events.filter(x=>x.type==='bounce');assert.ok(contacts.length>=4);
 for(let i=1;i<contacts.length;i++)assert.ok(contacts[i].time-contacts[i-1].time>1.17&&contacts[i].time-contacts[i-1].time<1.25);
});

test('Boost and spring potions strengthen the next launch instead of creating a hover',()=>{
 const {e}=scene();advance(e,3);const normal=Math.max(...apices(e));e.keys.boost=true;advance(e,2);const boosted=apices(e);assert.ok(Math.max(...boosted)>normal*1.3);assert.ok(Math.min(...boosted)<3);
 e.keys.boost=false;e.potion('bouncy');advance(e,2);const spring=apices(e);assert.ok(Math.max(...spring)>normal*1.8);assert.ok(Math.min(...spring)<4);
});

test('The device cannot lift through a platform underside or hover over a wide void',()=>{
 const {e}=scene();e.terrain=[{x:0,w:200,y:e.floor},{x:420,w:200,y:e.floor}];e.hero.x=300;e.hero.y=e.floor-60;e.hero.vy=0;advance(e,.5);assert.ok(e.hero.y>e.floor);
 e.hero.x=100;e.hero.y=e.floor+20;e.hero.vy=10;advance(e,.1);assert.ok(e.hero.vy>10);assert.ok(e.hero.y>e.floor+20);
});

test('A repair stops automatic bouncing, allows a deliberate jump and expires after five playing seconds',()=>{
 const {e,events}=scene();e.hero.y=e.floor-e.hero.r;e.hero.vy=0;e.potion('repair');advance(e,1);assert.equal(e.mode(),'walk');assert.equal(e.hero.y,e.floor-e.hero.r);assert.equal(e.hero.vy,0);
 e.keys.boost=true;advance(e,.2);assert.ok(e.hero.y<e.floor-e.hero.r-40);e.keys.boost=false;
 const remaining=e.effects.repair;e.state='paused';advance(e,10);assert.equal(e.effects.repair,remaining);e.state='playing';advance(e,remaining+.2);assert.equal(e.effects.repair,0);assert.equal(e.mode(),'bounce');advance(e,1.5);assert.ok(events.some(x=>x.type==='bounce'&&x.time>5));
 e.potion('repair');advance(e,2);e.potion('repair');assert.equal(e.effects.repair,5);
});

test('Repairs are collectible and ocean, gravity worlds, flight and vehicles retain their movement',()=>{
 const a=new Adventure();a.start('moo');const item=a.items.find(i=>i.kind==='repair');assert.ok(item);a.hero.x=item.x;a.hero.y=item.y;a.update(1/180);assert.ok(item.got);assert.equal(a.mode(),'walk');assert.equal(a.effects.repair,5);
 for(const id of ['city','scrap']){const {e}=scene(id);advance(e,3);assert.equal(e.mode(),'walk');assert.equal(e.hero.vy,0);assert.equal(e.hero.y,e.floor-e.hero.r);}
 for(const [id,expected]of [['ocean','swim'],['barnacle','swim'],['aerie','fly']]){const {e}=scene(id);e.potion('repair');assert.equal(e.mode(),expected);if(expected==='swim'){e.activeField=true;assert.equal(e.mode(),'swim');}}
 const {e}=scene('driftport');e.vehicle.mounted=true;e.potion('repair');assert.equal(e.mode(),'ship');
});

test('A stronger bounce can reach raised floating pickups, and frame rates retain the same cycle',()=>{
 const {e}=scene();e.terrain.push({x:300,w:200,y:e.floor-105,floating:true});e.hero.x=350;e.keys.boost=true;e.items=[{kind:'shard',id:'shard-0',x:350,y:e.floor-170,got:false}];advance(e,3);assert.ok(e.items[0].got);
 const states=[30,60,120].map(hz=>{const {e}=scene();advance(e,6,hz);return e;});for(const e of states.slice(1)){assert.equal(e.bounces,states[0].bounces);assert.ok(Math.abs(e.hero.y-states[0].hero.y)<4);assert.ok(Math.abs(e.gravityPeriod-states[0].gravityPeriod)<.01);}
});

test('A fall recovers above the highest solid checkpoint surface with a full bounce',()=>{const {e}=scene('ice');e.checkpoint=500;e.terrain=[{x:400,w:300,y:e.floor},{x:440,w:140,y:e.floor-60},{x:460,w:100,y:e.floor-165,floating:true}];e.hero.x=900;e.hero.y=e.floor+160;e.hero.vy=50;e.update(1/180);assert.equal(e.hero.x,500);assert.equal(e.hero.y,e.floor-60-e.hero.r);assert.ok(e.hero.vy<-300);});
