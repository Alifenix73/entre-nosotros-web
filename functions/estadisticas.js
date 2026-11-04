
/** Panel privado de vistas del periodico. Requiere DB y STATS_ADMIN_KEY. */
const HOST = 'entrenosotros.org'
const PROJECT = 'xx9o0ksu'
const DATASET = 'production'
const VERSION = '2026-10-01'
const HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
}
const clean = v => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[c])
const reply = (body, status = 200) => new Response(body, { status, headers: HEADERS })

function mexicoDate(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date)
}
function defaultDates() {
  return {
    start: mexicoDate(new Date(Date.now() - 29 * 86400000)),
    end: mexicoDate(new Date())
  }
}
const validDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s

function page(start, end, content = '', error = '') {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estadisticas privadas | Entre Nosotros</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f7f6f3;color:#222;font:16px system-ui,Arial,sans-serif}
header{background:#242424;color:white;padding:20px}h1{font-size:1.4rem;margin:0 0 5px}
header p{margin:0;color:#ddd}main{max-width:1100px;margin:auto;padding:15px}
section{background:white;border:1px solid #ddd;border-radius:10px;padding:18px;margin-bottom:18px}
h2{font-size:1.2rem;margin:0 0 15px}form{display:flex;gap:12px;flex-wrap:wrap;align-items:end}
label{display:grid;gap:5px;font-weight:600}input{font:inherit;border:1px solid #999;border-radius:6px;padding:10px}
button{font:inherit;border:0;border-radius:6px;padding:12px 15px;color:white;background:#242424}
button.alt{background:#555}.note{color:#555;font-size:.9rem}.error{color:#a22222;font-weight:bold}
.wrap{overflow-x:auto}table{width:100%;min-width:650px;border-collapse:collapse}
th,td{border-bottom:1px solid #ddd;padding:10px;text-align:left}th{background:#f1efea}
td.num{text-align:right;font-weight:700}td a{color:#184e76}.total{font-size:1.15rem;font-weight:bold}
@media(max-width:600px){main{padding:10px}section{padding:12px}label{width:100%}input,button{width:100%}}
</style></head><body><header><h1>Entre Nosotros · Estadisticas editoriales</h1>
<p>Panel privado de visualizaciones por noticia</p></header><main><section>
<h2>Consultar visualizaciones</h2>${error ? `<p class="error">${clean(error)}</p>` : ''}
<form action="/estadisticas" method="post" autocomplete="off">
<label>Desde<input type="date" name="start" required value="${clean(start)}"></label>
<label>Hasta<input type="date" name="end" required value="${clean(end)}"></label>
<label>Clave privada<input type="password" name="key" required minlength="24" autocomplete="off"></label>
<button type="submit" name="format" value="html">Ver reporte</button>
<button type="submit" name="format" value="csv" class="alt">Descargar CSV</button></form>
<p class="note">Cuenta las aperturas desde la activacion del contador. Los datos anteriores de Cloudflare se consultan por separado.</p>
</section>${content}</main></body></html>`
}

async function keyMatches(provided, secret) {
  if (typeof secret !== 'string' || secret.length < 24 || !provided) return false
  const enc = new TextEncoder()
  const digests = await Promise.all([provided, secret].map(s =>
    crypto.subtle.digest('SHA-256', enc.encode(s))))
  const a = new Uint8Array(digests[0]), b = new Uint8Array(digests[1])
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

async function listNews() {
  const query = '*[_type == "article" && defined(title) && defined(slug.current)]{_id,title,publishedAt,"slug":slug.current}'
  const url = new URL(`https://${PROJECT}.api.sanity.io/v${VERSION}/data/query/${DATASET}`)
  url.searchParams.set('query', query)
  url.searchParams.set('perspective', 'published')
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error(`Sanity HTTP ${response.status}`)
  const data = await response.json()
  if (!Array.isArray(data.result)) throw new Error('Respuesta de Sanity no valida')
  return data.result
}

async function getRows(env, start, end) {
  const [result, news] = await Promise.all([
    env.DB.prepare('SELECT article_id, SUM(views) AS total FROM article_views WHERE view_date >= ? AND view_date <= ? GROUP BY article_id')
      .bind(start, end).all(),
    listNews()
  ])
  const totals = new Map((result.results || []).map(x => [x.article_id, Number(x.total) || 0]))
  const known = new Set()
  const rows = news.map(n => {
    known.add(n._id)
    return {
      title: n.title,
      date: n.publishedAt || '',
      url: `https://${HOST}/noticia/${encodeURIComponent(n.slug)}`,
      views: totals.get(n._id) || 0
    }
  })
  for (const [id, views] of totals) {
    if (!known.has(id)) rows.push({ title: `Noticia archivada (${id})`, date: '', url: '', views })
  }
  return rows.sort((a, b) => b.views - a.views || a.title.localeCompare(b.title, 'es'))
}

function reportTable(rows, start, end) {
  const total = rows.reduce((sum, r) => sum + r.views, 0)
  const body = rows.map(r => `<tr><td>${clean(r.title)}</td><td>${clean(r.date.slice(0, 10))}</td><td>${r.url ? `<a href="${clean(r.url)}" target="_blank" rel="noopener noreferrer">Abrir noticia</a>` : '—'}</td><td class="num">${r.views}</td></tr>`).join('')
  return `<section><h2>Reporte del ${clean(start)} al ${clean(end)}</h2>
<p class="total">Visualizaciones registradas: ${total.toLocaleString('es-MX')}</p>
<p class="note">No equivale a visitantes unicos ni recupera automaticamente visitas anteriores.</p>
<div class="wrap"><table><thead><tr><th>Noticia</th><th>Publicacion</th><th>Enlace</th><th>Vistas</th></tr></thead><tbody>${body || '<tr><td colspan="4">Sin noticias</td></tr>'}</tbody></table></div></section>`
}

function csvCell(v) {
  let s = String(v ?? '')
  if (/^\s*[=+\-@\t\r]/.test(s)) s = "'" + s
  return '"' + s.replace(/"/g, '""') + '"'
}
function csv(rows, start, end) {
  const records = [['Noticia', 'Fecha publicacion', 'URL', 'Visualizaciones', 'Desde', 'Hasta']]
  for (const r of rows) records.push([r.title, r.date, r.url, r.views, start, end])
  records.push(['TOTAL', '', '', rows.reduce((s, r) => s + r.views, 0), start, end])
  return new Response('\uFEFF' + records.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vistas-${start}-a-${end}.csv"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}

function correctHost(request) {
  const u = new URL(request.url)
  return u.hostname === HOST && u.protocol === 'https:'
}

export function onRequestGet({ request }) {
  if (!correctHost(request)) return new Response('No disponible', { status: 404 })
  const d = defaultDates()
  return reply(page(d.start, d.end))
}

export async function onRequestPost({ request, env }) {
  if (!correctHost(request)) return new Response('No disponible', { status: 404 })
  // La clave privada protege el reporte; no dependemos de Origin,
  // que algunos navegadores moviles omiten en los formularios.
  const form = await request.formData()
  const start = String(form.get('start') || '')
  const end = String(form.get('end') || '')
  const key = String(form.get('key') || '')
  const format = String(form.get('format') || '')
  if (!validDate(start) || !validDate(end) || start > end) {
    const d = defaultDates()
    return reply(page(d.start, d.end, '', 'Revisa las fechas'), 400)
  }
  if (!(await keyMatches(key, env.STATS_ADMIN_KEY))) {
    return reply(page(start, end, '', 'Clave incorrecta o no configurada'), 403)
  }
  if (!env.DB) return reply(page(start, end, '', 'D1 aun no esta conectado a este despliegue'), 503)
  try {
    const rows = await getRows(env, start, end)
    if (format === 'csv') return csv(rows, start, end)
    return reply(page(start, end, reportTable(rows, start, end)))
  } catch (error) {
    console.error('No se pudo generar reporte:', error)
    return reply(page(start, end, '', 'No se pudo consultar Sanity o D1'), 502)
  }
}
