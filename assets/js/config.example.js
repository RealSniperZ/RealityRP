// Configuración de ejemplo. Crea un archivo assets/js/config.js para personalizar.
window.SITE_CONFIG = {
  brand: {
    name: 'RealityRP',
  logo: 'assets/img/logo.png',
    tagline: 'Vive el roleplay al máximo. Economía, facciones, trabajos y eventos únicos.'
  },
  fivem: {
    // Puedes usar la IP:PUERTO o el código cfx.re
    ip: '127.0.0.1',
    port: 30120,
    cfx: 'cfx.re/join/xxxxx',
    // Intervalo de actualización en milisegundos
    refreshMs: 15000
  },
  links: {
    discord: 'https://discord.gg/yourinvite',
    twitch: 'https://twitch.tv/yourchannel',
    youtube: 'https://youtube.com/@yourchannel',
    tiktok: 'https://tiktok.com/@yourhandle'
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
    { src: 'assets/img/gal1.jpg', caption: 'Downtown al atardecer' },
    { src: 'assets/img/gal2.jpg', caption: 'Patrulla en acción' },
    { src: 'assets/img/gal3.jpg', caption: 'Meet de autos' },
    { src: 'assets/img/gal4.jpg', caption: 'Operativo EMS' }
  ],
  staff: [
    { name: 'Alex', role: 'Owner', avatar: 'assets/img/staff1.jpg' },
    { name: 'Maya', role: 'Admin', avatar: 'assets/img/staff2.jpg' },
    { name: 'Leo', role: 'Dev', avatar: 'assets/img/staff3.jpg' },
    { name: 'Nico', role: 'Mod', avatar: 'assets/img/staff4.jpg' }
  ],
  faq: [
    { q: '¿Cómo me conecto?', a: 'Usa el botón Conectar o agrega la IP en Favoritos dentro de FiveM.' },
    { q: '¿Necesito whitelist?', a: 'Sí, únete al Discord y completa el formulario.' },
    { q: '¿Reglas principales?', a: 'Respeta el rol, evita el meta/powergaming y sigue las normas de tráfico.' }
  ]
};
