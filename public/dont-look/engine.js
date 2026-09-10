import {WORLDS,POWERS} from './worlds.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class Journey {
 constructor(emit=()=>{},seed=941){this.emit=emit;this.seed=seed;this.width=1100;this.height=680;this.unlocked=0;this.state='title';this.actors=[];this.gaze={x:550,y:200};this.hero={x:550,y:380};this.timer=0;this.hp=100;this.score=0;this.done=0;this.cooldowns={blink:0,slow:0,nova:0};this.effects={shield:0,slow:0,nova:0};}
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296;}
 resize(w,h){const ow=this.width,oh=this.height;this.width=w;this.height=h;this.hero={x:w*.5,y:h*.57};this.gaze.x*=w/ow;this.gaze.y*=h/oh;for(const a of this.actors){a.x*=w/ow;a.y*=h/oh;}}
 start(index,unlocked=0){this.level=clamp(index,0,7);this.world=WORLDS[this.level];this.unlocked=Math.max(unlocked,this.level);this.state='playing';this.hp=100;this.score=0;this.done=0;this.timer=0;this.actors=[];this.spawnTimer=1.8;this.snackTimer=9;this.objectiveAt=0;this.hurtCooldown=0;this.nextId=1;this.swallowed=false;this.eyeProgress=0;this.eyeCooldown=0;this.cooldowns={blink:0,slow:0,nova:0};this.effects={shield:0,slow:0,nova:0};this.gaze={x:this.width*.5,y:this.height*.2};
 if(this.level===4){this.state='landing';this.spawn('planet','planet',0);}
 else if([0,2,3].includes(this.level)){this.spawn(this.world.enemy,'target',-.45);this.spawnTimer=3;}
 else if(this.level===1){['juice','cookie','juice'].forEach((k,i)=>this.spawn(k,'objective',-.9+i*2.1));this.spawn('ufo','threat',2.8);}
 else if(this.level===5){for(let i=0;i<3;i++)this.spawn('crystal','objective',-Math.PI/2+i*2.1);this.spawn('robot','threat',.4);this.spawn('robot','threat',2.7);}
 else if(this.level===6){for(let i=0;i<3;i++)this.spawn('hole','objective',-Math.PI/2+i*2.1);this.spawn('ufo','threat',.3);}
 else if(this.level===7){this.spawn('eye','boss',-Math.PI/2);this.spawnTimer=5;}
 this.emit('start',{world:this.world});}
 spawn(kind,role,angle){const a=angle??(this.random()*Math.PI*2);const rx=this.width*.35,ry=this.height*.31;const x=clamp(this.hero.x+Math.cos(a)*rx,65,this.width-65),y=clamp(this.hero.y+Math.sin(a)*ry,125,this.height-120);const actor={id:this.nextId++,kind,role,x,y,angle:a,phase:this.random()*6,progress:0,charge:0,react:0,watched:false,radius:kind==='planet'?140:kind==='eye'?94:kind==='dino'?55:kind==='hole'?43:37};if(kind==='eye'){actor.x=this.width*.5;actor.y=this.height*.27;}if(kind==='planet'){actor.x=this.width*.5;actor.y=this.height*.32;}this.actors.push(actor);return actor;}
 look(x,y){this.gaze.x=clamp(x,0,this.width);this.gaze.y=clamp(y,0,this.height);}
 watching(a){return Math.hypot(this.gaze.x-a.x,this.gaze.y-a.y)<a.radius+22;}
 power(id){const p=POWERS.find(p=>p.id===id);if(this.state!=='playing'||!p||this.unlocked<p.unlock||this.cooldowns[id]>0)return false;this.cooldowns[id]=p.cooldown;if(id==='blink')this.effects.shield=3;if(id==='slow')this.effects.slow=5;if(id==='nova'){this.effects.nova=.7;for(const a of this.actors)if(['threat','target'].includes(a.role)&&a.react<=0)this.reward(a,false);}this.emit('power',{id});return true;}
 hit(amount){if(this.effects.shield>0||this.hurtCooldown>0)return;this.hp=Math.max(0,this.hp-amount);this.hurtCooldown=1.1;this.emit('hurt',{hp:this.hp});if(this.hp<=0){this.state='lost';this.emit('lost',{});}}
 reward(a,watched=true){if(a.rewarded)return;a.rewarded=true;a.react=1.5;this.score+=a.role==='threat'?80:150;if(['target','objective'].includes(a.role)){this.done++;this.emit('progress',{done:this.done,goal:this.world.goal,kind:a.kind,watched});}else this.emit('caught',{kind:a.kind});
 if(a.kind==='juice'){this.hp=Math.min(100,this.hp+35);this.emit('snack',{kind:'juice'});}if(a.kind==='cookie'){this.hp=Math.min(100,this.hp+20);this.effects.shield=4;this.emit('snack',{kind:'cookie'});}if(this.done>=this.world.goal)this.complete();}
 complete(){if(this.state!=='playing')return;this.state='won';this.score+=Math.round(this.hp*4)+Math.max(0,Math.round(120-this.timer))*5;this.emit('won',{level:this.level,score:this.score,hp:this.hp});}
 update(dt){dt=Math.min(dt,.05);if(!['playing','landing'].includes(this.state))return;this.timer+=dt;
 if(this.state==='landing'){if(this.timer>=2.4){this.state='playing';this.swallowed=true;this.hp=85;this.effects.shield=3;this.actors=[];for(let i=0;i<3;i++)this.spawn('tickle','objective',-Math.PI/2+i*2.1);this.emit('swallowed',{});}return;}
 for(const k of Object.keys(this.cooldowns))this.cooldowns[k]=Math.max(0,this.cooldowns[k]-dt);for(const k of Object.keys(this.effects))this.effects[k]=Math.max(0,this.effects[k]-dt);this.hurtCooldown=Math.max(0,this.hurtCooldown-dt);this.eyeCooldown=Math.max(0,this.eyeCooldown-dt);this.spawnTimer-=dt;this.snackTimer-=dt;
 if(this.snackTimer<=0&&this.level!==4){if(!this.actors.some(a=>a.role==='snack'&&!a.rewarded))this.spawn(this.random()>.5?'juice':'cookie','snack');this.snackTimer=12;}
 const active=this.actors.filter(a=>['target','threat'].includes(a.role)&&a.react<=0&&!a.rewarded);
 if([1,5,6].includes(this.level)){const pending=this.actors.filter(a=>a.role==='objective'&&!a.rewarded).length;if(pending<Math.min(3,this.world.goal-this.done)&&this.timer>(this.objectiveAt||0)){const kind=this.level===1?(this.done%2?'cookie':'juice'):this.level===5?'crystal':'hole';this.spawn(kind,'objective');this.objectiveAt=this.timer+2;}}
 if(this.spawnTimer<=0&&this.level!==4){const target=[0,2,3].includes(this.level);const remaining=this.world.goal-this.done;const limit=target?Math.min(remaining,3):this.level===5?2:2;if(active.length<limit){let kind=this.world.enemy;if(this.level===6)kind=this.random()>.5?'dino':'ufo';this.spawn(kind,target?'target':'threat');}this.spawnTimer=target?2.6:5.5;}
 for(const a of [...this.actors]){if(this.state!=='playing')break;a.watched=this.watching(a);if(a.react>0){a.react-=dt;continue;}if(a.kind==='eye'){const open=this.timer%6<2.6;a.open=open;if(a.watched&&open){a.charge+=dt;if(a.charge>.75){this.hit(20);a.charge=0;}}else a.charge=0;if(a.watched&&!open&&this.eyeCooldown<=0){this.eyeProgress+=dt;if(this.eyeProgress>=.95){this.eyeProgress=0;this.eyeCooldown=3;this.done++;this.score+=250;this.emit('progress',{done:this.done,goal:4,kind:'eye'});if(this.done>=4)this.complete();}}continue;}
 if(['objective','snack'].includes(a.role)){if(a.watched){a.progress+=dt/(a.kind==='hole'?2:a.kind==='tickle'?1.4:a.role==='snack'?.7:1.25);if(a.progress>=1)this.reward(a);}else a.progress=Math.max(0,a.progress-dt*.35);continue;}
 const delta=this.effects.slow>0?dt*.25:dt,dx=this.hero.x-a.x,dy=this.hero.y-a.y,dist=Math.hypot(dx,dy);
 if(a.kind==='robot'){if(a.watched){a.charge+=dt;if(a.charge>=1.1){this.hit(22);a.charge=0;}}else a.charge=Math.max(0,a.charge-dt*2);a.phase+=delta*.6;a.x=clamp(a.x+Math.cos(a.phase)*delta*14,60,this.width-60);a.y=clamp(a.y+Math.sin(a.phase)*delta*14,130,this.height-125);}
 else if(a.watched){a.progress+=dt/(a.kind==='ufo'?1.1:2);if(a.progress>=1)this.reward(a);}
 else {a.progress=Math.max(0,a.progress-dt*.45);const speed=this.level===0?24:this.level===2?53:this.level>=5?59:46;a.x+=dx/(dist||1)*speed*delta;a.y+=dy/(dist||1)*speed*delta;}
 if(dist<75&&!a.rewarded&&!a.watched){this.hit(24);a.x=clamp(this.hero.x-dx/(dist||1)*175,65,this.width-65);a.y=clamp(this.hero.y-dy/(dist||1)*175,130,this.height-125);this.emit('bump',{kind:a.kind});}
 }
 this.actors=this.actors.filter(a=>!(a.react<=0&&(a.rewarded||a.role==='threat'&&Math.hypot(a.x-this.hero.x,a.y-this.hero.y)<75)));
 }
 snapshot(){return{state:this.state,level:this.level,hp:this.hp,score:this.score,done:this.done,goal:this.world?.goal,timer:this.timer,unlocked:this.unlocked,gaze:{...this.gaze},cooldowns:{...this.cooldowns},effects:{...this.effects},swallowed:this.swallowed,actors:this.actors.map(a=>({id:a.id,kind:a.kind,role:a.role,x:a.x,y:a.y,radius:a.radius,progress:a.progress,react:a.react,open:a.open,charge:a.charge,rewarded:!!a.rewarded}))};}
}
