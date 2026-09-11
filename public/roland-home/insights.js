const KEY='drifter-gameplay-stats';
export class GameInsights{
 constructor(engine,storage){this.engine=engine;this.storage=storage;this.enabled=this.get(KEY)!=='off'&&navigator.doNotTrack!=='1'&&!navigator.globalPrivacyControl;this.visitor=this.get(KEY+'.visitor')||crypto.randomUUID();this.set(KEY+'.visitor',this.visitor);this.session=null;this.queue=[];this.seq=0;this.busy=false;this.pendingFlush=false;this.leaving=false;this.attempt=null;this.planet=null;this.done=true;this.lastActive=false;this.lastSent=0;this.retryAt=0;
  setInterval(()=>this.watch(),1000);document.addEventListener('visibilitychange',()=>this.flush());window.addEventListener('pagehide',()=>{this.leaving=true;this.flush(true);});window.addEventListener('pageshow',()=>{this.leaving=false;});window.addEventListener('error',()=>this.event('error',{value:'runtime'}));window.addEventListener('unhandledrejection',()=>this.event('error',{value:'runtime'}));
 }
 get(k){try{return this.storage.getItem(k);}catch{return null;}}
 set(k,v){try{this.storage.setItem(k,v);}catch{/* Stats stay optional when browser storage is unavailable. */}}
 active(){return this.enabled&&!this.leaving&&!document.hidden&&this.engine.state==='playing';}
 setEnabled(value){if(!value){this.depart();this.enabled=false;this.flush(true);this.set(KEY,'off');}else{this.enabled=true;this.set(KEY,'on');if(this.engine.state==='playing')this.startWorld(this.engine.id,this.engine.stage);}}
 startWorld(planet,stage=0){if(!this.enabled)return;this.depart();this.planet=planet;this.attempt=crypto.randomUUID();this.done=false;this.push('planet_start',stage);this.push('stage_enter',stage);this.flush();}
 push(kind,stage=this.engine.stage||0,value=''){if(!this.enabled||!this.attempt||!this.planet||this.queue.length>=96)return;this.queue.push({id:crypto.randomUUID(),kind,planet:this.planet,attempt:this.attempt,stage,value});}
 event(kind,data={}){if(!this.enabled)return;if(kind==='start'){this.startWorld(this.engine.id,this.engine.stage);return;}if(!this.attempt)return;
  if(kind==='stage')this.push('stage_enter',data.stage);else if(kind==='complete'){this.push('planet_complete');this.done=true;}else if(kind==='dead'){this.push('death',this.engine.stage||0,data.reason);this.done=true;}else if(['gear','repair','vehicle','error'].includes(kind))this.push(kind,this.engine.stage||0,data.value||'');else return;
  this.flush();
 }
 depart(){if(!this.done&&this.attempt){this.push('planet_exit',this.engine.stage||0,'manual');this.done=true;this.flush();}}
 watch(){if(!this.enabled)return;const active=this.active();if(this.planet&&(active!==this.lastActive||Date.now()-this.lastSent>=15000||this.queue.length)&&Date.now()>this.retryAt)this.flush();}
 async request(action,body){const response=await fetch('/api/roland/'+action,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',keepalive:true,body:JSON.stringify(body)});if(!response.ok)throw Object.assign(Error('Gameplay stats unavailable'),{status:response.status});return response.json();}
 async flush(force=false){if(this.busy){if(force)this.pendingFlush=true;return;}if(!this.planet||!this.enabled&&!force)return;this.busy=true;let events=[];try{
  if(!this.session)this.session=await this.request('telemetry-start',{visitor:this.visitor,device:innerWidth<800?'phone':'desktop'});
  events=this.queue.splice(0,16);const active=this.active();await this.request('telemetry',{...this.session,seq:++this.seq,active,events});this.lastSent=Date.now();this.lastActive=active;this.retryAt=0;
 }catch(error){this.queue.unshift(...events);this.queue=this.queue.slice(0,96);this.retryAt=Date.now()+(error.status===429?60000:30000);if(error.status===401){this.session=null;this.seq=0;this.queue=[];this.attempt=null;this.done=true;}}
 finally{this.busy=false;if(this.pendingFlush){this.pendingFlush=false;this.flush(true);}}}
 async feedback(rating,reason){if(!this.enabled)throw Error('Enable anonymous gameplay stats to send a planet rating.');await this.flush();if(!this.session||this.queue.length)throw Error('Feedback is offline. Please try again shortly.');return this.request('feedback',{...this.session,planet:this.planet,rating,reason});}
}
