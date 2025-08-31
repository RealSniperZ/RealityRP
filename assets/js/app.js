/* App principal: carga config, consulta estado FiveM, renderiza UI y efectos */
(function(){
  const cfg = window.SITE_CONFIG || {};

  // Utilidad: seleccionar
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

  // Canvas fondo con partículas
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  function resize(){canvas.width=innerWidth; canvas.height=innerHeight}
  window.addEventListener('resize', resize); resize();
  const particles = Array.from({length: 80}, ()=>({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*2+0.6,
    vx: (Math.random()-.5)*0.3,
    vy: (Math.random()-.5)*0.3
  }));
  function drawBg(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='rgba(255,0,168,0.08)';
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>canvas.width) p.vx*=-1;
      if(p.y<0||p.y>canvas.height) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(drawBg);
  }
  drawBg();

  // Nav móvil
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  navToggle?.addEventListener('click', ()=> nav.classList.toggle('open'));
  // Cerrar nav al navegar en móvil
  nav?.addEventListener('click', (e)=>{
    if(e.target.tagName === 'A') nav.classList.remove('open');
  });

  // Branding y enlaces
  function applyBrand(){
    if(cfg.brand){
      const name = cfg.brand.name || 'RealityRP';
      const tagline = cfg.brand.tagline || '';
      const logo = cfg.brand.logo;
      const brandNameEls = [document.getElementById('brand-name'), document.getElementById('server-name'), document.getElementById('footer-name')];
      brandNameEls.forEach(el=>{ if(el) el.textContent = name;});
      const tl = document.getElementById('server-tagline'); if(tl) tl.textContent = tagline;
      if(logo){ document.querySelectorAll('.logo').forEach(img=>{ img.src = logo; }); }
    }
    if(cfg.links){
      const setHref=(id,url)=>{ const el=document.getElementById(id); if(el && url) el.href=url; };
      setHref('discord-link', cfg.links.discord);
      setHref('discord-link-cta', cfg.links.discord);
      setHref('social-discord', cfg.links.discord);
      setHref('social-twitch', cfg.links.twitch);
      setHref('social-youtube', cfg.links.youtube);
      setHref('social-tiktok', cfg.links.tiktok);
    }
    document.getElementById('year').textContent = new Date().getFullYear();
  }

  // Render features/cards
  function renderFeatures(){
    const grid = document.getElementById('features-grid'); if(!grid||!cfg.features) return;
    grid.innerHTML = cfg.features.map(f=>`<div class="card">
      <h3><i class="${f.icon}"></i> ${f.title}</h3>
      <p>${f.text}</p>
    </div>`).join('');
  }

  // Render eventos
  function renderEvents(){
    const grid = document.getElementById('events-grid'); if(!grid||!cfg.events) return;
    grid.innerHTML = cfg.events.map(ev=>`<article class="card">
      <img src="${ev.image}" alt="${ev.title}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'" style="width:100%; height:160px; object-fit:cover; border-radius:10px; border:1px solid rgba(255,255,255,.08)"/>
      <div style="padding:.5rem .25rem .25rem">
        <h3>${ev.title}</h3>
        <p style="color:#cbd4e6">${new Date(ev.date).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'})}</p>
        <p>${ev.text}</p>
      </div>
    </article>`).join('');
  }

  // Render galería
  function renderGallery(){
    const track = document.getElementById('gal-track'); if(!track||!cfg.gallery) return;
    track.innerHTML = cfg.gallery.map(g=>`<figure class="carousel-slide">
      <img src="${g.src}" alt="${g.caption}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'"/>
      <figcaption class="caption">${g.caption}</figcaption>
    </figure>`).join('');
    const prev=$('#gal-prev'), next=$('#gal-next');
    prev?.addEventListener('click', ()=> track.scrollBy({left:-300,behavior:'smooth'}));
    next?.addEventListener('click', ()=> track.scrollBy({left:300,behavior:'smooth'}));
  }

  // Render staff
  function renderStaff(){
    const grid = document.getElementById('staff-grid'); if(!grid||!cfg.staff) return;
    grid.innerHTML = cfg.staff.map(s=>`<div class="staff-card">
      <img src="${s.avatar}" alt="${s.name}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'"/>
      <div>
        <div style="font-weight:700">${s.name}</div>
        <div class="role">${s.role}</div>
      </div>
    </div>`).join('');
  }

  // Render FAQ
  function renderFAQ(){
    const acc = document.getElementById('faq-accordion'); if(!acc||!cfg.faq) return;
    acc.innerHTML = cfg.faq.map((i,idx)=>`<div class="accordion-item" data-idx="${idx}">
      <div class="accordion-header">${i.q}<i class="fa-solid fa-chevron-down"></i></div>
      <div class="accordion-body">${i.a}</div>
    </div>`).join('');
    acc.addEventListener('click', (e)=>{
      const item = e.target.closest('.accordion-item'); if(!item) return;
      item.classList.toggle('open');
    });
  }

  // Render inicio: Sobre y Desarrollo
  function renderHome(){
    // Ajustar textos con brand
    const aboutName = document.getElementById('server-name-about');
    if(aboutName && cfg.brand?.name) aboutName.textContent = cfg.brand.name;
    const aboutText = document.getElementById('about-text');
    if(aboutText && cfg.brand?.tagline){
      aboutText.textContent = cfg.brand.tagline;
    }

    // Chips destacados (primeras 4 features)
    const chips = document.getElementById('about-chips');
    if(chips && Array.isArray(cfg.features)){
      const top = cfg.features.slice(0,4);
      chips.innerHTML = top.map(f=>`<span class="chip"><i class="${f.icon}"></i> ${f.title}</span>`).join('');
    }

    // Timeline con eventos
    const timeline = document.getElementById('timeline');
    if(timeline){
      const items = Array.isArray(cfg.events) ? cfg.events.slice(0,4) : [];
      if(items.length){
        timeline.innerHTML = items.map(ev=>`<div class="entry reveal">
          <div class="dot"></div>
          <div style="font-weight:700">${ev.title}</div>
          <div style="color:#cbd4e6; font-size:.95rem">${new Date(ev.date).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'})}</div>
          <div>${ev.text}</div>
        </div>`).join('');
      } else {
        timeline.innerHTML = `<div class="entry"><div class="dot"></div>No hay eventos aún. Próximamente…</div>`;
      }
    }
  }

  // Estado FiveM: usa endpoints públicos del servidor
  // - players.json -> lista de jugadores
  // - info.json -> info del servidor (mapa, versión, etc.)
  // - dynamic.json -> online, maxPlayers
  async function fetchJSON(url){
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    return res.json();
  }
  function buildBaseUrl(){
    if(cfg.fivem?.baseOverride){
      return cfg.fivem.baseOverride; // puede ser relativo ('/fivem') o absoluto ('https://dominio/fivem')
    }
    if(cfg.fivem?.ip && cfg.fivem?.port){
      return `http://${cfg.fivem.ip}:${cfg.fivem.port}`;
    }
    return null;
  }

  // Intento de obtener endpoints mediante cfx.re (compatible con GitHub Pages)
  async function getCfxResolvedBase(){
    const cfx = cfg.fivem?.cfx;
    if(!cfx) return null;
    // cfx viene como 'cfx.re/join/abcd12' o solo código
    const code = (cfx.includes('/') ? cfx.split('/').pop() : cfx).trim();
    if(!code) return null;
    // API pública de servidores FiveM
    // Nota: Esta API es usada por el frontend de servidores de FiveM.
    const urls = [
      `https://servers-frontend.fivem.net/api/servers/single/${code}`,
      `https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(code)}`
    ];
    for(const u of urls){
      try{
        const data = await fetchJSON(u);
        // Estructura esperada: data.Data.connectEndPoints -> [ 'IP:PORT', ...]
        const ep = data?.Data?.connectEndPoints?.find(Boolean);
        if(ep){
          const [host, port] = ep.split(':');
          if(host && port){
            return `http://${host}:${port}`;
          }
        }
      }catch(_){/* continúa con el siguiente */}
    }
    return null;
  }

  // Obtener estado/players desde cfx.re (compatible con HTTPS en Pages)
  async function getCfxStatus(){
    const cfx = cfg.fivem?.cfx;
    if(!cfx) return null;
    const code = (cfx.includes('/') ? cfx.split('/').pop() : cfx).trim();
    if(!code) return null;
    const urls = [
      `https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(code)}`,
      `https://api.cfx.re/servers/single/${encodeURIComponent(code)}`
    ];
    for(const url of urls){
      try{
        console.debug('[RealityRP] Consultando CFX API:', url);
        const resp = await fetchJSON(url);
        // Normalizamos estructura potencial
        const root = resp?.Data || resp?.data || resp;
        const d = root?.Data || root;
        const playersRaw = d?.players || d?.Players || d?.playersList || [];
        const players = Array.isArray(playersRaw)
          ? playersRaw.map(p=>({ name: p?.name || p?.Name || p?.n || 'Jugador' })).filter(p=>p.name)
          : [];
        const clients = d?.clients ?? d?.Clients ?? (Array.isArray(players) ? players.length : undefined);
        const max = d?.svMaxclients ?? d?.sv_maxclients ?? d?.vars?.sv_maxClients ?? d?.vars?.sv_maxclients;
        const map = d?.mapname ?? d?.Mapname ?? d?.vars?.mapname;
        const build = d?.server ?? d?.version ?? d?.Server ?? d?.vars?.sv_enforceGameBuild;
        const online = Number.isFinite(Number(clients)) || Boolean(d?.connectEndPoints?.length);
        const result = { online: !!online, clients: clients ?? 0, max: max ?? '—', map: map || '—', build: build || '—', players };
        console.debug('[RealityRP] CFX API OK:', { url, online: result.online, clients: result.clients, max: result.max, map: result.map, players: result.players?.length });
        return result;
      }catch(err){
        console.warn('[RealityRP] Fallback CFX endpoint falló:', url, err?.message || err);
      }
    }
    return null;
  }

  // Fallback: obtener estado desde un JSON estático generado por workflow
  async function getCachedStatus(){
    try{
      const url = `data/status.json?ts=${Date.now()}`;
      const d = await fetchJSON(url);
      if(!d) return null;
      // Validar forma
      if(typeof d.online === 'boolean') return d;
      return null;
    }catch(_){ return null; }
  }
  async function refreshStatus(){
    let base = buildBaseUrl();
    const onlineEl = document.getElementById('srv-online');
    const playersEl = document.getElementById('srv-players');
    const maxEl = document.getElementById('srv-max');
    const mapEl = document.getElementById('srv-map');
  const buildEl = document.getElementById('srv-build');
  const badge = document.getElementById('status-badge');
  const list = document.getElementById('players-list');
  const updatedEl = document.getElementById('srv-updated');
    // Modo prueba (si está activado en config) -> desactivado por defecto
    if(cfg.fivem?.forceOnline){
      if(onlineEl) onlineEl.textContent = 'ON';
      if(playersEl) playersEl.textContent = '12';
      if(maxEl) maxEl.textContent = '64';
      if(mapEl) mapEl.textContent = 'Los Santos';
      if(buildEl) buildEl.textContent = 'FXServer';
      if(badge){
        badge.textContent = 'Estado: Activo';
        badge.classList.remove('down');
        badge.classList.add('ok');
      }
      if(list){
        list.innerHTML = ['Alex','Maya','Leo','Nico','Sara','Juan'].map((n)=>`<div class="player-item"><span>${n}</span></div>`).join('');
      }
      return;
    }
    try{
      // Pre-estado
      if(onlineEl) onlineEl.textContent = '…';
      if(playersEl) playersEl.textContent = '…';
      // En HTTPS (GitHub Pages), evitamos Mixed Content http://IP:PUERTO
      const isHttps = location.protocol === 'https:';
      if(isHttps && base && base.startsWith('http://')){
        base = null; // bloquear llamadas directas http
      }

      // Primero intentamos cfx.re (HTTPS)
      let usedCfx = false;
  if(cfg.fivem?.cfx){
        const cfxStat = await getCfxStatus();
        if(cfxStat){
          usedCfx = true;
          if(onlineEl) onlineEl.textContent = cfxStat.online ? 'ON' : 'OFF';
          if(playersEl) playersEl.textContent = cfxStat.clients ?? '—';
          if(maxEl) maxEl.textContent = cfxStat.max ?? '—';
          if(mapEl) mapEl.textContent = cfxStat.map ?? '—';
          if(buildEl) buildEl.textContent = cfxStat.build ?? '—';
          if(badge){
            if(cfxStat.online){
              badge.textContent = 'Estado: Activo';
              badge.classList.remove('down');
              badge.classList.add('ok');
            } else {
              badge.textContent = 'Estado: Off';
              badge.classList.remove('ok');
              badge.classList.add('down');
            }
          }
          if(list){
            const arr = Array.isArray(cfxStat.players) ? cfxStat.players : [];
            list.innerHTML = arr.length ? arr.map(p=>`<div class="player-item"><span>${p.name}</span></div>`).join('') : '<div class="player-item"><span>Sin jugadores conectados</span></div>';
          }
          if(updatedEl){ updatedEl.textContent = 'Última actualización: ' + new Date().toLocaleTimeString(); }
        } else {
          console.warn('[RealityRP] Sin datos desde CFX (puede estar offline/no listado). Intentando endpoints directos si es seguro...');
        }
      }

  // Si no usamos cfx o queremos datos más precisos, intentamos endpoints directos cuando sea seguro
      if(!usedCfx){
        if(!base){
          // intentar resolver por cfx a IP (solo si la página no es HTTPS o el destino es https)
          const resolved = await getCfxResolvedBase();
          if(resolved && (!isHttps || resolved.startsWith('https://'))){
            base = resolved;
          }
        }
  if(!base) throw new Error('Sin IP configurada');
  console.debug('[RealityRP] Consultando endpoints directos:', base);
        const [dRes, iRes, pRes] = await Promise.allSettled([
          fetchJSON(`${base}/dynamic.json`),
          fetchJSON(`${base}/info.json`),
          fetchJSON(`${base}/players.json`)
        ]);
        const dyn = dRes.status === 'fulfilled' ? dRes.value : null;
        const info = iRes.status === 'fulfilled' ? iRes.value : null;
        const players = pRes.status === 'fulfilled' ? pRes.value : null;
        const online = !!(dyn || info);
  console.debug('[RealityRP] Endpoints directos:', { online, clients: dyn?.clients, players: Array.isArray(players) ? players.length : 0 });
        if(onlineEl) onlineEl.textContent = online ? 'ON' : 'OFF';
        if(playersEl) playersEl.textContent = (dyn?.clients ?? (Array.isArray(players) ? players.length : 0) ?? 0);
        if(maxEl) maxEl.textContent = (dyn?.sv_maxclients ?? info?.vars?.sv_maxClients ?? '—');
        if(mapEl) mapEl.textContent = (info?.mapname || info?.vars?.mapname || '—');
        if(buildEl) buildEl.textContent = (info?.server || info?.version || '—');
        if(badge){
          if(online){
            badge.textContent = 'Estado: Activo';
            badge.classList.remove('down');
            badge.classList.add('ok');
          } else {
            badge.textContent = 'Estado: Off';
            badge.classList.remove('ok');
            badge.classList.add('down');
          }
        }
  const arr = Array.isArray(players) ? players : [];
  if(list){
          list.innerHTML = arr.length ? arr.map(p=>`<div class="player-item"><span>${p.name}</span></div>`).join('') : '<div class="player-item"><span>Sin jugadores conectados</span></div>';
  }
  if(updatedEl){ updatedEl.textContent = 'Última actualización: ' + new Date().toLocaleTimeString(); }
      }

      // Si seguimos sin datos, usar caché (workflow)
      if(!usedCfx){
        const cache = await getCachedStatus();
        if(cache){
          if(onlineEl) onlineEl.textContent = cache.online ? 'ON' : 'OFF';
          if(playersEl) playersEl.textContent = cache.clients ?? '—';
          if(maxEl) maxEl.textContent = cache.max ?? '—';
          if(mapEl) mapEl.textContent = cache.map ?? '—';
          if(buildEl) buildEl.textContent = cache.build ?? '—';
          if(badge){
            if(cache.online){
              badge.textContent = 'Estado: Activo';
              badge.classList.remove('down');
              badge.classList.add('ok');
            } else {
              badge.textContent = 'Estado: Off';
              badge.classList.remove('ok');
              badge.classList.add('down');
            }
          }
          if(list){
            const arr = Array.isArray(cache.players) ? cache.players : [];
            list.innerHTML = arr.length ? arr.map(p=>`<div class="player-item"><span>${p.name}</span></div>`).join('') : '<div class="player-item"><span>Sin jugadores conectados</span></div>';
          }
          if(updatedEl){ updatedEl.textContent = 'Última actualización: ' + (cache.updatedAt || new Date().toLocaleTimeString()); }
          console.debug('[RealityRP] Usando caché de status (workflow)');
          return; // fin
        }
      }
    }catch(err){
      console.error('[RealityRP] Error al obtener estado:', err);
  if(onlineEl) onlineEl.textContent = 'OFF';
      if(playersEl) playersEl.textContent = '—';
      if(maxEl) maxEl.textContent = '—';
      if(mapEl) mapEl.textContent = '—';
      if(buildEl) buildEl.textContent = '—';
      if(badge){
        badge.textContent = 'Estado: Off';
        badge.classList.remove('ok');
        badge.classList.add('down');
      }
      if(list){
        list.innerHTML = '<div class="player-item"><span>No disponible</span><span class="meta">Error al consultar API</span></div>';
      }
    }
  }

  // Botones conectar/copiar
  function setupConnectButtons(){
    const ipTxt = document.getElementById('ip-text');
    const btnConn = document.getElementById('btn-conectar');
    const btnCopy = document.getElementById('btn-copiar');
    const btnCfx = document.getElementById('btn-cfx');
    const ip = cfg.fivem?.ip || '127.0.0.1';
    const port = cfg.fivem?.port || 30120;
    const cfx = cfg.fivem?.cfx;
    if(cfx && cfg.fivem?.showIP === false){
      ipTxt.textContent = `CFX: ${cfx}`;
    } else {
      ipTxt.textContent = `IP: ${ip}:${port}`;
    }
    if(cfx){
      btnCfx.href = `https://${cfx}`;
      btnCfx.style.display = '';
    } else if(btnCfx){
      btnCfx.style.display = 'none';
    }
    btnConn?.addEventListener('click', ()=>{
      // Intentar abrir FiveM con cfx o IP
      if(cfx){
  window.location.href = `fivem://connect/${cfx}`;
      } else {
        window.location.href = `fivem://connect/${ip}:${port}`;
      }
    });
  btnCopy?.addEventListener('click', async ()=>{
      try{
    const text = (cfx && cfg.fivem?.showIP === false) ? cfx : `${ip}:${port}`;
    await navigator.clipboard.writeText(text);
    btnCopy.innerHTML = '<i class="fa-regular fa-circle-check"></i> Copiado';
    setTimeout(()=> btnCopy.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar IP', 1500);
      }catch(e){
    alert('No se pudo copiar. Copia manualmente: '+ ((cfx && cfg.fivem?.showIP === false) ? cfx : (ip+':'+port)) );
      }
    });
  }

  function init(){
    applyBrand();
    // Resaltar link activo en navegación
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('#nav a').forEach(a=>{
      const href = a.getAttribute('href');
      if(!href) return;
      const norm = href.toLowerCase();
      if((path === '' && norm.endsWith('index.html')) || (norm && norm.indexOf(path) !== -1)){
        a.classList.add('active');
      }
    });
    renderFeatures();
    renderEvents();
    renderGallery();
    renderStaff();
    renderFAQ();
    renderHome();
    setupConnectButtons();
    // En home ya no mostramos estado detallado; se mantiene el texto de IP y acciones.
    // En otras páginas sí se refresca el estado (si existen elementos)
    refreshStatus();
    // Reveal on scroll
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
    },{threshold:.1});
    document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
    const interval = Math.max(8000, cfg.fivem?.refreshMs || 15000);
    setInterval(refreshStatus, interval);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
