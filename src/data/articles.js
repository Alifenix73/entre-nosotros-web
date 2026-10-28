/**
 * Contenido editorial. No publicar noticias sin verificación de la redacción.
 * Cada noticia se registra UNA sola vez y puede pertenecer a varias categorías.
 * La fecha del acontecimiento (eventDate) es distinta de la publicación real (publishedAt).
 * La marca featured controla su presencia en Destacadas.
 * published: false mantiene un borrador fuera del sitio público.
 * Fase posterior: sustituir este módulo por un CMS con cuentas independientes.
 */
export const articles = [
  // Ejemplo de estructura (NO es una noticia real):
  // {
  //   slug: 'identificador-unico',
  //   title: 'Título verificado',
  //   summary: 'Resumen confirmado por la redacción.',
  //   author: 'Nombre del autor',
  //   eventDate: '2026-10-20',
  //   publishedAt: '2026-10-26',
  //   image: '/images/noticias/foto.jpg',
  //   imageAlt: 'Descripción de la fotografía',
  //   imageCaption: 'Crédito y pie de foto',
  //   categories: ['Tamaulipas', 'Zona Sur'],
  //   featured: true,
  //   published: false,
  //   paragraphs: ['Primer párrafo de la noticia.', 'Segundo párrafo.'],
  // },
]
