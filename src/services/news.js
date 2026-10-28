/**
 * Lector público de noticias de Sanity. Ningún token ni contraseña se envía al navegador.
 * Sanity distingue borradores de publicaciones mediante el estado de documento.
 * El panel de edición es otra aplicación, autenticada por el proveedor.
 */
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'
const apiVersion = '2026-10-01'

const articlesQuery = `*[_type == "article" && !(_id in path("drafts.**")) && defined(slug.current) && defined(title) && count(body[_type == "block"]) > 0] | order(publishedAt desc) {
  "slug": slug.current, title, summary, author, eventDate, publishedAt, featured,
  categories, "blocks": body[_type == "block"]{children[]{text}},
  "image": mainImage.asset->url, "imageAlt": mainImage.alt,
  "imageCaption": mainImage.caption
}`

export async function loadPublishedArticles() {
  if (!projectId) return null
  if (!/^[a-z0-9-]+$/i.test(projectId) || !/^[a-z0-9_-]+$/i.test(dataset)) {
    throw new Error('Configuración de Sanity inválida')
  }
  const endpoint = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(articlesQuery)}`
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error(`No se pudieron leer noticias (HTTP ${response.status})`)
  const result = (await response.json()).result || []
  return result.map(article => ({
    ...article,
    paragraphs: Array.isArray(article.blocks)
      ? article.blocks.map(block => (block.children || []).map(c => c.text || '').join('')).filter(Boolean)
      : [],
    categories: Array.isArray(article.categories) ? article.categories : [],
    published: true,
  }))
}
