/** robots.txt usa el dominio solicitado, sin asumir que el dominio ya está conectado. */
export async function onRequestGet({request}){
  const url=new URL(request.url)
  const testing=url.hostname.endsWith('.pages.dev')
  const txt=testing?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /vista-previa/\n\nSitemap: ${url.origin}/sitemap.xml\nSitemap: ${url.origin}/news-sitemap.xml\n`
  return new Response(txt,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}})
}
