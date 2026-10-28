import { test } from 'node:test'
import assert from 'node:assert/strict'
import { onRequestGet } from '../functions/noticia/[slug].js'
const html='<!doctype html><html><head><title>Periódico</title><meta name="description" content="Base"><meta property="og:title" content="Inicio"><meta name="twitter:card" content="summary"></head><body><div id="root"></div></body></html>'
const base=()=>new Response(html,{headers:{'content-type':'text/html'}})
const env={SANITY_PROJECT_ID:'abc123',SANITY_DATASET:'production',ASSETS:{fetch:async()=>base()}}
const context=(slug='nota-prueba',override={})=>({request:new Request(`https://entrenosotros.org/noticia/${slug}`),params:{slug},env:{...env,...override}})
test('noticia publicada: metadatos individuales, JSON-LD y seguridad',async()=>{
 const before=globalThis.fetch
 globalThis.fetch=async()=>Response.json({result:{title:'Tampico & desarrollo',summary:'Resumen real',author:'Reportera',image:'https://cdn.sanity.io/images/abc123/production/a.jpg',publishedAt:'2026-10-27T16:00:00Z',_updatedAt:'2026-10-27T16:10:00Z'}})
 try{
  const r=await onRequestGet(context());const body=await r.text()
  assert.equal(r.status,200)
  assert.match(body,/Tampico &amp; desarrollo/)
  assert.equal((body.match(/property="og:title"/g)||[]).length,1)
  assert.equal((body.match(/<title>/g)||[]).length,1)
  assert.match(body,/<script type="application\/ld\+json">/)
  assert.match(body,/"@type":"NewsArticle"/)
  assert.match(body,/"author":\{"@type":"Person"/)
  assert.match(body,/href="https:\/\/entrenosotros.org\/noticia\/nota-prueba"/)
  assert.equal(r.headers.get('X-Frame-Options'),'DENY')
  assert.match(r.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/)
 }finally{globalThis.fetch=before}
})
test('no expone contenido ni indexa al faltar configuración Sanity',async()=>{
 const r=await onRequestGet(context('nota-prueba',{SANITY_PROJECT_ID:''}))
 assert.equal(await r.text(),html)
 assert.equal(r.headers.get('X-Robots-Tag'),'noindex, nofollow')
})
test('slug inválido responde 404',async()=>assert.equal((await onRequestGet(context('..'))).status,404))
test('noticia no publicada responde 404',async()=>{
 const before=globalThis.fetch;globalThis.fetch=async()=>Response.json({result:null})
 try{assert.equal((await onRequestGet(context())).status,404)}finally{globalThis.fetch=before}
})
test('titular malicioso no puede cerrar script JSON-LD',async()=>{
 const before=globalThis.fetch;globalThis.fetch=async()=>Response.json({result:{title:'Prueba </script><script>alert(1)</script>',summary:'Sin código ejecutable',author:'Redacción'}})
 try{const r=await onRequestGet(context());const body=await r.text();assert.equal(r.status,200);assert.equal((body.match(/<script>/g)||[]).length,0);assert.ok(!body.includes('"headline":"Prueba </script>'))}finally{globalThis.fetch=before}
})
