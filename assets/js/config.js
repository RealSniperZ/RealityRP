(function(){
  const override = {
    fivem: {
  ip: '79.116.6.42',
  port: 30120,
  refreshMs: 10000,
  cfx: 'cfx.re/join/4djzao',
  showIP: false,
  // usar proxy local (5070) para evitar CORS y consultar /dynamic.json, /info.json, /players.json
  baseOverride: 'http://localhost:5070/fivem'
    }
  };
  if(window.SITE_CONFIG){
    window.SITE_CONFIG.fivem = Object.assign({}, window.SITE_CONFIG.fivem, override.fivem);
  } else {
    window.SITE_CONFIG = override;
  }
})();
