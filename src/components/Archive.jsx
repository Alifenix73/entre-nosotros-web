import { useEffect, useMemo, useState } from 'react'
import NewsGrid from './NewsGrid.jsx'
import SiteLink from './SiteLink.jsx'
import Sponsors from './Sponsors.jsx'

const PAGE_SIZE = 12
const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()

/** El archivo solo busca noticias realmente publicadas; las tarjetas vacías son vistas previas. */
export default function Archive({ articles, navigate }) {
  const [query,setQuery] = useState('')
  const [date,setDate] = useState('')
  const [page,setPage] = useState(1)
  const [mode,setMode] = useState('all')
  const filtered = useMemo(() => {
    const needle = normalize(query.trim())
    return [...articles].filter(article => {
      const fields = [article.title,article.summary,article.author,...(article.categories || []),...(article.paragraphs || [])]
      const wordMatches = !needle || normalize(fields.join(' ')).includes(needle)
      const publishedDate = String(article.publishedAt || '').slice(0,10)
      const eventDate = String(article.eventDate || '').slice(0,10)
      const dateMatches = !date || (mode === 'published' ? publishedDate === date : mode === 'event' ? eventDate === date : publishedDate === date || eventDate === date)
      return wordMatches && dateMatches
    }).sort((a,b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))
  },[articles,query,date,mode])
  useEffect(() => setPage(1), [query,date,mode])
  const totalPages = Math.max(1,Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page,totalPages)
  const visible = filtered.slice((safePage-1)*PAGE_SIZE,safePage*PAGE_SIZE)
  const showSamples = articles.length === 0 && !query.trim() && !date
  return <div className="listing-page archive-page">
    <SiteLink className="back" href="/" onNavigate={navigate}>← Volver a portada</SiteLink>
    <div className="listing-heading"><p className="eyebrow">Hemeroteca digital</p><h1>Archivo de noticias</h1><p>Consulta publicaciones anteriores por palabra clave o fecha.</p></div>
    <section className="archive-filters" aria-label="Buscar en el archivo">
      <div className="archive-filter-field archive-search"><label htmlFor="archive-query">Palabras clave</label><input id="archive-query" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Título, persona, lugar o tema" autoComplete="off"/></div>
      <div className="archive-filter-field"><label htmlFor="archive-date">Fecha</label><input id="archive-date" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
      <div className="archive-filter-field"><label htmlFor="archive-date-kind">Buscar fecha de</label><select id="archive-date-kind" value={mode} onChange={e=>setMode(e.target.value)}><option value="all">Publicación o acontecimiento</option><option value="published">Publicación</option><option value="event">Acontecimiento</option></select></div>
      <button type="button" className="archive-clear" onClick={()=>{setQuery('');setDate('');setMode('all');setPage(1)}} disabled={!query && !date && mode==='all'}>Limpiar filtros</button>
    </section>
    <div className="archive-result-count" role="status" aria-live="polite">{filtered.length ? `${filtered.length} ${filtered.length===1?'noticia encontrada':'noticias encontradas'}` : 'Todavía no hay noticias publicadas que coincidan con la búsqueda.'}{filtered.length > PAGE_SIZE ? ` · Página ${safePage} de ${totalPages}` : ''}</div>
    {showSamples && <p className="archive-hint">Vista de prueba: se muestran doce espacios para comprobar la presentación del archivo. No son publicaciones reales. Selecciona uno para ver el diseño de una noticia.</p>}
    {filtered.length > 0 ? <NewsGrid articles={visible} navigate={navigate} category="Archivo" minSlots={0}/> : showSamples ? <NewsGrid articles={[]} navigate={navigate} category="Archivo" minSlots={PAGE_SIZE}/> : <div className="archive-no-results">No hay resultados. Prueba con otra palabra o fecha, o limpia los filtros.</div>}
    {totalPages > 1 && <nav className="archive-pagination" aria-label="Páginas del archivo"><button type="button" disabled={safePage===1} onClick={()=>{setPage(n=>Math.max(1,n-1));window.scrollTo({top:0})}}>← Anteriores</button><span>Página {safePage} de {totalPages}</span><button type="button" disabled={safePage===totalPages} onClick={()=>{setPage(n=>Math.min(totalPages,n+1));window.scrollTo({top:0})}}>Siguientes →</button></nav>}
    <Sponsors/>
  </div>
}
