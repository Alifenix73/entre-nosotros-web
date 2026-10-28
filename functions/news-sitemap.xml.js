/** Google News: únicamente publicaciones digitales de los últimos dos días. */
const API_VERSION='2026-10-01'
const escapeXml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
export async function onRequestGet({request,env}){
  const origin=new URL(request.url).origin
  const now=Date.now()
  const id=String(env.SANITY_PROJECT_ID||'')
  const dataset=String(env.SANITY_DATASET||'production')
  const recent=[]
  if(/^[a-z0-9-]+$/i.test(id)&&/^[a-z0-9_-]+$/i.test(dataset)){
    try{
      const query='*[_type == "article" && defined(slug.current) && defined(title) && defined(publishedAt) && count(body[_type == "block"]) > 0] | order(publishedAt desc) [0...1000]{"slug":slug.current,title,publishedAt}'
      const api=new URL(`https://${id}.apicdn.sanity.io/v${API_VERSION}/data/query/${dataset}`)
      api.searchParams.set('query',query)
      api.searchParams.set('perspective','published')
      const r=await fetch(api.toString(),{signal:AbortSignal.timeout(8000)})
      if(r.ok){
        for(const a of (await r.json()).result||[]){
          const t=Date.parse(a.publishedAt)
          if(typeof a.slug!=='string'||!/^[a-z0-9-]{1,96}$/.test(a.slug)||typeof a.title!=='string'||!Number.isFinite(t)||t>now||t<now-48*60*60*1000)continue
          recent.push(a)
        }
      }
    }catch{/* Evita que la web deje de responder por una falla externa. */}
  }
  const items=recent.map(a=>`  <url><loc>${escapeXml(new URL(`/noticia/${a.slug}`,origin).toString())}</loc><news:news><news:publication><news:name>Ángeles Barrios está Entre Nosotros</news:name><news:language>es</news:language></news:publication><news:publication_date>${escapeXml(a.publishedAt)}</news:publication_date><news:title>${escapeXml(a.title)}</news:title></news:news></url>`).join('\n')
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${items}\n</urlset>`
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage=300','X-Content-Type-Options':'nosniff'}})
}
