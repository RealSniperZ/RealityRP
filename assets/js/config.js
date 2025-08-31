(function(){
  const override = {
    fivem: {
      // Preferimos cfx para que funcione desde GitHub Pages sin proxy
      cfx: 'cfx.re/join/4djzao',
      // Si no quieres mostrar IP públicamente
      showIP: false,
      // Intervalo de refresco
      refreshMs: 10000,
      // Si prefieres usar IP:PUERTO directamente, descomenta y elimina showIP si deseas mostrarla
      // ip: '79.116.6.42',
      // port: 30120,
      // baseOverride: 'https://tu-dominio/fivem' // deja vacío en Pages
    }
  };
  if(window.SITE_CONFIG){
    window.SITE_CONFIG.fivem = Object.assign({}, window.SITE_CONFIG.fivem, override.fivem);
  } else {
    window.SITE_CONFIG = override;
  }
})();
