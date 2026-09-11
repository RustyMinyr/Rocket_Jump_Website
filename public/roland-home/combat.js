const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const living=e=>[...e.enemies.filter(t=>!t.dead),...(e.boss?.active&&!e.boss.dead?[e.boss]:[])];
export const playTop=e=>Math.min(e.width<800?330:135,Math.max(75,e.floor-180));
const visible=(e,t)=>t.x-t.r>e.camera+32&&t.x+t.r<e.camera+e.width-32&&t.y-t.r>playTop(e)&&t.y+t.r<e.floor+35;
const reachable=(e,t)=>living(e).includes(t)&&visible(e,t)&&distance(e.hero,t)<Math.min(600,e.width*.68);

export function resetCombat(e){
 e.lockedTarget=null;e.aimTarget=null;e.aimPoint=null;e.aimAngle=0;e.muzzleFlash=0;e.impacts=[];e.targetDwell=0;e.shotsFired=0;
 e.companion={x:e.hero.x-58,y:e.hero.y-72,vx:0,vy:0};
}

export function focusThreat(e,x,y,radius=50){
 const target=living(e).filter(t=>reachable(e,t)&&distance({x,y},t)<t.r+radius)
  .sort((a,b)=>distance({x,y},a)-distance({x,y},b))[0];
 if(!target)return false;
 e.lockedTarget=target;e.aimPoint=null;
 aim(e);return true;
}

export function aim(e){
 const h=e.hero;
 if(e.lockedTarget&&!reachable(e,e.lockedTarget))e.lockedTarget=null;
 const priority=t=>distance(h,t)+((t.x-h.x)*e.facing<-t.r?140:0);
 let target=e.lockedTarget;
 if(!target&&!e.aimPoint){
  target=e.aimTarget&&reachable(e,e.aimTarget)?e.aimTarget:living(e).filter(t=>reachable(e,t))
   .sort((a,b)=>priority(a)-priority(b))[0];
 }
 if(e.aimTarget!==(target||null))e.targetDwell=0;
 e.aimTarget=target||null;
 const point=e.aimPoint||target;
 const origin=weaponOrigin(e);
 e.aimAngle=point?Math.atan2(point.y-origin.y,point.x-origin.x):e.facing>0?0:Math.PI;
}

export function weaponOrigin(e){return e.companion;}
export function muzzle(e){const origin=weaponOrigin(e),reach=19;return{x:origin.x+Math.cos(e.aimAngle)*reach,y:origin.y+Math.sin(e.aimAngle)*reach};}

export function companionStep(e,dt){
 const d=e.companion,h=e.hero,point=e.aimPoint||e.aimTarget;
 const direction=point?Math.sign(point.x-h.x)||e.facing:-e.facing;
 const x=Math.max(e.camera+28,Math.min(e.camera+e.width-28,h.x+direction*68+Math.sin(e.timer*.85)*24));
 const y=Math.max(playTop(e),h.y-72+Math.sin(e.timer*1.8)*18+Math.sin(e.timer*.65)*9);
 // A damped spring gives Dot his own arc through turns, jumps and stops.
 if(distance(d,h)>420){d.x=x;d.y=y;d.vx=0;d.vy=0;}
 d.vx+=((x-d.x)*25-d.vx*8)*dt;d.vy+=((y-d.y)*25-d.vy*8)*dt;
 d.x+=d.vx*dt;d.y+=d.vy*dt;
}

export function shoot(e){
 if(e.state!=='playing'||e.fireCooldown>0)return false;
 e.fireCooldown=e.stats.relic==='pulse'?.42:e.vehicle?.mounted?.5:.72;
 e.muzzleFlash=.085;
 e.shotsFired++;
 const point=muzzle(e),speed=1100;
 e.shots.push({...point,px:point.x,py:point.y,vx:Math.cos(e.aimAngle)*speed,vy:Math.sin(e.aimAngle)*speed,life:.85,r:6,damage:e.stats.attack*2});
 e.emit('fire',point);return true;
}

export function impact(e,x,y,kind='hit',damage=0){
 e.impacts.push({x,y,kind,damage,life:kind==='defeat'?.5:.24,maxLife:kind==='defeat'?.5:.24});
 if(e.impacts.length>36)e.impacts.shift();
 e.emit('impact',{x,y,kind,damage});
}

export function combatStep(e,dt){
 e.muzzleFlash=Math.max(0,e.muzzleFlash-dt);
 for(const p of e.impacts)p.life-=dt;
 e.impacts=e.impacts.filter(p=>p.life>0);
 aim(e);
 companionStep(e,dt);aim(e);
 if(e.aimTarget)e.targetDwell+=dt;else e.targetDwell=0;
 if(e.keys.fire||e.autoFire&&e.aimTarget&&e.targetDwell>=.38&&(e.aimTarget!==e.boss||e.boss.phase==='rest'))shoot(e);
 for(const shot of e.shots){
  if(shot.life<=0)continue;
  shot.px=shot.x;shot.py=shot.y;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;
  const target=living(e).find(t=>distance(shot,t)<t.r+shot.r);
  if(!target)continue;
  shot.life=0;
  if(target===e.boss){
   const hp=target.hp;e.hurtBoss(shot.damage);
   impact(e,shot.x,shot.y,target.hp<hp?'hit':'shield',hp-target.hp);
  }else{
   target.hp-=shot.damage;target.hitTime=.14;
   impact(e,shot.x,shot.y,'hit',shot.damage);
   if(target.hp<=0)e.defeat(target);
  }
 }
 e.shots=e.shots.filter(s=>s.life>0);
}
