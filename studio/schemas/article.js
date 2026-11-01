
import { defineField, defineType } from 'sanity'

const sections = [
  'Tamaulipas',
  'Nacional',
  'Zona Sur',
  'Opinión',
  'Cultura',
  'Entrevistas',
  'Economía',
]

export const articleSchema = defineType({
  name: 'article',
  title: 'Noticias',
  type: 'document',

  groups: [
    { name: 'principal', title: 'Contenido', default: true },
    { name: 'clasificacion', title: 'Secciones y portada' },
    { name: 'fechas', title: 'Fechas y firma' },
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Titular de la noticia',
      type: 'string',
      group: 'principal',
      validation: Rule => Rule.required().min(8),
    }),

    defineField({
      name: 'slug',
      title: 'Enlace permanente (URL)',
      type: 'slug',
      group: 'principal',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'summary',
      title: 'Entradilla o resumen',
      type: 'text',
      rows: 3,
      group: 'principal',
      validation: Rule => Rule.required().min(20),
    }),

    defineField({
      name: 'mainImage',
      title: 'Fotografía principal',
      type: 'image',
      group: 'principal',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Descripción accesible de la imagen',
          type: 'string',
        }),
        defineField({
          name: 'caption',
          title: 'Pie de foto y crédito',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'youtubeUrl',
      title: 'Video de YouTube (opcional)',
      type: 'url',
      group: 'principal',
      description:
        'Pega el enlace de un video público de YouTube. Aparecerá debajo de la fotografía principal y antes del texto.',
      validation: Rule =>
        Rule.uri({ scheme: ['http', 'https'] }).custom(value => {
          if (!value) return true

          try {
            const url = new URL(value)
            const host = url.hostname.toLowerCase()
            const validHosts = [
              'youtube.com',
              'www.youtube.com',
              'm.youtube.com',
              'youtu.be',
              'www.youtu.be',
              'www.youtube-nocookie.com',
            ]

            return validHosts.includes(host)
              ? true
              : 'Introduce un enlace válido de YouTube'
          } catch {
            return 'Introduce un enlace válido de YouTube'
          }
        }),
    }),

    defineField({
      name: 'body',
      title: 'Texto completo de la noticia',
      type: 'array',
      group: 'principal',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required().min(1),
    }),

    defineField({
      name: 'categories',
      title: 'Secciones (puede estar en varias)',
      type: 'array',
      group: 'clasificacion',
      of: [
        {
          type: 'string',
          options: { list: sections },
        },
      ],
      validation: Rule => Rule.required().min(1),
    }),

    defineField({
      name: 'featured',
      title: 'Mostrar en Destacadas',
      type: 'boolean',
      group: 'clasificacion',
      initialValue: false,
      description:
        'Una noticia destacada conserva también sus otras secciones.',
    }),

    defineField({
      name: 'author',
      title: 'Firma visible de la nota',
      type: 'string',
      group: 'fechas',
      description:
        'Nombre que se muestra al lector; no es una cuenta de acceso.',
      initialValue: 'María de los Ángeles Barrios Gudiño',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'eventDate',
      title: 'Fecha del acontecimiento (si es distinta)',
      type: 'date',
      group: 'fechas',
      description:
        'Dato de referencia editorial. No se mostrará como una segunda fecha en el periódico.',
    }),

    defineField({
      name: 'publishedAt',
      title: 'Fecha y hora visible de la noticia',
      type: 'datetime',
      group: 'fechas',
      initialValue: () => new Date().toISOString(),
      description:
        'Elige la fecha y hora que verá el lector, aunque publiques la noticia otro día. Sanity conserva automáticamente su registro técnico.',
      validation: Rule => Rule.required(),
    }),
  ],

  orderings: [
    {
      title: 'Fecha editorial más reciente',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Título A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'author',
      media: 'mainImage',
    },
  },
})
