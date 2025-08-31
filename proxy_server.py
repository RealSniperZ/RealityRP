#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import urllib.error
import sys
from urllib.parse import urljoin

PORT = 5050
TARGET = 'http://79.116.6.42:30120'
PREFIX = '/fivem'
ALLOWED = {'/dynamic.json', '/info.json', '/players.json'}

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path
        if not path.startswith(PREFIX):
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'Not found')
            return
        upstream_path = path[len(PREFIX):] or '/'
        if upstream_path not in ALLOWED:
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'Not found')
            return
        url = urljoin(TARGET, upstream_path)
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'RealityRP-PyProxy'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
                self.send_response(resp.status)
                for k, v in resp.getheaders():
                    # evitar header hop-by-hop y asegurar CORS
                    if k.lower() in {'transfer-encoding', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'upgrade'}:
                        continue
                    self.send_header(k, v)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(502)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(('{"error":"Bad gateway","detail":"%s"}' % str(e)).encode('utf-8'))

def run(port):
    with socketserver.TCPServer(('', port), ProxyHandler) as httpd:
        sa = httpd.socket.getsockname()
        print(f"[PyProxy] Escuchando en http://localhost:{sa[1]}{PREFIX} -> {TARGET}")
        httpd.serve_forever()

if __name__ == '__main__':
    # Permitir override por CLI: python proxy_server.py 5050 http://IP:PORT
    if len(sys.argv) >= 2:
        try:
            PORT = int(sys.argv[1])
        except: pass
    if len(sys.argv) >= 3:
        TARGET = sys.argv[2]
    run(PORT)
