import {test} from 'node:test'
import assert from 'node:assert/strict'
import {onRequestGet as sitemap} from '../functions/sitemap.xml.js'
import {onRequestGet as robots} from '../functions/robots.txt.js'
import {onRequestGet as newsSitemap} from '../functions/news-sitemap.xml.js'
const ctx=(hostname='entrenosotros.org',env={})=>({request:new Request(`https://${hostname}/sitemap.xml`),env})
test('sitemap sin configurar Sanity contiene las rutas estáticas',async()=>{
 const r=await sitemap(ctx());const xml=await r.text();assert.equal(r.status,200)
 assert.match(xml,/xml version=/);assert.match(xml,/seccion\/tamaulipas/);assert.ok(!xml.includes('vista-previa'))
})
test('sitemap incluye solamente slugs seguros de noticias',async()=>{
 const before=globalThis.fetch
 globalThis.fetch=async()=>Response.json({result:[{slug:'nota-tampico',updated:'2026-10-27T12:00:00Z'},{slug:'../malicioso'},{slug:'otra-nota'}]})
 try{
  const r=await sitemap(ctx('entrenosotros.org',{SANITY_PROJECT_ID:'abc123'}));const xml=await r.text()
  assert.match(xml,/noticia\/nota-tampico/);assert.match(xml,/noticia\/otra-nota/)
  assert.ok(!xml.includes('malicioso'));assert.match(xml,/<lastmod>2026-10-27<\/lastmod>/)
 }finally{globalThis.fetch=before}
})
test('robots bloquea versiones de Pages y enlaza al sitemap público',async()=>{
 const prod=await robots({request:new Request('https://entrenosotros.org/robots.txt')})
 assert.match(await prod.text(),/Sitemap: https:\/\/entrenosotros.org\/sitemap.xml/)
 const stage=await robots({request:new Request('https://test.pages.dev/robots.txt')})
 assert.match(await stage.text(),/Disallow: \//)
})

test('Google News: no incluye noticias antiguas y escapa títulos XML',async()=>{
 const orig=globalThis.fetch;const current=new Date().toISOString();const old='2026-01-01T00:00:00Z'
 globalThis.fetch=async()=>Response.json({result:[{slug:'actual',title:'Tampico & noticias',publishedAt:current},{slug:'antigua',title:'No',publishedAt:old}]})
 try{
  const r=await newsSitemap(ctx('entrenosotros.org',{SANITY_PROJECT_ID:'abc123'}));const xml=await r.text()
  assert.match(xml,/noticia\/actual/);assert.ok(!xml.includes('noticia/antigua'))
  assert.match(xml,/Tampico &amp; noticias/);assert.match(xml,/news:publication_date/)
 }finally{globalThis.fetch=orig}
})
