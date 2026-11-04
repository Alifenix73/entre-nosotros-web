
/**
 * Panel privado de estadisticas del periodico.
 * Ruta: /estadisticas
 * Requiere el secreto STATS_ADMIN_KEY en Cloudflare.
 */

const HOST = 'entrenosotros.org'
const PROJECT = 'xx9o0ksu'
const DATASET = 'production'

function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]
  )
}

function mxDate(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const get = name =>
    parts.find(p => p.type === name)?.value

  return `${get('year')}-${get('month')}-${get('day')}`
}

function defaultDates() {
  return {
    start: mxDate(new Date(Date.now() - 29 * 86400000)),
    end: mxDate(new Date())
  }
}

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#f7f6f3;color:#222;font:16px system-ui,Arial,sans-serif}
header{background:#232323;color:white;padding:19px}
header h1{font-size:1.4rem;margin:0 0 4px}
header p{margin:0;color:#ddd;font-size:.9rem}
main{max-width:1100px;margin:auto;padding:16px}
section{padding:18px;background:white;border:1px solid #ddd;border-radius:10px;margin-bottom:18px}
h2{margin:0 0 14px;font-size:1.15rem}
form{display:flex;align-items:end;gap:10px;flex-wrap:wrap}
label{display:grid;gap:5px;font-size:.9rem;font-weight:600}
input{font:inherit;border:1px solid #999;border-radius:6px;padding:9px}
button{font:inherit;color:white;background:#262626;border:0;border-radius:6px;padding:11px 16px;cursor:pointer}
button.alt{background:#515151}
.note{font-size:.85rem;color:#555;line-height:1.45}
.error{color:#ac2727;font-weight:700}
.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:650px}
th,td{text-align:left;padding:11px;border-bottom:1px solid #ddd;vertical-align:top}
th{background:#f1f0ed}
.number{text-align:right;font-weight:700}
td a{color:#175584}
.total{font-size:1.1rem;font-weight:700}
@media(max-width:600px){
main{padding:10px}
section{padding:12px}
form label{width:100%}
input,button{width:100%}
}
`

const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
}

function page(start, end, report = '', error = '') {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estadisticas privadas | Entre Nosotros</title>
<style>${CSS}</style>
</head>
<body>
<header>
<h1>Entre Nosotros · Estadisticas editoriales</h1>
<p>Panel privado de visualizaciones por noticia</p>
</header>
<main>
<section>
<h2>Consultar visualizaciones</h2>
${error ? `<p class="error">${esc(error)}</p>` : ''}
<form action="/estadisticas" method="post" autocomplete="off">
<label>Desde
<input type="date" name="start" required value="${esc(start)}">
</label>
<label>Hasta
<input type="date" name="end" required value="${esc(end)}">
</label>
<label>Clave privada
<input type="password" name="key" minlength="24" required
placeholder="Clave de administracion" autocomplete="off">
</label>
<button type="submit" name="format" value="html">Ver reporte</button>
<button type="submit" class="alt" name="format" value="csv">Descargar CSV</button>
</form>
<p class="note">
El reporte refleja las aperturas registradas por nuestro contador desde su activacion.
Las visitas anteriores se consultan por separado en Cloudflare.
</p>
</section>
${report}
</main>
</body>
</html>`
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: HEADERS
  })
}

function isValidDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) return false

  const date = new Date(`${value}T00:00:00Z`)

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
}

async function validKey(actual, expected) {
  if (!actual || !expected || expected.length < 24) {
    return false
  }

  const encoder = new TextEncoder()

  const hashes = await Promise.all(
    [actual, expected].map(value =>
      crypto.subtle.digest(
        'SHA-256',
        encoder.encode(value)
      )
    )
  )

  const a = new Uint8Array(hashes[0])
  const b = new Uint8Array(hashes[1])

  let diff = 0

  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }

  return diff === 0
}

async function getNews() {
  const query = `*[
    _type == "article" &&
    defined(title) &&
    defined(slug.current)
  ]{
    _id,
    title,
    publishedAt,
    "slug": slug.current
  }`

  const url = new URL(
    `https://${PROJECT}.api.sanity.io/v2026-10-01/data/query/${DATASET}`
  )

  url.searchParams.set('query', query)
  url.searchParams.set('perspective', 'published')

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) {
    throw new Error(`Sanity HTTP ${response.status}`)
  }

  const data = await response.json()

  if (!Array.isArray(data.result)) {
    throw new Error('Respuesta de noticias invalida')
  }

  return data.result
}

async function getReport(env, start, end) {
  const [db, news] = await Promise.all([
    env.DB.prepare(`
      SELECT article_id, SUM(views) AS total
      FROM article_views
      WHERE view_date >= ? AND view_date <= ?
      GROUP BY article_id
    `).bind(start, end).all(),
    getNews()
  ])

  const totals = new Map(
    (db.results || []).map(row => [
      row.article_id,
      Number(row.total) || 0
    ])
  )

  const existing = new Set()

  const rows = news.map(article => {
    existing.add(article._id)

    return {
      title: article.title,
      publishedAt: article.publishedAt || '',
      url: `https://${HOST}/noticia/${encodeURIComponent(article.slug)}`,
      views: totals.get(article._id) || 0
    }
  })

  for (const [id, count] of totals) {
    if (!existing.has(id)) {
      rows.push({
        title: `Noticia archivada (${id})`,
        publishedAt: '',
        url: '',
        views: count
      })
    }
  }

  return rows.sort(
    (a, b) =>
      b.views - a.views ||
      a.title.localeCompare(b.title, 'es')
  )
}

function csvField(value) {
  let text = String(value ?? '')

  if (/^\s*[=+\-@\t\r]/.test(text)) {
    text = "'" + text
  }

  return `"${text.replace(/"/g, '""')}"`
}

function csv(rows, start, end) {
  const lines = [
    [
      'Noticia',
      'Fecha de publicacion',
      'URL',
      'Visualizaciones',
      'Desde',
      'Hasta'
    ].map(csvField).join(',')
  ]

  for (const row of rows) {
    lines.push([
      row.title,
      row.publishedAt,
      row.url,
      row.views,
      start,
      end
    ].map(csvField).join(','))
  }

  const total = rows.reduce(
    (sum, row) => sum + row.views,
    0
  )

  lines.push(
    ['TOTAL', '', '', total, start, end]
      .map(csvField)
      .join(',')
  )

  return new Response(
    '\uFEFF' + lines.join('\r\n') + '\r\n',
    {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition':
          `attachment; filename="reporte-vistas-${start}-a-${end}.csv"`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    }
  )
}

function renderReport(rows, start, end) {
  const total = rows.reduce(
    (sum, row) => sum + row.views,
    0
  )

  const tableRows = rows.map(row => `
    <tr>
      <td>${esc(row.title)}</td>
      <td>${esc(row.publishedAt.slice(0, 10))}</td>
      <td>
        ${row.url
          ? `<a href="${esc(row.url)}" target="_blank"
             rel="noopener noreferrer">Abrir noticia</a>`
          : '—'}
      </td>
      <td class="number">${row.views}</td>
    </tr>
  `).join('')

  return `
    <section>
      <h2>Del ${esc(start)} al ${esc(end)}</h2>
      <p class="total">
        Visualizaciones registradas:
        ${total.toLocaleString('es-MX')}
      </p>
      <p class="note">
        Estas cifras corresponden a aperturas de noticias
        registradas en D1. No equivalen a visitantes unicos
        ni incluyen automaticamente las estadisticas historicas.
      </p>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Noticia</th>
              <th>Publicacion</th>
              <th>Enlace</th>
              <th>Vistas</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="4">Sin noticias disponibles</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `
}

function permitted(request) {
  const url = new URL(request.url)

  return url.protocol === 'https:' &&
    url.hostname === HOST
}

export function onRequestGet({ request }) {
  if (!permitted(request)) {
    return new Response('No disponible', {
      status: 404
    })
  }

  const dates = defaultDates()

  return html(page(dates.start, dates.end))
}

export async function onRequestPost({ request, env }) {
  if (!permitted(request)) {
    return new Response('No disponible', {
      status: 404
    })
  }

  if (
    request.headers.get('Origin') !== `https://${HOST}`
  ) {
    return new Response('Origen no autorizado', {
      status: 403
    })
  }

  const form = await request.formData()

  const start = String(form.get('start') || '')
  const end = String(form.get('end') || '')
  const key = String(form.get('key') || '')
  const format = String(form.get('format') || '')

  if (
    !isValidDate(start) ||
    !isValidDate(end) ||
    start > end
  ) {
    const dates = defaultDates()

    return html(
      page(
        dates.start,
        dates.end,
        '',
        'Fechas no validas.'
      ),
      400
    )
  }

  if (!(await validKey(key, env.STATS_ADMIN_KEY))) {
    return html(
      page(
        start,
        end,
        '',
        'Clave privada incorrecta o no configurada.'
      ),
      403
    )
  }

  if (!env.DB) {
    return html(
      page(
        start,
        end,
        '',
        'La base D1 no esta conectada a este despliegue.'
      ),
      503
    )
  }

  try {
    const rows = await getReport(env, start, end)

    if (format === 'csv') {
      return csv(rows, start, end)
    }

    return html(
      page(
        start,
        end,
        renderReport(rows, start, end)
      )
    )
  } catch (error) {
    console.error(
      'Error generando reporte:',
      error
    )

    return html(
      page(
        start,
        end,
        '',
        'No se pudo consultar D1 y Sanity.'
      ),
      502
    )
  }
}
