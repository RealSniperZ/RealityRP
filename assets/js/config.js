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
    }
  };
  if(window.SITE_CONFIG){
    window.SITE_CONFIG.fivem = Object.assign({}, window.SITE_CONFIG.fivem, override.fivem);
    window.SITE_CONFIG.brand = Object.assign({}, window.SITE_CONFIG.brand, override.brand);
  } else {
    window.SITE_CONFIG = override;
  }
})();
