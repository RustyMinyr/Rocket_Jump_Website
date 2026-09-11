/* eslint-disable @typescript-eslint/no-require-imports */
const path=require('node:path');
const sharp=require('C:/Users/brad/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const atlas='output/drifter-correction/atlas.png';
const crops=[['starter',141,10,330,489],['crystal',612,10,339,490],['dive',1090,10,344,489],['dragon',102,521,360,492],['pirate',596,522,357,491],['chrono',1109,524,332,489]];
(async()=>{for(const [name,x,y,w,h]of crops){const out=path.join('public/roland-home/assets','suit-'+name+'.webp');await sharp(atlas).extract({left:x-6,top:y-6,width:w+12,height:h+12}).resize({height:500}).webp({quality:90,alphaQuality:100}).toFile(out);const {data,info}=await sharp(out).ensureAlpha().raw().toBuffer({resolveWithObject:true});let empty=0,solid=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)empty++;if(data[i]>250)solid++;}if(empty<500||solid<500)throw Error('Invalid alpha for '+name);console.log(name,info.width+'x'+info.height,'transparent and solid pixels verified');}})().catch(e=>{console.error(e);process.exitCode=1;});
