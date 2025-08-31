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
