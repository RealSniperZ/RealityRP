// Proxy simple para FiveM: evita CORS reenviando a IP:PUERTO
// Uso: node proxy-server.js --target http://IP:PUERTO --port 5050

const http = require('http');
const https = require('https');
const { URL } = require('url');

const args = process.argv.slice(2);
function arg(name, def){
  const i = args.indexOf(`--${name}`);
  if(i === -1) return def;
  const v = args[i+1];
  return v ?? def;
}

const target = new URL(arg('target', 'http://127.0.0.1:30120'));
const port = Number(arg('port', '5050'));
const prefix = arg('prefix', '/fivem');

const agent = target.protocol === 'https:' ? https : http;

const server = http.createServer((req, res)=>{
  // Solo permitimos los endpoints FiveM conocidos
  const allowed = ['/dynamic.json', '/info.json', '/players.json'];
  const urlPath = req.url.replace(prefix, '') || '/';
  if(!allowed.includes(urlPath)){
    res.writeHead(404, {'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({error:'Not found'}));
    return;
  }
  const proxUrl = new URL(urlPath, target);
  const opts = { method: 'GET', headers: { 'User-Agent': 'RealityRP-Proxy' } };
  const p = agent.request(proxUrl, opts, (pr)=>{
    const headers = { ...pr.headers, 'access-control-allow-origin': '*' };
    res.writeHead(pr.statusCode || 500, headers);
    pr.pipe(res);
  });
  p.on('error', (err)=>{
    res.writeHead(502, {'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({error:'Bad gateway', detail: String(err)}));
  });
  p.end();
});

server.listen(port, ()=>{
  console.log(`[Proxy] Escuchando en http://localhost:${port}${prefix} -> ${target.href}`);
});
