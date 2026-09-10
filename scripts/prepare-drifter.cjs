/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const dir='output/drifter-art',out='public/roland-home/assets',crops=JSON.parse(fs.readFileSync(dir+'/crops.json'));
 const names={standard:'suit-starter',dive:'suit-dive',crystal:'suit-crystal',pirate:'suit-pirate',ember:'suit-dragon',chrono:'suit-chrono',dot:'dot',rover:'drifter-rover',ship:'drifter-ship',jetpack:'drifter-jet',crystals:'drifter-crystals',caveCreature:'drifter-creature'};
 for(const crop of crops){await sharp(path.join(dir,crop.file)).extract({left:crop.x,top:crop.y,width:crop.width,height:crop.height}).resize({height:500,withoutEnlargement:true}).webp({quality:88}).toFile(path.join(out,names[crop.name]+'.webp'));}
 for(const [source,name]of Object.entries({'crystal-cavern':'drifter-cave','floating-islands':'drifter-sky','lunar-crash':'drifter-lunar','drifter-dot-hero':'drifter-hero'}))await sharp('output/drifter-worlds/'+source+'.png').resize({width:1536}).webp({quality:87}).toFile(out+'/'+name+'.webp');
})();
