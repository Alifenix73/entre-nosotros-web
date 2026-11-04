
const PROJECT_ID = 'xx9o0ksu'
const DATASET = 'production'
const API_VERSION = '2026-10-01'

const noContent = () =>
  new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' }
  })

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url)

  // Solo contabilizar visitas del dominio oficial.
  if (url.hostname !== 'entrenosotros.org') {
    return noContent()
  }

  // No aceptar solicitudes desde otros sitios.
  if (request.headers.get('Origin') !== url.origin) {
    return new Response('No autorizado', { status: 403 })
  }

  const userAgent = request.headers.get('User-Agent') || ''

  // Excluir rastreadores conocidos.
  if (/bot|crawler|spider|facebookexternalhit|preview/i.test(userAgent)) {
    return noContent()
  }

  if (!env.DB) {
    return new Response('Base de datos no disponible', {
      status: 503
    })
  }

  if (!(request.headers.get('Content-Type') || '')
    .includes('application/json')) {
    return new Response('Formato no válido', { status: 415 })
  }

  try {
    const data = await request.json()
    const slug = data?.slug

    if (typeof slug !== 'string' ||
        !/^[a-z0-9-]{1,96}$/.test(slug)) {
      return new Response('Noticia no válida', { status: 400 })
    }

    const query = `*[
      _type == "article" &&
      slug.current == $slug &&
      defined(title) &&
      count(body[_type == "block"]) > 0
    ][0]{_id}`

    const sanityUrl = new URL(
      `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`
    )

    sanityUrl.searchParams.set('query', query)
    sanityUrl.searchParams.set('$slug', JSON.stringify(slug))
    sanityUrl.searchParams.set('perspective', 'published')

    const response = await fetch(sanityUrl.toString(), {
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error('No se pudo verificar la noticia')
    }

    const article = (await response.json()).result

    if (!article?._id) {
      return new Response('Noticia no encontrada', {
        status: 404
      })
    }

    // Fecha correspondiente a México.
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date())

    const get = type =>
      parts.find(part => part.type === type)?.value

    const date = `${get('year')}-${get('month')}-${get('day')}`

    await env.DB.prepare(`
      INSERT INTO article_views
        (article_id, view_date, views)
      VALUES (?, ?, 1)
      ON CONFLICT(article_id, view_date)
      DO UPDATE SET views = views + 1
    `).bind(article._id, date).run()

    return noContent()
  } catch (error) {
    console.error('Error registrando visualización:', error)

    return new Response('No se pudo registrar la visita', {
      status: 500
    })
  }
}
