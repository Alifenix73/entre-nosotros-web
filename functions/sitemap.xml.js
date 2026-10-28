/** Sitemap que incluye secciones y noticias publicadas, nunca borradores ni vistas previas. */
const API_VERSION='2026-10-01'
const staticPaths=['/','/destacadas','/seccion/tamaulipas','/seccion/nacional','/seccion/zona-sur','/seccion/opinion','/seccion/cultura','/seccion/entrevistas','/seccion/economia','/archivo']
const escapeXml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
const validSlug=s=>typeof s==='string'&&/^[a-z0-9-]{1,96}$/.test(s)
export async function onRequestGet({request,env}){
  const origin=new URL(request.url).origin
  const urls=staticPaths.map(path=>({url:new URL(path,origin).toString()}))
  const id=String(env.SANITY_PROJECT_ID||'')
  const dataset=String(env.SANITY_DATASET||'production')
  if(/^[a-z0-9-]+$/i.test(id)&&/^[a-z0-9_-]+$/i.test(dataset)){
    try{
      const query='*[_type == "article" && defined(slug.current) && defined(title) && count(body[_type == "block"]) > 0] | order(publishedAt desc) [0...1000]{"slug":slug.current,"updated":_updatedAt}'
      const api=new URL(`https://${id}.apicdn.sanity.io/v${API_VERSION}/data/query/${dataset}`)
      api.searchParams.set('query',query)
      api.searchParams.set('perspective','published')
      const resp=await fetch(api.toString(),{signal:AbortSignal.timeout(8000)})
      if(resp.ok){
        const data=(await resp.json()).result
        for(const doc of Array.isArray(data)?data:[]){
          if(!validSlug(doc?.slug))continue
          urls.push({url:new URL(`/noticia/${doc.slug}`,origin).toString(),updated:doc.updated})
        }
      }
    }catch{/* Mantiene el mapa de páginas públicas básicas si Sanity está inaccesible. */}
  }
  const nodes=urls.map(({url,updated})=>`  <url><loc>${escapeXml(url)}</loc>${updated&&/^\d{4}-\d\d-\d\d/.test(updated)?`<lastmod>${escapeXml(updated.slice(0,10))}</lastmod>`:''}</url>`).join('\n')
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</urlset>`
  const headers={'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage=300','X-Content-Type-Options':'nosniff'}
  if(new URL(request.url).hostname.endsWith('.pages.dev'))headers['X-Robots-Tag']='noindex, nofollow'
  return new Response(xml,{headers})
}
