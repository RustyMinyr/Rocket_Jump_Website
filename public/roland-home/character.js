export function drawSuit(ctx,images,suit,x,y,height,tilt=0){const image=images['suit-'+suit];if(!image)return;const width=height*image.width/image.height;ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();}

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
 for(const shot of [...engine.shots,...engine.enemyShots]){ctx.save();ctx.shadowBlur=14;ctx.fillStyle=shot.kind==='fire'?'#ff9a51':shot.kind==='cannon'?'#f7b2d0':shot.kind==='crystal'?'#c6a5ff':engine.stats.suit==='crystal'?'#e6c4ff':'#a5f5f0';ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(shot.x,shot.y,shot.r,0,Math.PI*2);ctx.fill();ctx.restore();}
 if(engine.planet.hazard==='lava'){ctx.fillStyle='#ef70394f';ctx.fillRect(engine.camera,engine.floor+70,engine.width,engine.height-engine.floor);for(let i=0;i<8;i++){const x=engine.camera+i*engine.width/8,y=engine.floor+80+Math.sin(time*2+i)*14;ctx.fillStyle='#ffc26788';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();}}
}
