(function(){
  const override = {
    fivem: {
      // Preferimos cfx para que funcione desde GitHub Pages sin proxy
      cfx: 'cfx.re/join/4djzaoy',
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
    // Noticias y Eventos editables sin tocar HTML
    news: [
      {
        title: 'Apertura del servidor',
        caption: '¡Apertura oficial!',
        text: 'Whitelist abierta en Discord, información de horarios y normas clave antes del día de apertura.',
        image: 'assets/img/placeholder.svg',
        tags: ['Anuncio','Discord']
      },
      {
        title: 'Informe de desarrollo',
        caption: 'Estado del desarrollo',
        text: 'Economía viva, mejoras a trabajos legales y ajustes de vehículos. Próximos pasos: facciones, eventos y optimización.',
        image: 'assets/img/placeholder.svg',
        tags: ['Devlog','Mejoras']
      }
    ],
    events: [
      {
        title: 'Carrera urbana',
        caption: 'Carrera urbana',
        text: 'Clasificatorias y final con reglamento RP. Inscripción por Discord, licencias al día y premios en efectivo.',
        image: 'assets/img/placeholder.svg',
        tags: ['Competitivo','Legal']
      },
      {
        title: 'Noche de comunidad',
        caption: 'Noche de comunidad',
        text: 'Shows, mini-juegos y presentaciones de facciones. Ideal para integrarte y conocer la comunidad.',
        image: 'assets/img/placeholder.svg',
        tags: ['Social','Comunidad']
      }
    ]
  };
  if(window.SITE_CONFIG){
    window.SITE_CONFIG = Object.assign({}, window.SITE_CONFIG, {
      fivem: Object.assign({}, window.SITE_CONFIG.fivem, override.fivem),
      brand: Object.assign({}, window.SITE_CONFIG.brand, override.brand),
      news: override.news ?? window.SITE_CONFIG.news,
      events: override.events ?? window.SITE_CONFIG.events
    });
  } else {
    window.SITE_CONFIG = override;
  }
})();
