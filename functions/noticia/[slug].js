/**
 * Cloudflare Pages Function: metadatos y datos estructurados por noticia.
 * La redacción y publicación se autentican exclusivamente en Sanity.
 * No colocar tokens privados en Vite ni en el repositorio.
 */
const API_VERSION = '2026-10-01'
const MAX_SLUG_LENGTH = 96

const CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.sanity.io; font-src 'self' data:; connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io https://cloudflareinsights.com; upgrade-insecure-requests"
function harden(headers) {
  headers.set('X-Content-Type-Options','nosniff')
  headers.set('X-Frame-Options','DENY')
  headers.set('Referrer-Policy','strict-origin-when-cross-origin')
  headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()')
  headers.set('Content-Security-Policy',CSP)
  return headers
}
function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[ch])
}
function metaContent(key, value, kind='property') {
  return `<meta ${kind}="${safeText(key)}" content="${safeText(value)}">`
}
function jsonLd(value) {
  // Previene que el titular inyecte </script> en el HTML.
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')
}
async function basePage(request, env) {
  return env.ASSETS.fetch(new Request(new URL('/',request.url), { method:'GET' }))
}
function safePage(page, noIndex=false) {
  const headers = harden(new Headers(page.headers))
  if (noIndex) headers.set('X-Robots-Tag','noindex, nofollow')
  return new Response(page.body,{ status:page.status, headers })
}
function validateEnv(env) {
  const id=String(env?.SANITY_PROJECT_ID||'')
  const dataset=String(env?.SANITY_DATASET||'production')
  return /^[a-z0-9-]+$/i.test(id)&&/^[a-z0-9_-]+$/i.test(dataset)?{id,dataset}:null
}
export async function onRequestGet({request,env,params}) {
  const slug=typeof params?.slug==='string'?params.slug:''
  if (!new RegExp(`^[a-z0-9-]{1,${MAX_SLUG_LENGTH}}$`).test(slug)) return new Response('Página no encontrada',{status:404,headers:harden(new Headers())})
  const page=await basePage(request,env)
  if (!page.ok) return safePage(page)
  const config=validateEnv(env)
  if (!config) return safePage(page,true)

  const query=`*[_type == "article" && slug.current == $slug && defined(title) && count(body[_type == "block"]) > 0][0]{ title, summary, author, publishedAt, _updatedAt, "image":mainImage.asset->url }`
  const u=new URL(`https://${config.id}.apicdn.sanity.io/v${API_VERSION}/data/query/${config.dataset}`)
  u.searchParams.set('query',query)
  u.searchParams.set('$slug',JSON.stringify(slug))
  u.searchParams.set('perspective','published')
  let article
  try {
    const r=await fetch(u.toString(),{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)})
    if(!r.ok) return safePage(page,true)
    article=(await r.json()).result
  }catch{return safePage(page,true)}
  if(!article?.title) return new Response('Noticia no encontrada',{status:404,headers:harden(new Headers({'Content-Type':'text/plain; charset=utf-8'}))})

  const reqUrl=new URL(request.url)
  const canonical=new URL(`/noticia/${slug}`,reqUrl).toString()
  const title=`${article.title} | Ángeles Barrios está Entre Nosotros`
  const description=String(article.summary||'Periodismo con sentido regional.').slice(0,300)
  const image=typeof article.image==='string' && /^https:\/\/cdn\.sanity\.io\//i.test(article.image)?article.image:''
  const json={
    '@context':'https://schema.org', '@type':'NewsArticle',
    headline:article.title, description, mainEntityOfPage:canonical,
    url:canonical, inLanguage:'es-MX',
    publisher:{'@type':'Organization',name:'Ángeles Barrios está Entre Nosotros'},
  }
  if(article.publishedAt)json.datePublished=article.publishedAt
  if(article._updatedAt)json.dateModified=article._updatedAt
  if(article.author)json.author={'@type':'Person',name:article.author}
  if(image)json.image=[image]
  const tags=[
    `<title>${safeText(title)}</title>`,
    metaContent('description',description,'name'),
    metaContent('og:type','article'),metaContent('og:site_name','Ángeles Barrios está Entre Nosotros'),
    metaContent('og:locale','es_MX'),metaContent('og:title',article.title),
    metaContent('og:description',description),metaContent('og:url',canonical),
    metaContent('twitter:card',image?'summary_large_image':'summary','name'),
    metaContent('twitter:title',article.title,'name'),
    metaContent('twitter:description',description,'name'),
    `<link rel="canonical" href="${safeText(canonical)}">`,
    `<script type="application/ld+json">${jsonLd(json)}</script>`,
  ]
  if(image){tags.push(metaContent('og:image',image));tags.push(metaContent('twitter:image',image,'name'))}
  if(article.publishedAt)tags.push(metaContent('article:published_time',article.publishedAt))
  let html=await page.text()
  html=html.replace(/<title>[^<]*<\/title>/i,'')
   .replace(/<meta\s+name="description"[^>]*>/i,'')
   .replace(/<meta\s+property="og:[^"]+"[^>]*>/gi,'')
   .replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi,'')
  html=html.replace('</head>',`  ${tags.join('\n    ')}\n  </head>`)
  const headers=harden(new Headers(page.headers))
  headers.set('Content-Type','text/html; charset=utf-8')
  headers.set('Cache-Control','public, max-age=0, s-maxage=60')
  headers.delete('Content-Length')
  if(reqUrl.hostname.endsWith('.pages.dev'))headers.set('X-Robots-Tag','noindex, nofollow')
  return new Response(html,{status:200,headers})
}
