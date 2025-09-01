/* App principal: carga config, consulta estado FiveM, renderiza UI y efectos */
(function(){
  const cfg = window.SITE_CONFIG || {};

  // Utilidad: seleccionar
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

  // ----- Efectos de sonido (Web Audio) -----
  const SFX = (()=>{
    let ctx = null; // AudioContext perezoso (se crea al primer gesto)
    let unlocked = false;
    let muted = (localStorage.getItem('sfxMuted') === '1');
    let lastTime = 0; // limitador para no saturar
    const MIN_INTERVAL = 110; // ms
    const cache = new Map(); // Map<string, AudioBuffer>
    const loading = new Map(); // Map<string, Promise<AudioBuffer|null>>

    function ensureContext(){
      if(ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
      return ctx;
    }
    async function unlock(){
      const c = ensureContext();
      if(!c) return;
      if(c.state === 'suspended'){
        try{ await c.resume(); }catch{}
      }
      unlocked = (c.state === 'running');
    }
    function setMuted(v){
      muted = !!v; localStorage.setItem('sfxMuted', muted ? '1' : '0');
      updateToggleUI();
    }
    function updateToggleUI(){
      const btn = document.getElementById('audio-toggle');
      if(!btn) return;
      btn.setAttribute('aria-pressed', (!muted).toString());
      const ico = btn.querySelector('i');
      if(ico){
        ico.className = muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
      }
      btn.title = muted ? 'Sonido desactivado' : 'Sonido activado';
    }
    function playTone({freq=440, duration=0.08, type='sine', gain=0.03}){
      const now = performance.now();
      if(now - lastTime < MIN_INTERVAL) return; // limitar frecuencia
      lastTime = now;
      if(muted) return;
      const c = ensureContext();
      if(!c) return;
      if(!unlocked) return; // hasta primer gesto
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const vol = (function(){
        const cfgS = (window.SITE_CONFIG && window.SITE_CONFIG.sfx) ? window.SITE_CONFIG.sfx : null;
        const v = (cfgS && typeof cfgS.volume === 'number') ? cfgS.volume : 1;
        return Math.max(0, Math.min(1.5, v));
      })();
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(gain * vol, c.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
      osc.connect(g).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration + 0.02);
    }
    function getCfg(){ return (window.SITE_CONFIG && window.SITE_CONFIG.sfx) ? window.SITE_CONFIG.sfx : null; }
    function getVolume(){
      const cfg = getCfg();
      const v = (cfg && typeof cfg.volume === 'number') ? cfg.volume : 1;
      return Math.max(0, Math.min(1, v));
    }
    async function getBuffer(key, url){
      if(cache.has(key)) return cache.get(key);
      if(loading.has(key)) return loading.get(key);
      const p = (async ()=>{
        try{
          const res = await fetch(url, { cache: 'force-cache' });
          if(!res.ok) throw new Error('SFX http '+res.status);
          const arr = await res.arrayBuffer();
          const c = ensureContext(); if(!c) return null;
          return await c.decodeAudioData(arr);
        }catch(e){
          return null;
        }
      })();
      loading.set(key, p);
      const buf = await p;
      loading.delete(key);
      if(buf) cache.set(key, buf);
      return buf;
    }
    async function playFile(key, url){
      const nowP = performance.now();
      if(nowP - lastTime < MIN_INTERVAL) return; // limitar exuberancia
      lastTime = nowP;
      if(muted) return;
      const c = ensureContext(); if(!c) return;
      if(!unlocked) return;
      const buf = await getBuffer(key, url);
      if(!buf) return; // si falla la carga, salimos silenciosos
      const src = c.createBufferSource();
      src.buffer = buf;
  const g = c.createGain();
  g.gain.value = 0.8 * getVolume();
      src.connect(g).connect(c.destination);
      try{ src.start(); }catch{}
    }
    function playCustomOrTone(kind, toneOpts){
      const s = getCfg();
      const url = s && s[kind];
      if(url){
        // reproducir sin bloquear el hilo; fallback a tono si falla silenciosamente
        playFile(kind, url);
      } else {
        playTone(toneOpts);
      }
    }
    function hover(){
      // leve "pip" brillante o archivo configurado
      playCustomOrTone('hover', {freq: 720, duration: 0.06, type: 'triangle', gain: 0.025});
    }
    function click(){
      // clic breve con caída o archivo configurado
      playCustomOrTone('click', {freq: 520, duration: 0.06, type: 'square', gain: 0.03});
    }
    function enter(){
      const s = getCfg();
      const url = s && s.enter;
      if(url){ playFile('enter', url); return; }
      // pequeño "chime" doble por defecto
      const c = ensureContext();
      if(!c || muted || !unlocked) return;
      const now = c.currentTime;
      const make = (f, t, g=0.02)=>{
        const o = c.createOscillator(); const gg = c.createGain();
        o.type='sine'; o.frequency.setValueAtTime(f, now);
        gg.gain.setValueAtTime(0, now);
        gg.gain.linearRampToValueAtTime(g, now+0.01);
        gg.gain.exponentialRampToValueAtTime(0.0001, now+t);
        o.connect(gg).connect(c.destination); o.start(now); o.stop(now+t+0.02);
      };
      make(660, 0.18, 0.018);
      make(990, 0.16, 0.014);
    }
    // UI: botón de mute inyectado en header
    function injectToggle(){
      try{
        const header = document.querySelector('.header-inner');
        if(!header) return;
        if(document.getElementById('audio-toggle')) return;
        const btn = document.createElement('button');
        btn.id = 'audio-toggle';
        btn.className = 'btn btn-icon btn-ghost';
        btn.type = 'button';
        btn.setAttribute('aria-label','Alternar sonido');
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        const navTgl = document.getElementById('nav-toggle');
        if(navTgl && navTgl.parentElement === header){
          header.insertBefore(btn, navTgl);
        } else {
          header.appendChild(btn);
        }
        btn.addEventListener('click', async ()=>{
          await unlock();
          setMuted(!muted);
          if(!muted){ click(); }
        });
        updateToggleUI();
      }catch{}
    }
    // Eventos globales
    function attachGlobal(){
      // Desbloquear al primer gesto
      const oneUnlock = async ()=>{ await unlock(); document.removeEventListener('pointerdown', oneUnlock); };
      document.addEventListener('pointerdown', oneUnlock, {once:true});
      // Hover en elementos interactivos (solo mouse)
      document.addEventListener('mouseenter', (e)=>{
        const t = e.target;
        if(!(t instanceof Element)) return;
        if(window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return; // evitar en táctil
        if(t.closest('[data-silent="1"]')) return;
        if(t.matches('a, button, .card-hover, .accordion-header, .carousel-btn, .staff-card')) hover();
      }, true);
      // Click
      document.addEventListener('click', (e)=>{
        const t = e.target;
        if(!(t instanceof Element)) return;
        if(t.closest('#audio-toggle')) return; // ya suena ahí
        if(t.closest('[data-silent="1"]')) return;
        if(t.matches('a, button, .accordion-header, .carousel-btn')) click();
      }, true);
    }
    function pageKeyFromHref(href){
      try{
        const u = new URL(href, location.href);
        if(u.origin !== location.origin) return null;
        let key = u.pathname.split('/').pop() || 'index.html';
        key = key.toLowerCase();
        if(!key.endsWith('.html')){
          // si es carpeta o ruta vacía, asumir index.html
          key = 'index.html';
        }
        return key;
      }catch{ return null; }
    }
    function enterForPage(pageKey){
      const s = getCfg();
      const url = (s && s.pages && s.pages[pageKey] && s.pages[pageKey].enter) ? s.pages[pageKey].enter : null;
      if(url){ playFile('enter:'+pageKey, url); return; }
      enter();
    }
    function clickForPage(pageKey){
      const s = getCfg();
      const url = (s && s.pages && s.pages[pageKey] && s.pages[pageKey].click) ? s.pages[pageKey].click : null;
      if(url){ playFile('click:'+pageKey, url); return; }
      // fallback a click global
      const urlGlobal = s && s.click;
      if(urlGlobal){ playFile('click', urlGlobal); return; }
      // fallback a tono
      playTone({freq: 520, duration: 0.06, type: 'square', gain: 0.03});
    }
    function isReady(){ return !!ctx && unlocked && !muted; }
    function attachNavInterceptors(){
      document.addEventListener('click', (e)=>{
        const a = e.target && (e.target.closest ? e.target.closest('a') : null);
        if(!a) return;
        if(a.target && a.target !== '' && a.target !== '_self') return; // no interceptar nuevas pestañas
        if(a.hasAttribute('download')) return;
        const href = a.getAttribute('href') || '';
        if(!href || href.startsWith('#')) return;
        if(a.closest('[data-silent="1"]')) return;
        const key = pageKeyFromHref(href);
        if(!key) return;
        // Reproducir sonido específico y aplicar retardo opcional
        const s = getCfg();
  const delay = (s && typeof s.navDelayMs === 'number') ? Math.max(0, Math.min(1500, s.navDelayMs)) : 600;
        // Si listo para audio, interceptar y retrasar navegación para escuchar el sonido
        if(isReady()){
          e.preventDefault();
          try{ clickForPage(key); }catch{}
          // Mostrar overlay fade-out
          try{
            let fader = document.getElementById('page-fader');
            if(!fader){ fader = document.createElement('div'); fader.id='page-fader'; document.body.appendChild(fader); }
            // forzar reflow para transicionar
            // eslint-disable-next-line no-unused-expressions
            fader.offsetHeight; fader.classList.add('show');
          }catch{}
          setTimeout(()=>{ window.location.href = a.href; }, delay);
        } else {
          // no listo: que navegue normal; intentar reproducir sin bloquear
          try{ clickForPage(key); }catch{}
        }
      }, true);
    }
    return { injectToggle, attachGlobal, attachNavInterceptors, updateToggleUI, setMuted, enter, enterForPage, clickForPage };
  })();

  // Canvas fondo con partículas
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas?.getContext('2d');
  function resize(){ if(!canvas) return; canvas.width=innerWidth; canvas.height=innerHeight; }
  window.addEventListener('resize', resize); resize();
  // Partículas de fondo
  const particles = (canvas ? Array.from({length: 80}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*2+0.6,
    vx: (Math.random()-.5)*0.3,
    vy: (Math.random()-.5)*0.3
  })) : []);
  // Estela del cursor (rosa)
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const trail = [];
  const MAX_TRAIL = 140;
  const addTrailPoint = (x,y)=>{
    if(reduceMotion || !canvas) return;
    trail.push({x,y,alpha:1, r:4});
    if(trail.length>MAX_TRAIL) trail.shift();
  };
  window.addEventListener('mousemove', (e)=>{
    if(!canvas) return;
    addTrailPoint(e.clientX, e.clientY);
  });
  window.addEventListener('touchmove', (e)=>{
    if(!canvas) return;
    const t = e.touches && e.touches[0];
    if(t) addTrailPoint(t.clientX, t.clientY);
  }, {passive:true});
  // Dibujo de partículas y estela
  function stepParticles(){
    if(!ctx || !canvas) return;
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>canvas.width) p.vx*=-1;
      if(p.y<0||p.y>canvas.height) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(124,77,255,0.6)';
      ctx.fill();
    }
  }
  function drawTrail(){
    if(reduceMotion || !ctx) return;
    // Degradar alfa y dibujar líneas suaves entre puntos
    for(let i=0;i<trail.length;i++){
      const a = trail[i];
      a.alpha -= 0.02;
    }
    while(trail.length && trail[0].alpha<=0){ trail.shift(); }
    for(let i=0;i<trail.length-1;i++){
      const a = trail[i], b = trail[i+1];
      const alpha = Math.max(0, Math.min(1, a.alpha));
      ctx.strokeStyle = `rgba(255,0,168,${alpha*0.7})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      // Brillo puntual
      ctx.beginPath();
      ctx.arc(a.x, a.y, 2.2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,0,168,${alpha})`;
      ctx.fill();
    }
  }
  function animate(){
    if(!ctx || !canvas) return; 
    requestAnimationFrame(animate);
    // Limpiar completamente para no oscurecer texto
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stepParticles();
    drawTrail();
  }
  if(canvas && ctx) animate();

  // Marca, enlaces y utilidades UI
  function applyBrand(){
    // Marca
    const name = cfg.brand?.name || 'RealityRP';
    const logo = cfg.brand?.logo || 'assets/img/logo.png';
    const brandNameEl = document.getElementById('brand-name');
    if(brandNameEl) brandNameEl.textContent = name;
    document.querySelectorAll('img.logo').forEach(img=>{ img.src = logo; img.alt = name; });
    // Footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    const footerName = document.getElementById('footer-name');
    if(footerName) footerName.textContent = name;
    // Social/Discord
    const links = cfg.links || {};
  const discordBtn = document.getElementById('discord-link');
  if(discordBtn && links.discord) discordBtn.href = links.discord;
  const discordBtnCta = document.getElementById('discord-link-cta');
  if(discordBtnCta && links.discord) discordBtnCta.href = links.discord;
    const sd = document.getElementById('social-discord');
    if(sd && links.discord) sd.href = links.discord;
    const stw = document.getElementById('social-twitch');
    if(stw && links.twitch) stw.href = links.twitch;
    const sy = document.getElementById('social-youtube');
    if(sy && links.youtube) sy.href = links.youtube;
    const stk = document.getElementById('social-tiktok');
    if(stk && links.tiktok) stk.href = links.tiktok;
    // Toggle navegación en móviles
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    if(nav && navToggle){
      navToggle.addEventListener('click', ()=> nav.classList.toggle('open'));
      // Accesibilidad: cerrar menú al elegir un enlace en móvil
      nav.addEventListener('click', (e)=>{
        const a = e.target.closest('a');
        if(a && nav.classList.contains('open')){
          nav.classList.remove('open');
        }
      });
    }
  // Inyectar botón de sonido
  try{ SFX.injectToggle(); }catch{}
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
      // Abrir siempre la página del servidor en cfx.re
      const url = /^https?:\/\//i.test(cfx) ? cfx : `https://${cfx}`;
      btnCfx.href = url;
      btnCfx.style.display = '';
    } else if(btnCfx){
      btnCfx.style.display = 'none';
    }
    btnConn?.addEventListener('click', ()=>{
      // Abrir siempre la página del servidor en cfx.re si está configurado
      if(cfx){
        const url = /^https?:\/\//i.test(cfx) ? cfx : `https://${cfx}`;
        window.location.href = url;
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
  if(typeof applyBrand === 'function') applyBrand();
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
  // Llamadas opcionales (dependen de que existan en el proyecto)
  try{ if(typeof renderFeatures === 'function') renderFeatures(); }catch{}
  try{ if(typeof renderEvents === 'function') renderEvents(); }catch{}
  try{ if(typeof renderGallery === 'function') renderGallery(); }catch{}
  try{ if(typeof renderStaff === 'function') renderStaff(); }catch{}
  try{ if(typeof renderFAQ === 'function') renderFAQ(); }catch{}
  try{ if(typeof renderHome === 'function') renderHome(); }catch{}
    setupConnectButtons();
  // Estado/jugadores eliminado por decisión de producto.
    // Reveal on scroll
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
    },{threshold:.1});
    document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
  // Sin estado/jugadores, no programamos intervalos.
  // Orientar zoom en imágenes hacia el puntero
  try{
    const cards = document.querySelectorAll('.visual-card');
    cards.forEach(card=>{
      card.addEventListener('mousemove', (e)=>{
        const rect = card.getBoundingClientRect();
        const px = ((e.clientX - rect.left)/rect.width)*100;
        const py = ((e.clientY - rect.top)/rect.height)*100;
        card.style.setProperty('--px', px+'%');
        card.style.setProperty('--py', py+'%');
      });
      card.addEventListener('mouseleave', ()=>{
        card.style.removeProperty('--px');
        card.style.removeProperty('--py');
      });
    });
  }catch{}
  }

  document.addEventListener('DOMContentLoaded', init);
  // Intentar reproducir un pequeño sonido al entrar (cuando el contexto esté desbloqueado)
  document.addEventListener('DOMContentLoaded', ()=>{
    const pageKey = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const tryEnter = ()=>{ try{ SFX.enterForPage(pageKey); }catch{} };
    // Si el contexto ya está desbloqueado por algún gesto previo
    tryEnter();
    // En caso contrario, reproducir tras el primer gesto en esta página
    const once = ()=>{ tryEnter(); document.removeEventListener('pointerdown', once); };
    document.addEventListener('pointerdown', once, {once:true});
    // Preparar handlers globales
    try{ SFX.attachGlobal(); }catch{}
    try{ SFX.attachNavInterceptors(); }catch{}
    // Fade-in al cargar
    try{
      let fader = document.getElementById('page-fader');
      if(!fader){ fader = document.createElement('div'); fader.id='page-fader'; document.body.appendChild(fader); }
      // empezar visible y ocultar tras un frame
      fader.classList.add('show');
      requestAnimationFrame(()=>{
        fader.classList.remove('show');
      });
    }catch{}
  });
})();

// Render de noticias y eventos desde configuración
function renderEvents(){
  const cfg = window.SITE_CONFIG || {};
  const news = Array.isArray(cfg.news) ? cfg.news.slice(0, 2) : [];
  const events = Array.isArray(cfg.events) ? cfg.events.slice(0, 2) : [];
  const newsGrid = document.getElementById('news-grid');
  const eventsGrid = document.getElementById('events-grid');
  const makeCard = (item)=>{
    const art = document.createElement('article');
    art.className = 'card card-hover';
  art.innerHTML = `
      <figure class="visual-card" style="margin:0 0 .8rem;">
    <img src="${item.image || 'assets/img/placeholder.svg'}" alt="${item.title || ''}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'">
        ${item.caption ? `<figcaption>${item.caption}</figcaption>` : ''}
      </figure>
      <h3 class="section-title" style="font-size:1.25rem; margin:.2rem 0 .5rem;">${item.title || ''}</h3>
      <p>${item.text || ''}</p>
      ${Array.isArray(item.tags) && item.tags.length ? `<div class="chips">${item.tags.map(t=>`<span class=\"chip\">${t}</span>`).join('')}</div>` : ''}
    `;
    return art;
  };
  if(newsGrid){
    newsGrid.innerHTML = '';
    news.forEach(n=> newsGrid.appendChild(makeCard(n)));
  }
  if(eventsGrid){
    eventsGrid.innerHTML = '';
    events.forEach(e=> eventsGrid.appendChild(makeCard(e)));
  }
}

// Render de galería con 4 secciones y flechas
function renderGallery(){
  const cfg = window.SITE_CONFIG || {};
  const track = document.getElementById('gal-track');
  const btnPrev = document.getElementById('gal-prev');
  const btnNext = document.getElementById('gal-next');
  if(!track) return; // No estamos en galeria.html
  const items = Array.isArray(cfg.gallery) && cfg.gallery.length
    ? cfg.gallery.slice(0, 4)
    : [
        { src: 'assets/img/placeholder.svg', caption: 'Galería 1' },
        { src: 'assets/img/placeholder.svg', caption: 'Galería 2' },
        { src: 'assets/img/placeholder.svg', caption: 'Galería 3' },
        { src: 'assets/img/placeholder.svg', caption: 'Galería 4' },
      ];
  track.innerHTML = '';
  items.forEach(it =>{
    const fig = document.createElement('figure');
    fig.className = 'carousel-slide';
    fig.innerHTML = `
      <img src="${it.src}" alt="${it.caption || ''}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'" />
      ${it.caption ? `<div class="caption">${it.caption}</div>` : ''}
    `;
    track.appendChild(fig);
  });
  // Navegación
  const getStep = () => {
    const first = track.querySelector('.carousel-slide');
    if(!first) return track.clientWidth;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || '0') || 0;
    return first.getBoundingClientRect().width + gap;
  };
  btnPrev?.addEventListener('click', ()=>{
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });
  btnNext?.addEventListener('click', ()=>{
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });
}

// Render de secciones de Staff configurables
function renderStaff(){
  const cfg = window.SITE_CONFIG || {};
  const container = document.getElementById('staff-grid');
  if(!container) return;
  container.innerHTML = '';
  // 1) Preferir lista plana de miembros desde config.example.js => SITE_CONFIG.staff
  const members = Array.isArray(cfg.staff) ? cfg.staff : [];
  if(members.length){
    members.forEach(m =>{
      const art = document.createElement('article');
      art.className = 'card';
      art.innerHTML = `
        <div class="staff-card">
          <img src="${m.avatar || 'assets/img/placeholder.svg'}" alt="${m.name || 'Staff'}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'" />
          <div>
            <div style="font-weight:700; font-size:1.05rem;">${m.name || ''}</div>
            <div class="role">${m.role || ''}</div>
          </div>
        </div>
      `;
      // Añadir funciones si existen
      if(Array.isArray(m.functions) && m.functions.length){
        const ul = document.createElement('ul');
        ul.className = 'kv';
        ul.style.marginTop = '.6rem';
        m.functions.forEach(f =>{
          const li = document.createElement('li');
          li.innerHTML = `<span>${f}</span><span></span>`;
          ul.appendChild(li);
        });
        art.appendChild(ul);
      }
      container.appendChild(art);
    });
    return;
  }
  // 2) Fallback: secciones configurables (staffSections)
  const sections = Array.isArray(cfg.staffSections) ? cfg.staffSections : [];
  if(!sections.length) return;
  sections.forEach(sec => {
    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.style.marginTop = '1.5rem';
    h2.textContent = sec.title || '';
    container.appendChild(h2);
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="staff-card">
        <img src="${sec.image || 'assets/img/placeholder.svg'}" alt="${sec.name || sec.title || 'Staff'}" onerror="this.onerror=null;this.src='assets/img/placeholder.svg'" />
        <div>
          <div style="font-weight:700; font-size:1.05rem;">${sec.name || ''}</div>
          <div class="role">${sec.role || ''}</div>
        </div>
      </div>
    `;
    const ul = document.createElement('ul');
    ul.className = 'kv';
    ul.style.marginTop = '.6rem';
    (sec.items || []).forEach(txt => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${txt}</span><span></span>`;
      ul.appendChild(li);
    });
    article.appendChild(ul);
    container.appendChild(article);
  });
}

// Render de FAQ con acordeón (clic para ver la información)
function renderFAQ(){
  const cfg = window.SITE_CONFIG || {};
  const faq = Array.isArray(cfg.faq) ? cfg.faq : [];
  const wrap = document.getElementById('faq-accordion');
  if(!wrap) return;
  const data = faq.length ? faq : [
    { q: '¿Cómo me conecto al servidor?', a: 'Pulsa el botón CFX Join de la portada o abre FiveM y usa el enlace https://cfx.re/join/xxxxxx. También puedes añadirlo a Favoritos.' },
    { q: '¿Necesito whitelist?', a: 'Sí. Únete al Discord y completa el formulario de whitelist. Revisa el canal de reglas antes de aplicar.' },
    { q: '¿Qué pasa si no cumplo las normas?', a: 'Dependiendo de la gravedad: advertencia, kick temporal o ban. El staff evalúa cada caso con evidencias.' },
    { q: '¿Edad mínima y VOIP?', a: 'Se requiere VOIP funcional y actitud madura. Consulta en el Discord si existe edad mínima vigente.' },
    { q: '¿Cómo reporto a alguien o pido soporte?', a: 'Abre un ticket en el Discord con pruebas (video/capturas) y explica el contexto de rol claramente.' },
  ];
  wrap.innerHTML = '';
  data.forEach(item =>{
    const acc = document.createElement('div');
    acc.className = 'accordion-item';
    acc.innerHTML = `
      <div class="accordion-header">
        <span>${item.q}</span>
        <i class="fa-solid fa-chevron-down"></i>
      </div>
      <div class="accordion-body">${item.a}</div>
    `;
    wrap.appendChild(acc);
  });
  // Toggle por clic
  wrap.addEventListener('click', (e)=>{
    const header = e.target.closest('.accordion-header');
    if(!header) return;
    const item = header.parentElement;
    // Cerrar otros y abrir este
    wrap.querySelectorAll('.accordion-item').forEach(it=>{
      if(it !== item) it.classList.remove('open');
    });
    item.classList.toggle('open');
  });
}
