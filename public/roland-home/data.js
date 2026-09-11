export const PARTS=[{id:'engine',name:'Engine core',art:'engine'},{id:'sail',name:'Solar sail',art:'sail'},{id:'nav',name:'Navigation chip',art:'chip'},{id:'flux',name:'Flux thingy',art:'engine'},{id:'stabilizer',name:'Wobble stabiliser',art:'sail'},{id:'kettle',name:'Emergency tea drive',art:'chip'}];
export const SYSTEMS=[
 {id:'udder',name:'The Udderverse',line:'A suspicious amount of dairy.',art:'cow',color:'#c2ed9d',planets:['moo','cheese','jelly']},
 {id:'deep',name:'The Deep End',line:'Bring a towel. And a second towel.',art:'ocean',color:'#80e8e5',planets:['ocean','ice','angler']},
 {id:'yesterday',name:'Yesterday, Probably',line:'Before anyone invented common sense.',art:'dino',color:'#efc49e',planets:['jurassic','cave','mushroom']},
 {id:'tomorrow',name:'Tomorrow-ish',line:'Everything is new. Nothing is insured.',art:'city',color:'#d1b1ff',planets:['city','scrap','moon']},
 {id:'glitter',name:'The Glitter Situation',line:'Sparkly. Pointy. Poorly supervised.',art:'crystal',color:'#c4a5ff',level:2,planets:['prism','quartz','mirror']},
 {id:'pirates',name:'The Seven Space Seas',line:'No sea. Still absolutely pirates.',art:'pirate',color:'#ddad83',level:3,planets:['plunder','barnacle','captain']},
 {id:'dragons',name:'Here Be Dragons',line:'The warning was quite literal.',art:'dragon',color:'#ff9e76',level:4,planets:['toast','wyvern','smoulder']},
 {id:'time',name:'The Wrong Century',line:'Yesterday called. You were there.',art:'clock',color:'#f7d79d',level:5,planets:['clock','again','cancelled']},
 {id:'rocks',name:'The Scenic Route',line:'The brochure seems unusually brief.',art:'asteroids',color:'#ff9bab',fatal:true,planets:[]}
];
export const PLANETS={
 moo:{name:'Moo-1',tag:'YES. THE ENTIRE PLANET IS A COW.',art:'cow',background:'cosmos',biome:'grass',part:'engine',gravity:1500,bounce:625,traction:12,enemy:'snail',color:'#bde894',quip:'“I thought the Milky Way was a metaphor.”',seed:1},
 cheese:{name:'Swiss Miss',tag:'LOW GRAVITY. HIGH CHOLESTEROL.',art:'cheese',background:'cosmos',biome:'cheese',part:'nav',gravity:860,bounce:535,traction:9,enemy:'snail',color:'#ffe49a',quip:'“Finally. A place with some culture.”',seed:2},
 jelly:{name:'Wobbleton',tag:'THE FLOOR HAS BOUNDARY ISSUES.',art:'jelly',background:'cosmos',biome:'jelly',part:'sail',gravity:1400,bounce:750,traction:10,enemy:'snail',color:'#d9a2fb',quip:'“I can feel my thoughts bouncing.”',seed:3},
 ocean:{name:'Atlant-ish',tag:'UNDERWATER. UNDERPREPARED.',art:'ocean',background:'underwater',biome:'water',part:'flux',gravity:560,bounce:385,traction:8,enemy:'snail',color:'#87ebed',quip:'“Good news. The helmet appears to be waterproof.”',seed:4},
 ice:{name:'Slippery When Planet',tag:'NO BRAKES. EXCELLENT VIEWS.',art:'ice',background:'cosmos',biome:'ice',part:'stabilizer',gravity:1250,bounce:605,traction:1.8,enemy:'snail',color:'#c5efff',quip:'“Stopping was always more of a suggestion.”',seed:5},
 angler:{name:'Definitely Not A Mouth',tag:'A WARM WELCOME IS PROMISED.',art:'ocean',background:'underwater',biome:'water',fatal:true,color:'#91cbe5',quip:'“Why is the horizon closing?”',seed:6},
 jurassic:{name:'Jurassic Parking',tag:'PLEASE DO NOT FEED YOURSELF TO THE DINOSAURS.',art:'dino',background:'prehistoric',biome:'grass',part:'kettle',gravity:1450,bounce:620,traction:12,enemy:'dino',color:'#b6e19d',quip:'“Lovely wildlife. Terrible parking attendants.”',seed:7},
 cave:{name:'Flint Eastwood',tag:'YOUR HEAD IS NOW A LOCAL LEGEND.',art:'dino',background:'prehistoric',biome:'cave',part:'nav',gravity:1500,bounce:630,traction:11,enemy:'caveman',color:'#d9c4a4',quip:'“Please don’t invent football with me.”',seed:8},
 mushroom:{name:'Mushroom For Improvement',tag:'BOUNCE FIRST. ASK QUESTIONS EVENTUALLY.',art:'jelly',background:'prehistoric',biome:'mushroom',part:'sail',gravity:1300,bounce:725,traction:12,enemy:'snail',color:'#fab0d8',quip:'“I have concerns about the local architecture.”',seed:9},
 city:{name:'Neon Nine',tag:'THE FUTURE MOVES WITHOUT WARNING.',art:'city',background:'future',biome:'city',part:'engine',gravity:1450,bounce:640,traction:12,enemy:'robot',moving:true,color:'#99defa',quip:'“Can someone turn the pavement off and on again?”',seed:10},
 scrap:{name:'The Lost & Foundry',tag:'ONE PLANET’S JUNK. MY ENTIRE SPACESHIP.',art:'city',background:'future',biome:'scrap',part:'stabilizer',gravity:1450,bounce:650,traction:11,enemy:'robot',moving:true,color:'#ffca9f',quip:'“I think this is the warranty department.”',seed:11},
 moon:{name:'Moon With A View',tag:'VERY LITTLE GRAVITY. PLENTY OF ATTITUDE.',art:'ice',background:'cosmos',biome:'moon',part:'flux',gravity:730,bounce:505,traction:10,enemy:'snail',color:'#d9cbff',quip:'“I could get used to weighing less than my lunch.”',seed:12}
};
const world=(name,tag,art,background,biome,part,seed,extra={})=>({name,tag,art,background,biome,part,seed,gravity:1400,bounce:650,traction:11,enemy:'pirate',color:'#c4a5ff',quip:'“I remain cautiously lost.”',...extra});
Object.assign(PLANETS,{
 prism:world('Prism Break','THE CRYSTAL HELM IS HERE. NOWHERE ELSE.','crystal','crystal-cavern','crystal','nav',13,{gear:'crystal',quip:'“If I get lost, at least I’ll be shiny.”'}),
 quartz:world('Quartz of Appeal','THE MOUNTAIN WOULD LIKE A WORD.','crystal','crystal-cavern','crystal','flux',14,{boss:'golem',length:4100,quip:'“I would like to speak to a smaller crystal.”'}),
 mirror:world('Mirrorball Minor','YOUR REFLECTION IS ALSO LOST.','crystal','crystal-cavern','crystal','sail',15,{moving:true,gravity:1050,bounce:570,quip:'“There are far too many of me in here.”'}),
 plunder:world('Plunderball','ALL PROPERTY IS TEMPORARILY YOURS.','pirate','future','pirate','engine',16,{quip:'“Do you validate spaceship parking?”'}),
 barnacle:world('Barnacle Boulevard','A SHIPWRECK WITH EXCELLENT WIFI.','ocean','underwater','water','stabilizer',17,{enemy:'pirate',gravity:560,bounce:385,traction:8,quip:'“The pirates have been watering the cannons.”'}),
 captain:world('Captain’s Last Resort','CAPTAIN BARNACLE DOES NOT ACCEPT RETURNS.','pirate','future','pirate','kettle',18,{boss:'captain',gear:'pirate',length:4100,quip:'“I’m just here for the hat, actually.”'}),
 toast:world('Toastopia','THE FLOOR IS, UNFORTUNATELY, LAVA.','dragon','prehistoric','lava','engine',19,{enemy:'dragon',hazard:'lava',quip:'“My travel insurance specifically mentioned this.”'}),
 wyvern:world('Wyvern & Dine','YOU ARE SUSPICIOUSLY CLOSE TO THE MENU.','dragon','prehistoric','lava','sail',20,{enemy:'dragon',gravity:1150,bounce:620,quip:'“Could I see the vegetarian options?”'}),
 smoulder:world('Smoulder Shoulder','ONE DRAGON. A VERY PERSONAL GRUDGE.','dragon','prehistoric','lava','flux',21,{enemy:'dragon',boss:'dragon',gear:'dragon',length:4300,quip:'“I may have called it a large lizard.”'}),
 clock:world('Tick Tock Rock','YOU ARE EARLY. AND LATE. SIMULTANEOUSLY.','clock','cosmos','clock','nav',22,{moving:true,gear:'chrono',quip:'“I’m putting this entire century on hold.”'}),
 again:world('Yesterday Again','THE DINOSAURS REMEMBER YOU.','forest','prehistoric','forest','stabilizer',23,{enemy:'dino',quip:'“No, this is my first second visit.”'}),
 cancelled:world('Tomorrow Was Cancelled','THE FUTURE HAS TAKEN A PERSONAL DAY.','cloud','future','clock','kettle',24,{enemy:'robot',moving:true,gravity:900,bounce:570,quip:'“Can we reschedule the apocalypse?”'})
});
for(const [id,art]of Object.entries({cave:'caveman',mushroom:'mushroom',scrap:'scrap',moon:'moon',angler:'angler',mirror:'disco',quartz:'ice-nest',captain:'pirate-base',barnacle:'pirate-wreck',wyvern:'wyvern',smoulder:'ember',cancelled:'ruins'}))PLANETS[id].art=art;
SYSTEMS.push(
 {id:'hollow',name:'The Hollow Stars',line:'Entire worlds on the inside.',art:'crystal',color:'#df9bd1',planets:['hollow','echo','mantle']},
 {id:'sky',name:'The Up & Away',line:'The ground has left the group.',art:'cloud',color:'#ade8e9',planets:['aerie','zephyr','storm']},
 {id:'lunar',name:'The Quiet Orbit',line:'Someone was here before you.',art:'moon',color:'#d9c9b0',planets:['selene','relay','driftport']},
 {id:'beyond',name:'Beyond the Blue',line:'Your ship. A very large sky.',art:'ruins',color:'#c4b7ff',planets:['wreck','nebula','ring']}
);
Object.assign(PLANETS,{
 hollow:world('Velvet Hollow','FOLLOW THE LIGHT. MIND THE TEETH.','crystal','drifter-cave','cave','nav',25,{enemy:'caveman',cavern:true}),
 echo:world('Echo, Echo','THE CAVE HAS ALREADY HEARD THAT JOKE.','ice-nest','drifter-cave','crystal','sail',26,{cavern:true,moving:true}),
 mantle:world('Mantle Piece','A COSY LITTLE PLACE INSIDE A PLANET.','ember','drifter-cave','lava','engine',27,{cavern:true,enemy:'dragon',hazard:'lava'}),
 aerie:world('The Floaters','FIND YOUR WINGS. THEN FIND THE GROUND.','cloud','drifter-sky','moon','sail',28,{flight:true,enemy:'dragon',gravity:700,bounce:500}),
 zephyr:world('Zephyr Gardens','THE TREES HAVE OUTGROWN GRAVITY.','forest','drifter-sky','forest','stabilizer',29,{flight:true,enemy:'snail',gravity:700,bounce:500}),
 storm:world('Weather or Not','FIVE STARS. MOSTLY ELECTRICAL.','disco','drifter-sky','clock','flux',30,{flight:true,moving:true,enemy:'robot'}),
 selene:world('Selene’s Silence','ONE ABANDONED LANDER. KEYS STILL IN IT.','moon','drifter-lunar','moon','engine',31,{vehicle:'rover',enemy:'robot',gravity:1000,bounce:540}),
 relay:world('Last Call Station','SOMEONE LEFT THE RADIO ON.','ruins','drifter-lunar','scrap','nav',32,{vehicle:'rover',enemy:'robot',moving:true}),
 driftport:world('Departure, Eventually','BORROW A SHIP. RETURN DATE: EVENTUALLY.','pirate-base','drifter-lunar','pirate','kettle',33,{vehicle:'ship',enemy:'pirate'}),
 wreck:world('Lost Property Moon','PLEASE COLLECT YOUR ABANDONED CIVILISATION.','scrap','drifter-lunar','scrap','stabilizer',34,{vehicle:'rover',enemy:'robot'}),
 nebula:world('Pink Noise','FLY THROUGH THE STATIC. SHOOT THE PROBLEM.','jelly','drifter-sky','crystal','flux',35,{vehicle:'ship',flight:true,enemy:'pirate'}),
 ring:world('The Unfinished Ring','AN ANCIENT GATE. A VERY NEW QUESTION.','clock','drifter-sky','clock','kettle',36,{vehicle:'ship',boss:'golem',length:4100,enemy:'robot'})
});
for(const id of ['hollow','echo','mantle','aerie','zephyr','storm','selene','relay','driftport','wreck','nebula','ring'])PLANETS[id].art='drifter-'+id;for(const [id,art]of Object.entries({hollow:'hollow',sky:'aerie',lunar:'selene',beyond:'ring'}))SYSTEMS.find(s=>s.id===id).art='drifter-'+art;
for(const s of SYSTEMS)delete s.level;
// These settled worlds retain working gravity across the whole surface.
for(const id of ['city','scrap'])PLANETS[id].stableGravity=true;
for(const [id,p]of Object.entries(PLANETS)){if(!p.fatal)p.length=(p.length||3250)*5;if(p.biome==='cave')p.cavern=true;if(p.cavern)p.background='drifter-cave';if(p.flight)p.background='drifter-sky';if(p.biome==='moon')p.background='drifter-lunar';if(id==='moon')p.vehicle='rover';}
export const STAGE_NAMES={
 cave:['The descent','Lantern galleries','The deep archive','The sleeping machine','Daylight, maybe'],
 crystal:['The glass shore','Prismatic passages','The singing vault','Heart of the geode','The far reflection'],
 water:['The shallows','Drowned gardens','The sunken library','Pressure trench','The last lighthouse'],
 moon:['First footprints','Silent craters','The abandoned outpost','Dark side crossing','The return signal'],
 forest:['Soft landing','The giant canopy','Memory grove','The wandering roots','The old clearing'],
 lava:['Warm reception','Ashfall crossing','The ember vault','The furnace road','The dragon’s doorstep'],
 pirate:['Uninvited arrival','Smuggler’s walk','The stolen archive','Cannon alley','The captain’s quarter'],
 default:['Strange shores','The long crossing','Something left behind','The wild frontier','A signal home']
};
const UNIQUE_STAGES={
 25:['The velvet descent','Small door, big secret','Lantern civilisation','The buried engine','A crack of daylight'],
 26:['An answer in the dark','The glass organ','Footprints going backwards','Pocket-sized passage','The final echo'],
 27:['Through the crust','The furnace breathes','The magma archive','Cooling chambers','The world’s heartbeat'],
 28:['Borrowed wings','Islands without anchors','The gardener’s journal','A bridge made of sky','The high beacon'],
 29:['Gardens in the clouds','The drifting orchard','A seed from home','Floating roots','The windward gate'],
 30:['Clear skies, allegedly','The lightning clocks','A storm in a bottle','Thunder without warning','Eye of the weather'],
 31:['Footprints & ignition','The crater highway','The missing crew','Dark side driving','The last porch light'],
 32:['A dial tone in space','The broken antennae','The relay archive','The signal canyon','Somebody answers'],
 33:['Find a ship','Unscheduled departure','The stowaway’s memory','Pirate airspace','Customs, probably'],
 34:['The abandoned car park','Suspension of disbelief','The owner’s message','Spare parts boulevard','Finders keepers'],
 35:['Into the pink','Static gardens','Voices in the dust','The bright turbulence','A quiet frequency'],
 36:['The ancient perimeter','An orbit in pieces','The gatekeeper’s record','The clockwork approach','The ring’s guardian']
};
export function stageNames(p){return UNIQUE_STAGES[p.seed]||STAGE_NAMES[p.biome]||STAGE_NAMES.default;}
export function savedStage(save,id){return Math.max(0,...save.claims.filter(c=>c.startsWith('stage:'+id+':')).map(c=>Number(c.split(':')[2])));}
export const GEAR={
 starter:{name:'Standard Issue',slot:'suit',source:null,level:1,art:'suit-starter',description:'One slightly dented suit. One extremely determined Drifter.',effect:'Your first suit. Dot handles the blaster.'},
 dive:{name:'Deep-Sea Suit',slot:'suit',source:'ocean',level:1,art:'suit-dive',description:'Recovered from the drowned post office of Atlant-ish.',effect:'+15 health. Swim faster. Bubble currents are gentler.'},
 crystal:{name:'Crystal Helm',slot:'suit',source:'prism',level:2,art:'suit-crystal',description:'A one-of-a-kind helm hidden on Prism Break.',effect:'+25 health. 25% less projectile damage. Prismatic blaster.'},
 pirate:{name:'Captain’s Regalia',slot:'suit',source:'captain',level:3,art:'suit-pirate',description:'Beat Captain Barnacle to claim his very impractical uniform.',effect:'+15 health. Defeating an enemy restores 8 health.'},
 dragon:{name:'Dragonscale Suit',slot:'suit',source:'smoulder',level:4,art:'suit-dragon',description:'A reward for surviving The Inconvenient Dragon.',effect:'+20 health. Half fire damage. Stronger blaster.'},
 chrono:{name:'Clockwork Suit',slot:'suit',source:'clock',level:5,art:'suit-chrono',description:'A spare tomorrow folded into a very handsome suit.',effect:'One second chance per expedition. Restores 35 health.'},
 spring:{name:'Spring Coil',slot:'relic',source:'jelly',level:1,art:'bouncy',description:'Wobbleton’s most portable building material.',effect:'+8% bounce. Spring potions last 14 seconds.'},
 grips:{name:'Ice Grips',slot:'relic',source:'ice',level:1,art:'planet-ice',description:'Hidden on Slippery When Planet. Naturally.',effect:'Brake reliably on ice. Much less accidental sliding.'},
 magnet:{name:'Scrap Magnet',slot:'relic',source:'scrap',level:1,art:'engine',description:'The Lost & Foundry would like its magnet back.',effect:'Pull in pickups from much farther away.'}
};
for(const [id,g]of Object.entries(GEAR))if(g.source)PLANETS[g.source].gear=id;
GEAR.jet={name:'Jetburst Pack',slot:'relic',source:'aerie',level:1,art:'bouncy',description:'Aerie’s forgotten flight prototype.',effect:'Fly on any planet. Tap high to rise; tap low to descend.'};
GEAR.anchor={name:'Gravity Anchor',slot:'relic',source:'hollow',level:1,art:'engine',description:'A little gravity, wherever you need it.',effect:'Walk instead of bouncing. Hold boost to jump.'};
GEAR.pulse={name:'ARC Overcharger',slot:'relic',source:'relay',level:1,art:'chip',description:'An old relay with one very lively battery.',effect:'+12 blaster damage. Faster pulse shots.'};
for(const [id,g]of Object.entries(GEAR)){g.level=1;if(g.source)PLANETS[g.source].gear=id;}
GEAR.starter.description='One slightly dented suit. One extremely determined Drifter.';
export const LEVELS=[0,100,250,450,750,1100,1600,2200,3000,4000,5100,6400,7800,9400,11200,13200,15400,17800,20400,23200];
export function claimValue(id){const [kind,a,b]=String(id).split(':');if(kind==='part'&&PARTS.some(p=>p.id===a)&&b===undefined)return 50;if(!PLANETS[a]||PLANETS[a].fatal)return 0;if(kind==='clear'&&b===undefined)return 100;if(kind==='boss'&&PLANETS[a].boss&&b===undefined)return 180;if(kind==='gear'&&PLANETS[a].gear&&b===undefined)return 75;if(kind==='foe'&&/^(?:[0-9]|1[0-9]|2[0-4])$/.test(b))return 8;if(kind==='shard'&&/^(?:[0-9]|[12][0-9])$/.test(b))return 5;if(kind==='stage'&&/^[1-4]$/.test(b))return 40;if(kind==='cache'&&/^[0-4]$/.test(b))return 35;if(kind==='signal'&&/^[0-2]$/.test(b))return 25;return 0;}
export function experience(save){return save.claims.reduce((n,id)=>n+claimValue(id),0);}
export function characterLevel(save){const xp=experience(save);return Math.max(1,LEVELS.filter(n=>xp>=n).length);}
export function characterStats(save){const level=characterLevel(save),relic=GEAR[save.equipped.relic];return{level,suit:save.equipped.suit,relic:save.equipped.relic,maxHp:100+(level-1)*5+({dive:15,crystal:25,pirate:15,dragon:20}[save.equipped.suit]||0),attack:16+(level-1)*2+(save.equipped.suit==='dragon'?8:0)+(save.equipped.relic==='pulse'?12:0),bounce:relic===GEAR.spring?1.08:1,magnet:relic===GEAR.magnet?42:0};}
export const KEY='roland-get-home-v1';
export function fresh(){return{version:2,parts:[],completed:[],discovered:[],claims:[],gear:['starter'],equipped:{suit:'starter',relic:null},sound:false,home:false};}
export function normalizeSave(d){if(!d||![1,2].includes(d.version))return fresh();const includes=(a,id)=>Array.isArray(a)&&a.includes(id),parts=PARTS.filter(p=>includes(d.parts,p.id)).map(p=>p.id),completed=Object.keys(PLANETS).filter(k=>includes(d.completed,k));const claims=[...new Set([...(Array.isArray(d.claims)?d.claims.filter(c=>typeof c==='string'&&c.split(':').length<=3&&claimValue(c)>0):[]),...parts.map(id=>'part:'+id),...completed.map(id=>'clear:'+id)])];const gear=Object.keys(GEAR).filter(k=>k==='starter'||includes(d.gear,k)&&claims.includes('gear:'+GEAR[k].source));const result={version:2,parts,completed,discovered:SYSTEMS.filter(s=>includes(d.discovered,s.id)).map(s=>s.id),claims,gear,equipped:{suit:'starter',relic:null},sound:d.sound===true,home:d.home===true&&parts.length===6};for(const slot of ['suit','relic']){const id=d.equipped?.[slot];if(gear.includes(id)&&GEAR[id]?.slot===slot&&characterLevel(result)>=GEAR[id].level)result.equipped[slot]=id;}return result;}
export function readSave(storage,key=KEY){try{return normalizeSave(JSON.parse(storage.getItem(key)));}catch{return fresh();}}
export function mergeSaves(a,b){a=normalizeSave(a);b=normalizeSave(b);return normalizeSave({...b,parts:[...new Set([...a.parts,...b.parts])],completed:[...new Set([...a.completed,...b.completed])],discovered:[...new Set([...a.discovered,...b.discovered])],claims:[...new Set([...a.claims,...b.claims])],gear:[...new Set([...a.gear,...b.gear])],home:a.home||b.home});}
