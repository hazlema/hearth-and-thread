// Minimal static server: module workers need HTTP, not file://. Usage: node serve.mjs [port]
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url)),port=Number(process.argv[2]||process.env.PORT||5173);
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
createServer(async(req,res)=>{
 const path=normalize(decodeURIComponent(new URL(req.url,'http://x').pathname)).replace(/^([/\\])+/,'');
 const file=join(root,path||'index.html');
 if(!file.startsWith(root)){res.writeHead(403).end();return;}
 try{const body=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'}).end(body);}
 catch{res.writeHead(404).end('Not found');}
}).listen(port,()=>console.log(`Hearth & Thread: http://localhost:${port}`));
