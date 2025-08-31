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
      // Abrir siempre la página del servidor en cfx.re
      const url = /^https?:\/\//i.test(cfx) ? cfx : `https://${cfx}`;
      btnCfx.href = url;
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
  const sections = Array.isArray(cfg.staffSections) ? cfg.staffSections : [];
  if(!sections.length) return;
  const container = document.getElementById('staff-grid');
  if(!container) return;
  // Limpiar grid principal y en su lugar agregaremos títulos + cards por sección
  container.innerHTML = '';
  sections.forEach(sec => {
    // Título de sección
    const h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.style.marginTop = '1.5rem';
    h2.textContent = sec.title || '';
    container.parentElement.insertBefore(h2, container.nextSibling);

    // Card de sección
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="staff-card">
        <img src="${sec.image || 'assets/img/placeholder.svg'}" alt="${sec.name || sec.title || 'Staff'}" />
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
    container.parentElement.insertBefore(article, container.nextSibling);
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
