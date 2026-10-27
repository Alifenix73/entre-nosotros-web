# Ángeles Barrios está Entre Nosotros

Sitio editorial en React + Vite. **Versión 0.1: prototipo funcional de la portada, todavía no apto para publicar noticias oficiales.**

## Ejecutar

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Contenido

- Fase 1: Destacadas, Tamaulipas, Nacional, Zona Sur.
- Fase 2 prevista: Economía, Opinión, Cultura y Entrevistas.
- Las noticias se registran una sola vez en `src/data/articles.js`; pueden estar en varias categorías y también en Destacadas.
- Para publicar, se debe verificar el contenido, las fotografías, los derechos y las fechas. `publishedAt` es la fecha real de publicación, no la fecha del evento (`eventDate`).
- **No hay CMS ni cuentas de administración en esta versión.** El módulo de datos es temporal; no es un panel editorial.
- Los espacios de anuncios y los textos legales son marcadores de posición, no publicidad contratada ni documentos legales definitivos.
- La imagen original del quiosco de Tampico debe proporcionarse e incorporarse como `public/images/portada-tampico.jpg` antes de activar el fondo fotográfico del encabezado.
- Las rutas internas se gestionan en el navegador. Para publicar se necesita configurar el alojamiento con fallback a `index.html`, además de implementar HTML prerenderizado/SSG y metadatos por noticia para SEO y redes sociales.

## Estructura

- `src/App.jsx`: portada, navegación, listados, lectura, búsqueda y avisos.
- `src/App.css` y `src/index.css`: diseño adaptable.
- `src/data/articles.js`: contenido editorial temporal.

No subir contraseñas, claves ni archivos `.env` con secretos al repositorio público.
