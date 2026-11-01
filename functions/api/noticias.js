
const PROJECT_ID = 'xx9o0ksu'
const DATASET = 'production'
const API_VERSION = '2026-10-01'

const QUERY = `*[
  _type == "article" &&
  defined(title) &&
  defined(slug.current)
] | order(publishedAt desc) {
  "slug": slug.current,
  title,
  summary,
  author,
  eventDate,
  publishedAt,
  featured,
  categories,
  "blocks": body[_type == "block"]{children[]{text}},
  "image": mainImage.asset->url,
  "imageAlt": mainImage.alt,
  "imageCaption": mainImage.caption
}`

export async function onRequestGet() {
  const url = new URL(
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`
  )

  url.searchParams.set('query', QUERY)
  url.searchParams.set('perspective', 'published')

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(12000)
    })

    if (!response.ok) {
      throw new Error(`Sanity HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data.result)) {
      throw new Error('Respuesta de Sanity invalida')
    }

    return Response.json(
      { result: data.result },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error consultando Sanity:', error.message)

    return Response.json(
      { error: 'No fue posible consultar las noticias' },
      { status: 502 }
    )
  }
}
