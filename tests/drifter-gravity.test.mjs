import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../public/roland-home/physics.js';
import {gravityDrift,gravitySurface} from '../public/roland-home/gravity.js';

function scene(){const events=[],e=new Adventure(type=>events.push(type));e.start('moo');e.enemies=[];e.items=[];e.fields=[];e.gates=[];e.vents=[];e.boss=null;e.terrain=[{x:0,w:e.length+300,y:e.floor,baseY:e.floor}];return{e,events};}
function advance(e,seconds,hz=60){for(let i=0;i<seconds*hz;i++)e.update(1/hz);}

test('A damaged gravity device has a slow smooth idle cycle without floor impacts',()=>{
 const {e,events}=scene();advance(e,4);const heights=[],peaks=[];let previous=e.hero.vy;
 for(let i=0;i<600;i++){e.update(1/60);heights.push(e.floor-e.hero.y-e.hero.r);assert.ok(Math.abs(e.hero.vy-previous)<3,'No sharp landing reversal');if(previous<0&&e.hero.vy>=0)peaks.push(e.timer);previous=e.hero.vy;}
 assert.ok(Math.min(...heights)>10);assert.ok(Math.max(...heights)<60);assert.ok(Math.max(...heights)-Math.min(...heights)>15);
 assert.ok(peaks.length>=3);for(let i=1;i<peaks.length;i++)assert.ok(peaks[i]-peaks[i-1]>2.5&&peaks[i]-peaks[i-1]<3.5);
 assert.equal(events.filter(x=>x==='bounce').length,0);
});

test('Boost lifts from a hover and release smoothly returns to the normal band',()=>{
 const {e}=scene();advance(e,4);const rest=e.hero.y;e.keys.boost=true;advance(e,2);assert.ok(e.hero.y<rest-110);e.keys.boost=false;advance(e,4);assert.ok(e.floor-e.hero.y-e.hero.r>10);assert.ok(e.floor-e.hero.y-e.hero.r<60);
 const ordinary=[];for(let i=0;i<180;i++){e.update(1/60);ordinary.push(e.hero.y);}e.potion('bouncy');const spring=[];advance(e,2);for(let i=0;i<180;i++){e.update(1/60);spring.push(e.hero.y);}assert.ok(Math.max(...spring)-Math.min(...spring)>(Math.max(...ordinary)-Math.min(...ordinary))*1.3);
});

test('Only short gaps are supported, and a platform cannot pull Drifter through its underside',()=>{
 const {e}=scene(),y=e.floor;e.terrain=[{x:0,w:200,y},{x:253,w:200,y}];assert.equal(gravitySurface(e.terrain,225).y,y);
 e.terrain[1].x=320;assert.equal(gravitySurface(e.terrain,260),null);e.hero.x=260;e.hero.y=y-60;e.hero.vy=0;advance(e,.4);assert.equal(e.gravitySupport,false);assert.ok(e.hero.y>y-20);
 e.hero.x=100;e.hero.y=y+80;e.hero.vy=10;assert.equal(gravityDrift(e,1/60),false);assert.equal(e.hero.vy,10);
});

test('Unboosted drifting crosses ordinary rises and seams without falling',()=>{
 const {e,events}=scene();e.terrain=[{x:0,w:450,y:e.floor},{x:495,w:300,y:e.floor-70},{x:848,w:300,y:e.floor-30},{x:1183,w:600,y:e.floor}];
 e.setTarget(1600,e.floor-60);advance(e,8);assert.ok(Math.abs(e.hero.x-1600)<5);assert.equal(e.target,null);assert.equal(events.includes('hurt'),false);assert.equal(e.hero.hp,e.hero.maxHp);
});

test('Idle gravity motion is consistent across different display refresh rates',()=>{
 const states=[30,60,120].map(hz=>{const {e}=scene();advance(e,6,hz);return e.hero;});for(const h of states.slice(1)){assert.ok(Math.abs(h.y-states[0].y)<.5);assert.ok(Math.abs(h.vy-states[0].vy)<.5);}
});
