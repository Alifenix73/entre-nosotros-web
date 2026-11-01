
/**
 * Noticias públicas desde Cloudflare Pages.
 * No requiere credenciales ni conexión CORS del navegador.
 */

export async function loadPublishedArticles() {
  const response = await fetch('/api/noticias', {
    signal: AbortSignal.timeout(12000),
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(
      `No se pudieron consultar las noticias: HTTP ${response.status}`
    )
  }

  const data = await response.json()

  if (!Array.isArray(data.result)) {
    throw new Error('Respuesta de noticias inválida')
  }

  return data.result.map(article => ({
    ...article,

    paragraphs: Array.isArray(article.blocks)
      ? article.blocks
          .map(block =>
            (block.children || [])
              .map(child => child.text || '')
              .join('')
          )
          .filter(Boolean)
      : [],

    categories: Array.isArray(article.categories)
      ? article.categories
      : [],

    published: true
  }))
}
