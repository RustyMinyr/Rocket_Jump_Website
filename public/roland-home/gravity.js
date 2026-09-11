export function gravitySurface(terrain,x){
 const base=terrain.filter(t=>!t.floating);
 const surface=base.filter(t=>x>=t.x&&x<=t.x+t.w).sort((a,b)=>a.y-b.y)[0];
 if(surface)return surface;
 const left=base.filter(t=>t.x+t.w<x).sort((a,b)=>(b.x+b.w)-(a.x+a.w))[0];
 const right=base.filter(t=>t.x>x).sort((a,b)=>a.x-b.x)[0];
 if(!left||!right)return null;
 const end=left.x+left.w,gap=right.x-end;
 if(gap>65)return null;
 return {y:left.y+(right.y-left.y)*(x-end)/gap,spring:!!(left.spring||right.spring)};
}

// Real launch-and-land cycles retain platforming timing. Scaling both speed and
// gravity gives 84% of the original height and 145% of the original airtime.
export function deviceGravity(e){return e.planet.gravity*.4;}
export function bounceSpeed(e,surface={}){
 let speed=e.planet.bounce*.58*e.stats.bounce;
 if(e.effects.grow>0)speed*=.91;
 if(e.effects.shrink>0)speed*=1.04;
 if(e.effects.bouncy>0||surface.spring)speed*=1.4;
 if(e.keys.boost)speed*=1.18;
 return Math.min(speed,638);
}
