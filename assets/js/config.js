(function(){
  const override = {
    fivem: {
      // Preferimos cfx para que funcione desde GitHub Pages sin proxy
  cfx: 'https://cfx.re/join/4djzao',
      // Si no quieres mostrar IP públicamente
      showIP: false,
      // Intervalo de refresco
      refreshMs: 10000,
      // Si prefieres usar IP:PUERTO directamente, descomenta y elimina showIP si deseas mostrarla
      // ip: '79.116.6.42',
      // port: 30120,
      // baseOverride: 'https://tu-dominio/fivem' // deja vacío en Pages
    }
    ,
    brand: {
      // Sube tu imagen a assets/img/logo.png (o cambia la ruta aquí)
      logo: 'assets/img/logo.png'
    },
    // Enlaces de redes
    links: {
  tiktok: 'https://www.tiktok.com/@realityrpserver?_t=ZN-8zLkEHbDS5e&_r=1',
  discord: 'https://discord.com/invite/k6MBG3jjNY'
    },
    // Noticias y Eventos editables sin tocar HTML
    news: [
      {
        title: 'Apertura del servidor',
        caption: '¡Apertura oficial!',
        text: 'Sin Whitelist Operativo 24/ solo para vosotros jugadores',
  image: 'assets/img/fondo%202.png',
        tags: ['Anuncio','Discord']
      },
      {
        title: 'Informe de desarrollo',
        caption: 'Estado del desarrollo',
        text: 'Economía viva, mejoras a trabajos legales y ajustes de vehículos. Próximos pasos: facciones, eventos y mas',
  image: 'assets/img/fondo3.png',
        tags: ['Devlog','Mejoras']
      }
    ],
  events: [
      {
        title: 'Carrera urbana',
        caption: 'Carrera urbana',
        text: 'Clasificatorias y final con reglamento RP. Inscripción por Discord, licencias al día y premios Ic con recompensas para el jugador.',
        image: 'assets/img/carrera.jpg',
        tags: ['Competitivo','Legal']
      },
      {
        title: 'Noche de comunidad',
        caption: 'Noche de comunidad',
        text: 'Shows, mini-juegos y presentaciones de facciones. Ideal para integrarte y conocer la comunidad.',
        image: 'assets/img/casino.png',
        tags: ['Social','Comunidad']
      }
    ],
    // Secciones de Staff configurables (add staffSections here)
  };
  if(window.SITE_CONFIG){
    window.SITE_CONFIG = Object.assign({}, window.SITE_CONFIG, {
      fivem: Object.assign({}, window.SITE_CONFIG.fivem, override.fivem),
      brand: Object.assign({}, window.SITE_CONFIG.brand, override.brand),
  links: Object.assign({}, window.SITE_CONFIG.links, override.links),
      news: override.news ?? window.SITE_CONFIG.news,
      events: override.events ?? window.SITE_CONFIG.events,
      staffSections: override.staffSections ?? window.SITE_CONFIG.staffSections
    });
  } else {
    window.SITE_CONFIG = override;
  }
})();
