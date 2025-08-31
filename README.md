# RealityRP — Plantilla web FiveM

Sitio estático moderno, dinámico e interactivo para mostrar información de un servidor FiveM: estado, jugadores, características, eventos, galería, staff y FAQ.

## Personalización rápida

1. Copia `assets/js/config.example.js` a `assets/js/config.js` y edítalo:
   - `brand.name`, `brand.logo`, `brand.tagline`
   - `fivem.ip`, `fivem.port` o `fivem.cfx`
   - `links.discord`, `links.twitch`, `links.youtube`, `links.tiktok`
   - Secciones: `features`, `events`, `gallery`, `staff`, `faq`

2. Abre `index.html` en tu navegador.

> Nota: Para que la consulta del estado funcione desde archivo local, algunos navegadores bloquean CORS. Recomendado servir en local.

## Servir en local (Windows PowerShell)

```powershell
# Opción 1: Python 3
python -m http.server 5500
# Opción 2: Node (si tienes npx)
npx serve . -l 5500
```

Luego abre: http://localhost:5500

## Despliegue en GitHub Pages

Este proyecto es estático y funciona directo en GitHub Pages.

1. Asegúrate de tener tu repo en GitHub con la rama `main` o `master`.
2. El flujo de trabajo `.github/workflows/deploy.yml` ya está configurado.
3. Haz push a GitHub. El workflow publicará el sitio automáticamente en Pages.
4. En la configuración del repo (Settings → Pages), verifica que la fuente sea "GitHub Actions".

### Estado del servidor en Pages (sin proxy)

- Si configuras `fivem.cfx` (por ejemplo `cfx.re/join/xxxxxx`), la web resolverá el endpoint IP:PUERTO usando la API pública de FiveM y consultará `dynamic.json`, `info.json` y `players.json` directamente. Esto evita problemas de CORS en Pages.
- Si prefieres usar IP:PUERTO sin cfx, necesitarás que el servidor FiveM permita CORS hacia tu dominio de Pages o deberás usar un proxy propio (ver sección más abajo).

## Estructura

- `index.html` — Layout y secciones
- `assets/css/styles.css` — Estilos neon gamer
- `assets/js/app.js` — Lógica UI, estado FiveM y efectos
- `assets/js/config.example.js` — Config por defecto (copia a `config.js`)
- `assets/img` — Recursos (logo, imágenes demo)

## Notas de FiveM

- Endpoints esperados (públicos):
  - `http://IP:PUERTO/dynamic.json`
  - `http://IP:PUERTO/info.json`
  - `http://IP:PUERTO/players.json`
- Si usas `cfx.re`, el botón Conectar usará `fivem://` con el código CFX.
- Estado en tiempo real sin CORS en local: usa el proxy incluido.
  1. Instala Node.js LTS.
  2. Inicia el proxy apuntando a tu servidor FiveM:
     ```powershell
     node proxy-server.js --target http://TU_IP:PUERTO --port 5050 --prefix /fivem
     ```
  3. En `assets/js/config.js`, establece:
     ```js
     window.SITE_CONFIG = {
       fivem: { baseOverride: 'http://localhost:5050/fivem', refreshMs: 10000 },
       // ...
     }
     ```
  4. Sirve la web (ver sección “Servir en local”). En GitHub Pages no necesitas este proxy si usas `cfx`.
- Sin proxy (misma red o mismo dominio): asegúrate de que el navegador permita solicitudes directas a `http://IP:PUERTO/*.json` desde el origen de tu web, o sirve la web desde el mismo host.

## Licencia

MIT — Usa y modifica libremente. No afiliado a Rockstar/Take-Two.
