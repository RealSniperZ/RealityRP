// Configuración de ejemplo. Crea un archivo assets/js/config.js para personalizar.
window.SITE_CONFIG = {
  brand: {
    name: 'RealityRP',
  logo: 'assets/img/logo.png',
    tagline: 'Vive el roleplay al máximo. Economía, facciones, trabajos y eventos únicos.'
  },
  fivem: {
    // Puedes usar la IP:PUERTO o el código cfx.re
    ip: 'https://cfx.re/join/4djzao',
    port: 30120,
    cfx: 'https://cfx.re/join/4djzao',
    // Intervalo de actualización en milisegundos
    refreshMs: 15000
  },
  links: {
    discord: 'https://discord.gg/yourinvite',
    tiktok: 'https://tiktok.com/@yourhandle'
  },
  // Sonidos personalizados: coloca tus archivos en assets/sound y referencia las rutas
  // Formatos recomendados: .mp3 o .ogg de corta duración (<200ms)
  // volume (0..1) ajusta el volumen general de los efectos
  sfx: {
  hover: 'assets/sound/hover.mp3',
    click: 'assets/sound/ps5_trophy.mp3',
    enter: 'assets/sound/ps5_notification.mp3',
  volume: 1.2,
    // Sonidos por página (clave = nombre del archivo .html)
    pages: {
  'index.html': { enter: 'assets/sound/ps5_notification.mp3', click: 'assets/sound/ps5_trophy.mp3' },
  'facciones.html': { enter: 'assets/sound/enter-faction.mp3' },
  'caracteristicas.html': { enter: 'assets/sound/enter-feat.mp3', click: 'assets/sound/click-feat.mp3' },
  'eventos.html': { enter: 'assets/sound/enter-events.mp3' },
  'staff.html': { click: 'assets/sound/click-staff.mp3' },
  'galeria.html': { enter: 'assets/sound/enter-gallery.mp3' },
  'faq.html': { click: 'assets/sound/click-faq.mp3' }
    },
    // Retardo (ms) antes de navegar para que el sonido de click se escuche
  navDelayMs: 600
  },
  features: [
    { icon: 'fa-solid fa-handshake-angle', title: 'Roleplay serio', text: 'Reglas claras, administración activa y guías para integrar nuevos jugadores.' },
    { icon: 'fa-solid fa-briefcase', title: 'Trabajos únicos', text: 'Policía, EMS, mecánico, camionero, minero, y más con progresión.' },
    { icon: 'fa-solid fa-sack-dollar', title: 'Economía viva', text: 'Mercado dinámico, subastas y propiedades.' },
    { icon: 'fa-solid fa-gun', title: 'Acción balanceada', text: 'Conflictos con consecuencias y sin pay-to-win.' },
    { icon: 'fa-solid fa-car-side', title: 'Vehículos', text: 'Flota variada, tuning y mantenimiento realista.' },
    { icon: 'fa-solid fa-users', title: 'Eventos RP', text: 'Carreras, shows y misiones comunitarias semanales.' }
  ],
  events: [
    { title: 'Apertura de temporada', date: '2025-09-05', text: 'Nuevas facciones y rework de economía.', image: 'assets/img/event1.jpg' },
    { title: 'Carrera urbana', date: '2025-09-12', text: 'Clasificatorias viernes, final sábado 22:00hs.', image: 'assets/img/event2.jpg' },
    { title: 'Noche de talentos', date: '2025-09-19', text: 'Premios en efectivo y roles especiales.', image: 'assets/img/event3.jpg' }
  ],
  gallery: [
    { src: 'assets/img/atardecer.png', caption: 'Downtown al atardecer' },
    { src: 'assets/img/patrulla.png', caption: 'Patrulla en acción' },
    { src: 'assets/img/coches.png', caption: 'Meet de autos' },
  { src: 'assets/img/casino.png', caption: 'Operativo EMS' }
  ],
  staff: [
  { name: 'El_Jali', role: 'Owner', avatar: 'assets/img/logo.png', functions: ['Dirección del proyecto', 'Comunicación con comunidad', 'Creación de contenido', 'Gestión de redes sociales'] },
    { name: 'Real Sniper Z', role: 'Owner/Programador', avatar: 'assets/img/logo sniper.gif', functions: ['Soporte a jugadores', 'Moderación', 'Eventos RP', 'Programación y desarrollo'] }
  ],
  faq: [
    { q: '¿Cómo me conecto?', a: 'Usa el botón Conectar o agrega la IP en Favoritos dentro de FiveM.' },
    { q: '¿Necesito whitelist?', a: 'No, Puedes unirte sin problemas. Tan solo cumple con las reglas.' },
    { q: '¿Reglas principales?', a: 'Respeta el rol, evita el meta/powergaming y sigue las normas de tráfico.' },
    { q: '¿Cómo hago las donaciones?', a: 'Puedes hacer donaciones a través de nuestro Discord donde encontrarás más información.' },
    { q: '¿Puedo apelar una sanción?', a: 'Sí, puedes apelar una sanción contactando a un administrador en Discord.' },
    { q: '¿Qué sanciones son apelables?', a: 'Las sanciones que no sean permanentes son apelables. o aquellas que consideres injustas.' }
  ]
};
