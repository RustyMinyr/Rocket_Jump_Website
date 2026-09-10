const TAU=Math.PI*2;
const rand=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
function path(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function mushroom(c,x,y,size,color){round(c,x-size*.09,y-size*.58,size*.18,size*.65,size*.09,'#d7c0d0');ellipse(c,x,y-size*.65,size*.48,size*.24,color);for(let i=0;i<4;i++)ellipse(c,x+(i-1.5)*size*.19,y-size*.72+(i%2)*size*.12,size*.055,size*.04,'#fff2ecb0');}
function crystal(c,x,y,size,color){path(c,[[x-size*.3,y],[x-size*.23,y-size*.7],[x,y-size],[x+size*.27,y-size*.65],[x+size*.3,y]],color);path(c,[[x,y-size],[x+size*.27,y-size*.65],[x+size*.3,y],[x,y]],'#edffff35');}
function tree(c,x,y,size,color){c.strokeStyle=color;c.lineWidth=size*.065;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-size*.15,y-size*.4,x,y-size*.75);c.stroke();for(let i=0;i<6;i++){const a=Math.PI+i*.53;c.fillStyle=color;c.beginPath();c.ellipse(x+Math.cos(a)*size*.23,y-size*.72+Math.sin(a)*size*.12,size*.3,size*.08,a,0,TAU);c.fill();}}
function coral(c,x,y,size,color,t){c.strokeStyle=color;c.lineCap='round';c.lineWidth=size*.055;for(let i=0;i<5;i++){const s=i-2;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+s*size*.05,y-size*.22,x+s*size*.22+Math.sin(t+i)*5,y-size*.48,x+s*size*.16,y-size*(.45+rand(i+size)*.4));c.stroke();}c.lineCap='butt';}
function city(c,x,y,width,height,color,seed,scrap){round(c,x,y-height,width,height,5,color);path(c,[[x+width*.3,y-height],[x+width*.3,y-height-25],[x+width*.7,y-height-25],[x+width*.7,y-height]],color);c.fillStyle=scrap?'#f5b46877':'#aef6ff70';for(let row=0;row<height/25-1;row++)for(let col=0;col<3;col++)if(rand(seed+row*6+col)>.38)c.fillRect(x+9+col*(width-18)/3,y-height+16+row*25,Math.max(3,(width-30)/5),4);if(!scrap){c.fillStyle='#f699d590';c.fillRect(x+width*.65,y-height+20,4,Math.min(70,height*.4));}else{c.strokeStyle='#ffdb9270';c.lineWidth=4;c.strokeRect(x+width*.1,y-height+height*.5,width*.8,height*.35);}}

// All decoration is anchored to the playable surface, including on tall phones.
export function drawScenery(c,e,images,time,reduced){
 const p=e.planet,w=e.width,h=e.height,f=e.floor,t=reduced?0:time,water=p.biome==='water';
 const air=c.createLinearGradient(0,0,0,f);
 const tones={grass:e.id==='moo'?'#83936638':'#49867220',cheese:'#dc9b4930',jelly:'#a4549233',water:'#0d729b70',ice:'#578ab744',cave:'#cd85502d',mushroom:'#82488340',city:'#55448b3b',scrap:'#9c66433b',moon:'#534f802b',crystal:'#9675ba36',pirate:'#72517a39',lava:'#e3634535',clock:'#b2944930',forest:'#48917c35'};
 air.addColorStop(0,'#0d102300');air.addColorStop(1,tones[p.biome]||'#46496635');c.fillStyle=air;c.fillRect(0,0,w,h);
 if(p.cavern||p.seed>=25)return;
 const moon=images['planet-'+p.art];
 if(moon&&!water){const size=Math.min(330,w*.35),x=w*.68-e.camera*.025,y=Math.min(f-340,h*.36);c.save();c.globalAlpha=e.id==='moo'?.78:.35;c.drawImage(moon,x-size/2,y-size/2,size,size);c.restore();}
 if(water){
  c.save();c.globalCompositeOperation='screen';
  for(let i=0;i<4;i++){const x=w*.2+i*230+Math.sin(t*.17+i)*25;const ray=c.createLinearGradient(x,0,x,f);ray.addColorStop(0,'#a4e6eb12');ray.addColorStop(1,'#71e8ec00');path(c,[[x,0],[x+30,0],[x+170,f],[x-80,f]],ray);}
  c.restore();
  for(let i=0;i<18;i++){const x=(rand(i+23)*w+t*(5+i%3))%w,y=f-80-rand(i+35)*Math.min(550,f-120);ellipse(c,x,y,2+rand(i)*3,3+rand(i)*3,'#beeffc55');}
 }
 for(let layer=0;layer<2;layer++){
  const speed=layer?.42:.18,spacing=layer?190:140,shift=e.camera*speed,start=Math.floor(shift/spacing)-2;
  c.save();c.globalAlpha=layer?.78:.38;
  for(let i=start;i<start+Math.ceil(w/spacing)+5;i++){
   const n=i+p.seed*31,x=i*spacing-shift,y=f+18+layer*25,size=140+rand(n)*210;
   if(['city','scrap','pirate','clock'].includes(p.biome)){city(c,x,y,60+rand(n+4)*75,size*(layer?.65:1.25),layer?'#28394e':'#49637b',n,p.biome==='scrap');}
   else if(water){if(layer)coral(c,x,y,size*.8,['#69b7be','#ae78ba','#53a7a6'][Math.abs(i)%3],t);else{round(c,x,y-size*.65,40,size*.65,4,'#47708c');path(c,[[x-14,y-size*.65],[x+20,y-size*.65-28],[x+55,y-size*.65]],'#5c87a0');}}
   else if((p.biome==='ice'||p.biome==='crystal')){crystal(c,x,y,size*(layer?.7:1.2),layer?'#739dbc':'#5c839f');}
   else if((p.biome==='mushroom'||p.biome==='forest')){mushroom(c,x,y,size,layer?'#c16eaf':'#735983');}
   else if(p.biome==='jelly'){ellipse(c,x,y,size*.48,size*(layer?.55:1),'#a369b3');ellipse(c,x-size*.18,y-size*.44,size*.05,size*.16,'#f1c7eb77');}
   else if(p.biome==='cave'){path(c,[[x-70,y],[x-45,y-size*.65],[x,y-size],[x+60,y-size*.72],[x+110,y]],layer?'#715c5b':'#9b7970');}
   else if(p.biome==='grass'&&e.id!=='moo'){if(layer)tree(c,x,y,size,'#426e6c');else path(c,[[x-120,y],[x+20,y-size],[x+200,y]],'#637e79');}
   else {const color=e.id==='moo'?(layer?'#697d61':'#809578'):p.biome==='cheese'?(layer?'#a98c58':'#c7a76c'):(layer?'#777689':'#898aa6');ellipse(c,x,y+85,size,size*(layer?.55:.85),color);if(e.id==='moo'&&layer)for(let j=0;j<3;j++)ellipse(c,x+(j-1)*size*.43,y+15-j%2*45,20+j*7,13+j*4,'#34484466');if(p.biome==='cheese')for(let j=0;j<3;j++)ellipse(c,x+(j-1)*size*.4,y+5-j%2*40,13+j*4,8+j*3,'#5b462244');}
  }
  c.restore();
 }
 if(p.biome==='city'||p.biome==='scrap'){
  const x=((600-e.camera*.6)%(w+550)+w+550)%(w+550)-200,y=f-230;
  c.strokeStyle='#b1f1ed44';c.lineWidth=2;c.beginPath();c.moveTo(x,y+45);c.lineTo(x,y+140);c.stroke();round(c,x-47,y,180,51,8,'#181d38e0');c.strokeStyle='#ffaddc88';c.strokeRect(x-43,y+4,172,43);c.fillStyle='#ffbcdf';c.textAlign='center';c.font='bold 13px monospace';c.fillText(p.biome==='city'?'VISITORS WELCOME':'PARTS. PROBABLY.',x+43,y+30);
 }
}

export function drawTerrain(c,e,time,reduced){
 const p=e.planet,h=e.height,cam=e.camera,t=reduced?0:time;
 for(const [index,plat]of e.terrain.entries()){
  if(plat.x+plat.w<cam-100||plat.x>cam+e.width+100)continue;
  const {x,y,w}=plat,slab=plat.moving||plat.floating,depth=slab?42:Math.max(70,h-y+45);
  const colors={grass:e.id==='moo'?['#bdd79c','#586452']:['#9fce91','#38565b'],cheese:['#f1cf76','#ac753d'],jelly:['#da9bea','#7a4687'],water:['#8cbab1','#35536b'],ice:['#c6f5ff','#537ba0'],cave:['#d2af84','#6c514f'],mushroom:['#e6a9d0','#625076'],city:['#8de6f4','#243950'],scrap:['#e7ae79','#594b4a'],moon:['#c4bedc','#666074'],crystal:['#d5b9ff','#624389'],pirate:['#debb83','#483c52'],lava:['#ffbb74','#814344'],clock:['#f2dfa0','#5a5563'],forest:['#adf6d1','#405962']};
  const [top,bottom]=colors[p.biome]||colors.moon,fill=c.createLinearGradient(x,y,x,y+Math.min(330,depth));fill.addColorStop(0,top);fill.addColorStop(.08,bottom);fill.addColorStop(1,'#141a30');
  c.save();c.beginPath();c.roundRect(x,y,w,depth,slab?9:14);c.clip();c.fillStyle=fill;c.fillRect(x,y,w,depth);
  if(p.biome==='cheese'||e.id==='moo'||p.biome==='moon')for(let i=0;i<15;i++){const xx=x+rand(i+index*29)*w,yy=y+23+rand(i+index*11)*Math.min(depth,350);ellipse(c,xx,yy,8+rand(i+4)*18,5+rand(i+7)*12,e.id==='moo'?'#d7ddbe40':p.biome==='cheese'?'#66422570':'#272a4160');}
  if(['city','scrap','pirate','clock'].includes(p.biome)){c.strokeStyle=p.biome==='city'?'#84bcca28':'#ffcf942b';c.lineWidth=1;for(let yy=y+30;yy<y+depth;yy+=60){c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();}for(let xx=x+35;xx<x+w;xx+=65){c.beginPath();c.moveTo(xx,y+15);c.lineTo(xx,y+depth);c.stroke();}c.fillStyle=p.biome==='city'?'#9decf79c':'#f3bc6888';for(let xx=x+12;xx<x+w-10;xx+=27)c.fillRect(xx,y+18,12,3);}
  if(p.biome==='ice'||p.biome==='crystal')for(let i=0;i<5;i++){const xx=x+w*i/5;path(c,[[xx,y+7],[xx+w/4,y+15],[xx+w/7,y+130]],'#aee9ff24');}
  if(p.biome==='water'){c.strokeStyle='#77b8bd24';for(let j=0;j<8;j++){c.beginPath();c.moveTo(x,y+20+j*30);c.quadraticCurveTo(x+w*.5,y+40+j*30,x+w,y+20+j*30);c.stroke();}}
  c.restore();
  round(c,x,y,w,slab?8:10,5,plat.spring?'#eea4d3':top);
  c.fillStyle='#f7ffff65';c.fillRect(x+9,y+2,w-18,2);
  if(p.biome==='grass')for(let i=0;i<Math.floor(w/28);i++){const xx=x+15+i*28;c.strokeStyle=top;c.lineWidth=2;c.beginPath();c.moveTo(xx-4,y);c.lineTo(xx-7,y-9);c.moveTo(xx,y);c.lineTo(xx+4,y-12);c.stroke();}
  if(!slab){
   if(p.biome==='water')coral(c,x+w-26,y,55,'#c08dad',t);
   if(p.biome==='ice')crystal(c,x+w-20,y,28,'#c5f4f9');
   if(p.biome==='mushroom')mushroom(c,x+w-30,y,52,'#c07dad');
   if(p.biome==='jelly'){c.fillStyle='#fad6ee5a';c.beginPath();c.ellipse(x+w*.7,y+20,12,6+Math.sin(t*3+index)*2,0,0,TAU);c.fill();}
  }
  if(plat.moving){c.strokeStyle='#9decfc40';c.setLineDash([3,7]);c.beginPath();c.moveTo(x+w/2,plat.baseY-42);c.lineTo(x+w/2,plat.baseY+65);c.stroke();c.setLineDash([]);}
  if(plat.spring){c.strokeStyle='#f6d6eb';c.lineWidth=3;c.beginPath();for(let j=0;j<8;j++){const xx=x+15+j*(w-30)/7;if(j)c.lineTo(xx,y+15+(j%2)*8);else c.moveTo(xx,y+15);}c.stroke();}
 }
}

export function drawLandmarks(c,e){
 const p=e.planet;
 const landmarks=p.biome==='water'?[[1050,'BUBBLE LIFT ↑'],[2150,'MIND THE CURRENT']]:e.id==='moo'?[[640,'YOU ARE ON THE COW'],[1860,'MIND THE UDDER']]:p.biome==='cheese'?[[660,'EDIBLE REAL ESTATE'],[1900,'PLEASE DO NOT LICK']]:p.biome==='jelly'?[[620,'SOLID-ISH GROUND']]:p.biome==='ice'?[[670,'BRAKES NOT INCLUDED']]:p.biome==='mushroom'?[[650,'THIS WAY ↑ PROBABLY']]:p.biome==='cave'?[[650,'FOLLOW DOT’S SIGNAL']]:e.id==='jurassic'?[[650,'YOU ARE NOT A SNACK']]:p.biome==='moon'?[[670,'SOMEONE WAS HERE.']]:[];
 for(const [x,label]of landmarks){if(x<e.camera-220||x>e.camera+e.width+150)continue;const platform=e.platformAt(x);if(!platform)continue;const y=platform.y;c.fillStyle='#b3a9a3';c.fillRect(x-2,y-75,4,75);round(c,x-85,y-92,170,28,5,'#1b253ddd');c.fillStyle='#f1e5e5';c.font='10px monospace';c.textAlign='center';c.fillText(label,x,y-74);}
}
