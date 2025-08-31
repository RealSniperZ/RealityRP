// Servidor estático mínimo sin dependencias externas
// Uso: node static-server.js --port 5500
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function arg(name, def){
  const i = args.indexOf(`--${name}`);
  if(i === -1) return def;
  const v = args[i+1];
  return v ?? def;
}

const port = Number(arg('port', '5500'));
const root = process.cwd();

const mimes = {
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.ico':'image/x-icon',
  '.woff':'font/woff',
  '.woff2':'font/woff2'
};

function safeJoin(base, target){
  const resolved = path.resolve(base, target);
  if(!resolved.startsWith(path.resolve(base))) return null; // evitar traversal
  return resolved;
}

const server = http.createServer((req,res)=>{
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = safeJoin(root, urlPath === '/' ? '/index.html' : urlPath);
  if(!filePath){
    res.writeHead(400); res.end('Bad request'); return;
  }
  fs.stat(filePath, (err, st)=>{
    if(err){
      // intentar agregar .html si no hay extensión
      if(!path.extname(filePath)){
        const tryHtml = filePath + '.html';
        return fs.stat(tryHtml, (e2, st2)=>{
          if(e2){ res.writeHead(404); res.end('Not found'); }
          else serveFile(tryHtml, st2, res);
        });
      }
      res.writeHead(404); res.end('Not found');
      return;
    }
    if(st.isDirectory()){
      const idx = path.join(filePath, 'index.html');
      return fs.stat(idx, (e3, st3)=>{
        if(e3){ res.writeHead(403); res.end('Forbidden'); }
        else serveFile(idx, st3, res);
      });
    }
    serveFile(filePath, st, res);
  });
});

function serveFile(fp, st, res){
  const ext = path.extname(fp).toLowerCase();
  const mime = mimes[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(fp);
  res.writeHead(200, {
    'Content-Type': mime,
    'Cache-Control': 'no-cache'
  });
  stream.pipe(res);
  stream.on('error', ()=>{ res.writeHead(500); res.end('Internal error'); });
}

server.listen(port, ()=>{
  console.log(`[Static] Servidor en http://localhost:${port}`);
});
