import {muzzle} from './combat.js';

// The corrected suit artwork faces right. Flip the whole character around its feet.
export function drawSuit(ctx,images,suit,x,y,height,tilt=0,facing=1){const image=images['suit-'+suit];if(!image)return;const width=height*image.width/image.height;ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(facing<0?-1:1,1);ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();}

// Both vehicle source images have their cockpit/nose on the left.
export function drawVehicle(ctx,images,kind,x,y,facing=1,height=100){
 const image=images[kind==='ship'?'drifter-ship':'drifter-rover'];if(!image)return;
 ctx.save();ctx.translate(x,y);ctx.scale(facing>0?-1:1,1);ctx.drawImage(image,-85,-height/2,170,height);ctx.restore();
}

export function drawCompanion(ctx,engine,images,time){
 const d=engine.companion;if(!d)return;
 const target=engine.aimTarget;
 if(target){
  const radius=target.r+12,locked=target===engine.lockedTarget;
  ctx.save();ctx.translate(target.x,target.y);ctx.strokeStyle=locked?'#ff84ce':'#b8edecaa';ctx.lineWidth=2;
  for(let i=0;i<4;i++){const angle=i*Math.PI/2+time*.3;ctx.beginPath();ctx.arc(0,0,radius,angle,angle+.48);ctx.stroke();}
  ctx.restore();
 }
 ctx.save();ctx.translate(d.x,d.y);
 const facing=Math.cos(engine.aimAngle)>=0?1:-1;
 const tilt=target||engine.aimPoint?Math.atan2(Math.sin(engine.aimAngle),Math.abs(Math.cos(engine.aimAngle)))*.24:Math.sin(time*1.6)*.12;
 ctx.rotate(tilt);ctx.scale(facing,1);
 const img=images.dot;if(img)ctx.drawImage(img,-23,-23,46,46);
 ctx.restore();
 if(engine.muzzleFlash>0){
  const m=muzzle(engine),r=8+engine.muzzleFlash*65;
  ctx.save();ctx.translate(m.x,m.y);ctx.rotate(engine.aimAngle);ctx.shadowColor='#ff73c7';ctx.shadowBlur=22;
  ctx.fillStyle='#ffd9f2';ctx.beginPath();ctx.ellipse(0,0,r*1.5,r*.6,0,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 for(const p of engine.impacts){
  const progress=1-p.life/p.maxLife,color=p.kind==='shield'?'#c1b5ff':p.kind==='defeat'?'#ff9fda':'#f4c9f0';
  ctx.save();ctx.globalAlpha=1-progress;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;
  const count=p.kind==='defeat'?10:6;
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count,r=6+progress*(p.kind==='defeat'?58:28);ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r);ctx.lineTo(p.x+Math.cos(a)*(r+6),p.y+Math.sin(a)*(r+6));ctx.stroke();}
  if(p.kind==='shield'){ctx.beginPath();ctx.arc(p.x,p.y,10+progress*20,0,Math.PI*2);ctx.stroke();}
  if(p.damage>0){ctx.textAlign='center';ctx.font='bold 13px monospace';ctx.fillText(Math.round(p.damage),p.x,p.y-16-progress*22);}
  ctx.restore();
 }
}

export function drawCombat(ctx,engine,images,time){
 const boss=engine.boss;
 if(boss?.active&&!boss.dead){
  if(boss.phase==='warning'){
   ctx.fillStyle=boss.kind==='dragon'?'#ff884a28':'#d9b7ff25';ctx.strokeStyle='#ffc5ca';ctx.lineWidth=2;ctx.setLineDash([8,8]);
   if(boss.kind==='captain'){
    const angle=Math.atan2(boss.targetY-boss.y,boss.targetX-boss.x),reach=780;ctx.beginPath();ctx.moveTo(boss.x,boss.y);ctx.lineTo(boss.x+Math.cos(angle-.2)*reach,boss.y+Math.sin(angle-.2)*reach);ctx.lineTo(boss.x+Math.cos(angle+.2)*reach,boss.y+Math.sin(angle+.2)*reach);ctx.closePath();ctx.fill();ctx.stroke();
   }else for(const x of boss.kind==='dragon'?[boss.targetX-130,boss.targetX,boss.targetX+130]:[boss.targetX-70,boss.targetX+70]){ctx.fillRect(x-32,engine.floor-500,64,500);ctx.strokeRect(x-32,engine.floor-180,64,180);}
   ctx.setLineDash([]);
  }
  const image=images[boss.kind==='captain'?'captain':boss.kind==='dragon'?'dragon':'ice-dragon'],size=boss.kind==='captain'?145:220;
  ctx.save();ctx.translate(boss.x,boss.y);ctx.shadowBlur=boss.phase==='rest'?30:0;ctx.shadowColor='#fff0ac';if(boss.invulnerable>0)ctx.globalAlpha=.6;if(image)ctx.drawImage(image,-size/2,-size/2,size,size);ctx.restore();
 }
 for(const shot of [...engine.shots,...engine.enemyShots]){ctx.save();ctx.shadowBlur=14;ctx.fillStyle=shot.kind==='fire'?'#ff9a51':shot.kind==='cannon'?'#f7b2d0':shot.kind==='crystal'?'#c6a5ff':'#ff83d2';ctx.shadowColor=ctx.fillStyle;if(!shot.kind){const angle=Math.atan2(shot.vy,shot.vx);ctx.strokeStyle='#ff83d2aa';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(shot.x-Math.cos(angle)*27,shot.y-Math.sin(angle)*27);ctx.lineTo(shot.x,shot.y);ctx.stroke();ctx.fillStyle='#fff1fb';}ctx.beginPath();ctx.arc(shot.x,shot.y,shot.r,0,Math.PI*2);ctx.fill();ctx.restore();}
 if(engine.planet.hazard==='lava'){ctx.fillStyle='#ef70394f';ctx.fillRect(engine.camera,engine.floor+70,engine.width,engine.height-engine.floor);for(let i=0;i<8;i++){const x=engine.camera+i*engine.width/8,y=engine.floor+80+Math.sin(time*2+i)*14;ctx.fillStyle='#ffc26788';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();}}
}
