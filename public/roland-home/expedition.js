import {stageNames,savedStage} from './data.js';

export function buildExpedition(e){
 const p=e.planet,y=e.floor,span=e.length/5;
 e.stage=0;e.stageLength=span;e.stages=stageNames(p);e.fields=[];e.gates=[];e.vents=[];e.caches=[];e.signals=[];e.vehicle=null;e.target=null;e.autoFire=true;e.grounded=false;e.activeField=false;e.seenStages=new Set([0]);e.dashCooldown=0;
 const platform=(x,w,top=y,extra={})=>e.terrain.push({x,w,y:top,baseY:top,moving:false,...extra});
 const pickup=(kind,x,id,extra={})=>{const surface=e.terrain.filter(t=>x>=t.x&&x<=t.x+t.w).sort((a,b)=>a.y-b.y)[0];e.items.push({id,kind,x,y:(surface?.baseY??y)-65,got:false,...extra});};
 for(let stage=0;stage<5;stage++){
  const start=stage*span,stride=(span-650)/11;
  platform(start-40,540);
  for(let i=0;i<11;i++){
   const x=start+460+i*stride,top=y-[0,30,55,15,65,0,40,20,70,35,0][(i+p.seed+stage*2)%11];
   const fieldZone=x>start+span*.31&&x<start+span*.53;
   platform(x,stride-(fieldZone||p.vehicle==='rover'?0:35+(i%3)*9),fieldZone||p.vehicle==='rover'?y:top,{moving:!fieldZone&&p.vehicle!=='rover'&&p.moving&&i%4===2,phase:i+stage,spring:!fieldZone&&['forest','mushroom','jelly'].includes(p.biome)&&i%4===0});
   if(!fieldZone&&(i+stage+p.seed)%4===2)platform(x+12,120,top-105,{floating:true});
  }
  platform(start+span-230,280);
  // Every field has continuous ground; a gravity lock cannot strand the player in a gap.
  const fx=start+span*.34;platform(fx-60,span*.2+120);e.fields.push({x:fx,w:span*.17,stage});
  const gx=start+span*.59;platform(gx-160,350);e.gates.push({x:gx,w:34,stage,period:6.8+(p.seed%3)*.4,offset:stage*1.7+p.seed*.31,open:false,remaining:0,warning:false});
  for(let i=0;i<8;i++)pickup(['juice','grow','cookie','shrink','bouncy','juice','cookie','juice'][i],start+240+i*(span-650)/8,'supply-'+stage+'-'+i);
  for(let i=0;i<6;i++)pickup('shard',start+380+i*(span-650)/6,'shard-'+(stage*6+i),{got:e.profile.claims.includes('shard:'+e.id+':'+(stage*6+i))});
  const cx=start+span*.76;pickup('cache',cx,'cache-'+stage,{got:e.profile.claims.includes('cache:'+e.id+':'+stage),requires:p.cavern&&stage%2===1?'shrink':null});
  if(p.cavern&&stage%2===1)pickup('shrink',cx-100,'tunnel-potion-'+stage);
  if(stage===1||stage===3){const x=start+span*.66;platform(x-110,230);e.vents.push({x,w:70,stage,period:5.6,offset:p.seed*.2+stage,phase:'idle',remaining:0});}
  if(stage<3)pickup('signal',start+span*.86,'signal-'+stage,{got:e.profile.claims.includes('signal:'+e.id+':'+stage)});
  for(let i=0;i<5;i++){
   const x=start+750+i*(span-1200)/5,baseY=(e.platformAt(x)?.baseY??y)-(p.enemy==='dragon'?130:24),hp=p.enemy==='dragon'?55:p.enemy==='pirate'?38:22;
   e.enemies.push({id:stage*5+i,x,baseX:x,y:baseY,baseY,r:p.enemy==='dino'?35:p.enemy==='dragon'?40:25,kind:p.enemy,phase:i+stage,hp,maxHp:hp,cooldown:2+i*.37,hitTime:0});
  }
 }
 pickup('part',span*2.82,'part',{got:e.hasPart});
 if(p.gear)pickup('gear',p.boss?e.length-180:span*3.82,'gear',{gear:p.gear,got:e.profile.gear.includes(p.gear),bossLocked:!!p.boss});
 // A broad, stable arena keeps both mobile steering and boss tells readable.
 if(p.boss){e.terrain=e.terrain.filter(t=>t.x<e.length-950);platform(e.length-950,1150);e.fields=e.fields.filter(f=>f.x<e.length-1000);e.gates=e.gates.filter(g=>g.x<e.length-1000);const hp={golem:140,captain:185,dragon:240}[p.boss];e.boss={kind:p.boss,name:{golem:'THE QUARTZ COMPLAINT',captain:'CAPTAIN BARNACLE',dragon:'THE STARWYRM'}[p.boss],x:e.length-400,y:y-135,r:75,hp,maxHp:hp,active:false,dead:false,phase:'warning',phaseTime:0,cycle:0,invulnerable:0,targetX:e.length-750,targetY:y-100};}
 if(p.vehicle){platform(430,420);e.vehicle={kind:p.vehicle,x:610,y:y-38,mounted:false};}
 e.resumeStage=e.profile.completed.includes(e.id)?0:savedStage(e.profile,e.id);
}

export function restoreStage(e,index){
 const stage=Math.max(0,Math.min(4,index));e.stage=stage;e.hero.x=stage*e.stageLength+90;e.hero.y=e.floor-100;e.hero.vx=0;e.hero.vy=0;e.hero.hp=e.hero.maxHp;e.checkpoint=e.hero.x;e.shield=2;e.target=null;
 for(let i=0;i<=stage;i++)e.seenStages.add(i);
 e.camera=Math.max(0,e.hero.x-e.width*.35);
 if(stage>0&&e.vehicle){e.vehicle.x=e.hero.x+160;e.vehicle.y=e.floor-38;e.vehicle.mounted=false;}
}

export function expeditionStep(e,dt){
 const h=e.hero,stage=Math.min(4,Math.floor(Math.max(0,h.x)/e.stageLength));
 if(stage!==e.stage){e.stage=stage;if(!e.seenStages.has(stage)){e.seenStages.add(stage);e.checkpoint=stage*e.stageLength+90;h.hp=Math.min(h.maxHp,h.hp+30);e.emit('stage',{stage,name:e.stages[stage]});}}
 const field=e.fields.find(f=>h.x>=f.x&&h.x<=f.x+f.w);
 if(!!field!==e.activeField){e.activeField=!!field;e.emit('field',{active:!!field});}
 for(const g of e.gates){const phase=(e.timer+g.offset)%g.period;g.open=phase>g.period*.5;g.warning=!g.open&&phase>g.period*.5-.85;g.remaining=g.open?g.period-phase:g.period*.5-phase;}
 for(const v of e.vents){const phase=(e.timer+v.offset)%v.period;v.phase=phase<3.4?'idle':phase<4.5?'warning':'active';v.remaining=phase<3.4?3.4-phase:phase<4.5?4.5-phase:v.period-phase;if(v.phase==='active'&&Math.abs(h.x-v.x)<v.w/2+h.r&&h.y+h.r>e.floor-250)e.hit(18,e.planet.hazard==='lava'?'fire':'projectile');}
 e.dashCooldown=Math.max(0,e.dashCooldown-dt);
}

export function movementMode(e){if(e.vehicle?.mounted)return e.vehicle.kind;if(e.activeField)return'walk';if(e.planet.biome==='water')return'swim';if(e.planet.flight||e.stats.relic==='jet')return'fly';if(e.stats.relic==='anchor')return'walk';return'bounce';}

export function drawExpedition(c,e,images,time){
 const f=e.floor,cam=e.camera,visible=x=>x>cam-250&&x<cam+e.width+250;
 for(const field of e.fields){if(field.x+field.w<cam||field.x>cam+e.width)continue;const grad=c.createLinearGradient(0,f-260,0,f);grad.addColorStop(0,'#72dde000');grad.addColorStop(1,'#72dde027');c.fillStyle=grad;c.fillRect(field.x,f-260,field.w,260);c.strokeStyle='#a1f5e766';c.lineWidth=1;for(let x=field.x;x<field.x+field.w;x+=45){c.beginPath();c.moveTo(x,f-180);c.lineTo(x,f-30);c.lineTo(x-4,f-38);c.stroke();}c.fillStyle='#b5f8ef';c.font='11px monospace';c.textAlign='center';c.fillText('GRAVITY FIELD · WALK',field.x+field.w/2,f-220);}
 for(const g of e.gates){if(!visible(g.x))continue;c.fillStyle=g.open?'#88f3ca':'#f89bc1';c.shadowColor=c.fillStyle;c.shadowBlur=g.open?0:12;c.fillRect(g.x-12,f-365,10,365);c.fillRect(g.x+g.w+2,f-365,10,365);c.fillRect(g.x-12,f-370,g.w+24,8);if(!g.open){c.globalAlpha=g.warning?.3+Math.sin(time*18)*.2:.55;c.fillRect(g.x,f-355,g.w,355);c.globalAlpha=1;}c.shadowBlur=0;c.font='bold 11px monospace';c.textAlign='center';c.fillText(g.open?'OPEN · '+g.remaining.toFixed(1)+'s':'WAIT · '+g.remaining.toFixed(1)+'s',g.x+g.w/2,f-385);}
 for(const v of e.vents){if(!visible(v.x))continue;c.fillStyle=v.phase==='active'?'#fb7bab99':v.phase==='warning'?'#ffe1a04d':'#abccdf22';c.fillRect(v.x-v.w/2,f-9,v.w,9);if(v.phase!=='idle'){c.fillStyle=v.phase==='active'?'#ff83b477':'#ffe2a21a';c.fillRect(v.x-v.w/2,f-250,v.w,250);c.textAlign='center';c.font='11px monospace';c.fillStyle='#ffe3d8';c.fillText(v.phase==='warning'?'VENT · '+v.remaining.toFixed(1)+'s':'KEEP CLEAR',v.x,f-270);}}
 for(let i=1;i<5;i++){const x=i*e.stageLength+40;if(!visible(x))continue;c.strokeStyle='#fdb4df';c.lineWidth=3;c.beginPath();c.ellipse(x,f-72,31,70,0,Math.PI,Math.PI*2);c.stroke();c.font='12px monospace';c.fillStyle='#fce5f4';c.textAlign='left';c.fillText('0'+(i+1)+' / '+e.stages[i].toUpperCase(),x-25,f-165);}
 if(e.planet.cavern){c.fillStyle='#100d1de8';c.beginPath();c.moveTo(cam,0);c.lineTo(cam+e.width,0);for(let x=cam+e.width;x>=cam;x-=38)c.lineTo(x,90+Math.sin(x*.012)*25+(Math.floor(x/38)%3)*18);c.closePath();c.fill();}
 if(e.vehicle&&!e.vehicle.mounted&&visible(e.vehicle.x)){const v=e.vehicle,img=images[v.kind==='ship'?'drifter-ship':'drifter-rover'];if(img)c.drawImage(img,v.x-85,v.y-75,170,110);c.fillStyle='#eaf7f6';c.textAlign='center';c.font='12px monospace';c.fillText(v.kind==='ship'?'ABANDONED SHIP':'ABANDONED LUNAR LANDER',v.x,v.y-96);}
 if(e.target){c.save();c.strokeStyle='#f6b5d6';c.setLineDash([4,6]);c.lineWidth=2;const y=['fly','swim','ship'].includes(movementMode(e))?e.target.y:(e.platformAt(e.target.x)?.y??f)-15;c.beginPath();c.ellipse(e.target.x,y,18+Math.sin(time*5)*3,8,0,0,Math.PI*2);c.stroke();c.restore();}
}
