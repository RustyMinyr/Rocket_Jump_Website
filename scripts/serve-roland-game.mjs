import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Readable} from 'node:stream';
import {createGameService} from '../lib/roland-account.mjs';
const root=resolve('public'),port=Number(process.env.ROLAND_PORT||4175),origin=`http://127.0.0.1:${port}`;
const service=await createGameService({databasePath:resolve(process.env.ROLAND_DATABASE_PATH||'.data/roland-game.sqlite'),databaseUrl:process.env.DATABASE_URL,origin,local:true});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{try{
 if(req.headers.host!==`127.0.0.1:${port}`){res.writeHead(403).end('Use the local preview address.');return;}
 let pathname=decodeURIComponent(new URL(req.url,origin).pathname);
 if(pathname.startsWith('/api/roland/')){const request=new Request(origin+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});const result=await service.handle(request,{clientAddress:req.socket.remoteAddress});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 if(pathname==='/')pathname='/roland-home/';if(pathname.endsWith('/'))pathname+='index.html';const path=resolve(root,'.'+pathname);
 if(!path.startsWith(root+sep)||pathname.split('/').some(s=>s.startsWith('.'))){res.writeHead(403).end();return;}
 const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404).end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local adventure: ${origin}/roland-home/index.html`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{service.close();process.exit(0);}));
