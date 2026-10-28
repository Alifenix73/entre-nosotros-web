// Copiar este esquema a un proyecto Sanity Studio cuando esté creado.
// Esta carpeta NO es un panel funcional todavía: requiere crear Sanity Studio.
export default {
  name: 'article', title: 'Noticias', type: 'document',
  fields: [
    { name: 'title', title: 'Título', type: 'string', validation: r => r.required() },
    { name: 'slug', title: 'Enlace', type: 'slug', options: { source: 'title', maxLength: 100 }, validation: r => r.required() },
    { name: 'summary', title: 'Resumen', type: 'text', rows: 3 },
    { name: 'author', title: 'Autor', type: 'string' },
    { name: 'eventDate', title: 'Fecha del acontecimiento', type: 'date' },
    { name: 'publishedAt', title: 'Fecha de publicación', type: 'date' },
    { name: 'categories', title: 'Secciones', type: 'array', of: [{ type: 'string', options: { list: [
      'Tamaulipas', 'Nacional', 'Zona Sur', 'Opinión', 'Cultura', 'Entrevistas', 'Economía'
    ] } }], options: { layout: 'tags' } },
    { name: 'featured', title: 'En Destacadas', type: 'boolean', initialValue: false },
    { name: 'published', title: 'Publicada en el sitio', type: 'boolean', initialValue: false },
    { name: 'mainImage', title: 'Fotografía principal', type: 'image', options: { hotspot: true }, fields: [
      { name: 'alt', title: 'Texto alternativo', type: 'string' },
      { name: 'caption', title: 'Pie de fotografía', type: 'string' },
    ] },
    { name: 'body', title: 'Contenido', type: 'array', of: [{ type: 'block' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'mainImage' } },
}
