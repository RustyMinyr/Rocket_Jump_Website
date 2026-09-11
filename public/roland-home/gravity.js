const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

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

// The damaged device follows nearby ground with a slow oscillating spring.
// It can bridge the world's short platform seams, but cannot support Drifter over an open void.
export function gravityDrift(e,dt){
 const h=e.hero,p=e.planet,direction=Math.abs(h.vx)>15?Math.sign(h.vx):0;
 const surface=gravitySurface(e.terrain,h.x);
 if(!surface||h.y+h.r>surface.y+18){e.gravitySupport=false;return false;}
 const ahead=direction?gravitySurface(e.terrain,h.x+direction*clamp(Math.abs(h.vx)*.4,70,125)):null;
 const supportY=ahead?Math.min(surface.y,ahead.y):surface.y;
 const period=clamp(2.8*Math.sqrt(1400/p.gravity),2.5,3.9),phase=e.timer*Math.PI*2/period;
 let clearance=clamp(p.bounce*p.bounce/(2*p.gravity)*.24,28,60)*e.stats.bounce;
 let amplitude=clamp(clearance*.38,12,22);
 if(e.effects.bouncy>0||surface.spring){clearance+=28;amplitude*=1.7;}
 if(e.keys.boost){clearance+=145;amplitude*=.55;}
 if(e.effects.grow>0)clearance*=.91;
 if(e.effects.shrink>0)clearance*=1.04;
 const goalY=supportY-h.r-clearance-Math.sin(phase)*amplitude;
 const acceleration=clamp((goalY-h.y)*30-h.vy*9,-650,650);
 h.vy+=acceleration*dt;e.gravitySupport=true;e.gravityPeriod=period;
 return true;
}
