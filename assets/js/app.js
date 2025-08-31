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
  const particles = Array.from({length: 80}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*2+0.6,
    vx: (Math.random()-.5)*0.3,
    vy: (Math.random()-.5)*0.3
  }));

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
      // Usar protocolo nativo de FiveM y fallback a HTTPS si el navegador lo bloquea
      btnCfx.href = `fivem://connect/${cfx}`;
      btnCfx.style.display = '';
      btnCfx.addEventListener('click', (e)=>{
        e.preventDefault();
        let cancelled = false;
        const onHidden = () => { cancelled = true; clearTimeout(fallbackTimer); document.removeEventListener('visibilitychange', onHidden); };
        document.addEventListener('visibilitychange', onHidden);
        const fallbackTimer = setTimeout(()=>{
          if(!cancelled){
            // Abrir la página de cfx como alternativa
            window.location.href = `https://${cfx}`;
          }
        }, 1200);
        // Intentar abrir FiveM
        window.location.href = `fivem://connect/${cfx}`;
      });
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
  }

  document.addEventListener('DOMContentLoaded', init);
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
        <img src="${item.image || 'assets/img/placeholder.svg'}" alt="${item.title || ''}">
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
