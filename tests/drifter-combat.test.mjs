import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../public/roland-home/physics.js';
import {combatStep,focusThreat,muzzle} from '../public/roland-home/combat.js';
import {drawSuit} from '../public/roland-home/character.js';

const foe=(x,y,id=100)=>({id,x,y,baseX:x,baseY:y,r:25,hp:10000,maxHp:10000,dead:false,kind:'pirate',phase:0,cooldown:10,hitTime:0});
function fixture(width=680){const events=[],e=new Adventure((type,data)=>events.push({type,...data}));e.resize(width,900);e.start('moo');e.hero.x=280;e.hero.y=e.floor-28;e.enemies=[];e.boss=null;return{e,events};}
function tick(e,seconds){for(let t=0;t<seconds;t+=1/180){e.timer+=1/180;e.fireCooldown=Math.max(0,e.fireCooldown-1/180);combatStep(e,1/180);}}

test('Dot waits for a fully visible nearby target, acquires it, then fires at a calmer pace',()=>{
 const {e,events}=fixture();e.enemies=[foe(700,e.hero.y)];tick(e,2);assert.equal(events.filter(x=>x.type==='fire').length,0);
 e.enemies[0].x=600;tick(e,.25);assert.equal(events.filter(x=>x.type==='fire').length,0);
 tick(e,.16);assert.equal(events.filter(x=>x.type==='fire').length,1);
 tick(e,1.3);assert.equal(events.filter(x=>x.type==='fire').length,2);
 e.enemies[0].x=700;tick(e,1);assert.equal(events.filter(x=>x.type==='fire').length,2);
});

test('Tap focus chooses Dot’s target without cancelling travel or changing Drifter’s facing',()=>{
 const {e,events}=fixture();e.facing=1;e.setTarget(650,e.hero.y);e.enemies=[foe(430,e.hero.y,1),foe(190,e.hero.y,2)];
 const destination={...e.target};assert.equal(focusThreat(e,190,e.hero.y),true);assert.equal(e.lockedTarget,e.enemies[1]);assert.deepEqual(e.target,destination);assert.equal(e.facing,1);
 tick(e,.45);const shot=events.find(x=>x.type==='fire');assert.ok(shot);assert.ok(Math.hypot(shot.x-e.hero.x,shot.y-e.hero.y)>35);assert.equal(e.facing,1);
 const lastMuzzle=muzzle(e);assert.ok(Math.hypot(lastMuzzle.x-e.companion.x,lastMuzzle.y-e.companion.y)>18);
});

test('Dot drifts independently at rest, follows turns gradually and resizes with the world',()=>{
 const {e}=fixture();e.autoFire=false;const offsets=[];for(let i=0;i<12;i++){tick(e,.4);offsets.push(e.companion.y-e.hero.y);}
 assert.ok(Math.max(...offsets)-Math.min(...offsets)>20);
 const old=e.companion.x;e.hero.x+=120;e.facing=-1;tick(e,1/180);assert.ok(Math.abs(e.companion.x-old)<3);
 const relative=e.companion.y-e.hero.y;e.resize(680,1100);assert.ok(Math.abs(e.companion.y-e.hero.y-relative)<.001);
});

test('A consumed pulse hits one target, and dead enemies cannot fire or reward twice',()=>{
 const {e,events}=fixture(1100);e.autoFire=false;const enemy=foe(420,e.hero.y,1);enemy.hp=1;e.enemies=[enemy];
 e.boss={...foe(420,e.hero.y),active:true,phase:'rest',invulnerable:0};
 e.shots=[{x:420,y:e.hero.y,vx:0,vy:0,r:6,life:1,damage:32}];combatStep(e,1/180);
 assert.equal(enemy.dead,true);assert.equal(e.boss.hp,10000);e.defeat(enemy);assert.equal(events.filter(x=>x.type==='foe').length,1);
 e.boss=null;enemy.cooldown=0;enemy.x=e.hero.x;enemy.y=e.hero.y;e.shield=0;const hp=e.hero.hp;e.step(1/180);assert.equal(e.hero.hp,hp);assert.equal(e.enemyShots.length,0);
});

test('Suit rendering flips from its right-facing source only when travelling left',()=>{
 const scales=[],ctx={save(){},restore(){},translate(){},rotate(){},scale(x,y){scales.push([x,y]);},drawImage(){}};
 const images={'suit-starter':{width:300,height:500}};
 drawSuit(ctx,images,'starter',100,200,100,0,1);drawSuit(ctx,images,'starter',100,200,100,0,-1);
 assert.deepEqual(scales,[[1,1],[-1,1]]);
});

test('A short landscape phone retains space for companion flight, aiming and automatic fire',()=>{
 const {e,events}=fixture();e.resize(680,382);e.hero.y=e.floor-28;e.enemies=[foe(540,e.hero.y)];
 e.setTarget(450,20);assert.ok(e.target.y<e.floor-80);tick(e,1.2);
 assert.ok(events.some(x=>x.type==='fire'));assert.ok(e.companion.y<e.floor-30);
});
