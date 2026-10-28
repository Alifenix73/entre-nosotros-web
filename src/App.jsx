import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { articles as localArticles } from './data/articles.js'
import { loadPublishedArticles } from './services/news.js'
import { site, categories, navItems, categoryUrl, slugify } from './config/site.js'
import Header from './components/Header.jsx'
import NewsGrid from './components/NewsGrid.jsx'
import Sponsors from './components/Sponsors.jsx'
import Footer from './components/Footer.jsx'
import SiteLink from './components/SiteLink.jsx'
import Archive from './components/Archive.jsx'
import PreviewArticle from './components/PreviewArticle.jsx'
import ShareArticle from './components/ShareArticle.jsx'

function useLocation() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, '') || '/')
  useEffect(() => {
    const sync = () => setPath(window.location.pathname.replace(/\/$/, '') || '/')
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  const navigate = (to) => {
    const target = to.replace(/\/$/, '') || '/'
    if (window.location.pathname !== target) window.history.pushState(null, '', target)
    setPath(target)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  return [path, navigate]
}
function Home({ articles, navigate }) {
  const featured = articles.filter(a => a.featured).slice(0,4)
  return <>
    <section className="news-section" aria-label="Noticias destacadas">
      <div className="section-title"><h2>Destacadas</h2><SiteLink href="/destacadas" onNavigate={navigate} className="see-all">Ver todas <span aria-hidden="true">→</span></SiteLink></div>
      <NewsGrid articles={featured} navigate={navigate} category="Destacadas" minSlots={4}/>
    </section>
    <Sponsors/>
  </>
}
function Listing({ title, articles, navigate }) {
  return <div className="listing-page">
    <SiteLink className="back" href="/" onNavigate={navigate}>← Volver a portada</SiteLink>
    <div className="listing-heading"><p className="eyebrow">Ángeles Barrios · Entre Nosotros</p><h1>{title}</h1><p>Noticias y publicaciones de esta sección</p></div>
    <NewsGrid articles={articles.slice(0,4)} navigate={navigate} category={title} minSlots={4}/>
    <Sponsors/>
  </div>
}
function Article({ article, navigate }) {
  return <article className="article-page">
    <SiteLink href="/" onNavigate={navigate} className="back">← Volver a portada</SiteLink>
    <div className="eyebrow">{article.categories.join(' · ')}</div>
    <h1>{article.title}</h1>
    {article.summary && <p className="article-summary">{article.summary}</p>}
    <div className="byline">{article.author ? `Por ${article.author} · ` : ''}{article.publishedAt || 'Publicación pendiente'}{article.eventDate ? ` · Fecha del acontecimiento: ${article.eventDate}` : ''}</div>
    {article.image && <figure><img src={article.image} alt={article.imageAlt || ''}/>{article.imageCaption && <figcaption>{article.imageCaption}</figcaption>}</figure>}
    <div className="article-body">{article.paragraphs.map((p,i) => <p key={i}>{p}</p>)}</div>
    <ShareArticle title={article.title}/>
    <Sponsors/>
  </article>
}
function SearchPanel({ articles, navigate, onClose }) {
  const [term, setTerm] = useState('')
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  const matches = articles.filter(a => normalize(`${a.title} ${a.summary || ''} ${a.categories.join(' ')}`).includes(normalize(term.trim())))
  return <section className="search-panel" aria-label="Buscar noticias"><div className="search-inner"><label htmlFor="buscar-noticias">Buscar noticias publicadas</label><div className="search-controls"><input id="buscar-noticias" type="search" autoFocus value={term} onChange={e => setTerm(e.target.value)} placeholder="Escribe una palabra, tema o sección"/><button type="button" onClick={onClose}>Cerrar</button></div>{term.trim() && <div className="search-results"><NewsGrid articles={matches} navigate={(target) => { onClose(); navigate(target) }} category="Resultados" minSlots={0} emptyMessage/></div>}</div></section>
}
export default function App() {
  const [path,navigate] = useLocation()
  const [articles,setArticles] = useState(localArticles)
  const [searchOpen,setSearchOpen] = useState(false)
  const [warning,setWarning] = useState('')
  useEffect(() => {
    let mounted = true
    loadPublishedArticles().then(data => { if(mounted && data) setArticles(data) }).catch(() => { if(mounted && import.meta.env.DEV) setWarning('No se pudo consultar Sanity. Se muestran las noticias locales.'); })
    return () => { mounted = false }
  }, [])
  const published = useMemo(() => articles.filter(a => a.published && a.slug && a.title && Array.isArray(a.paragraphs) && a.paragraphs.length > 0).sort((a,b) => (b.publishedAt||'').localeCompare(a.publishedAt||'')), [articles])
  const section = categories.find(name => path === categoryUrl(name))
  const article = path.startsWith('/noticia/') ? published.find(a => path === `/noticia/${a.slug}`) : null
  const previewMatch = path.match(/^\/vista-previa\/([a-z0-9-]+)\/(\d+)$/)
  const previewCategory = previewMatch ? ['Destacadas', 'Archivo', ...categories].find(c => slugify(c) === previewMatch[1]) : null
  const previewIndex = previewMatch ? Number(previewMatch[2]) : 0
  const isPreview = Boolean(previewCategory && previewIndex >= 1 && previewIndex <= (previewCategory === 'Archivo' ? 12 : 4))
  const isArchive = path === '/archivo'
  const displayName = isPreview ? 'Noticia' : article?.title || section || (path === '/' ? site.name : navItems.find(item => item.href === path)?.label) || 'Página no encontrada'
  useEffect(() => { document.title = displayName === site.name ? site.name : `${displayName} | ${site.name}` },[displayName])
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) { meta = document.createElement('meta');meta.name = 'robots';document.head.appendChild(meta) }
    meta.content = isPreview ? 'noindex,nofollow' : 'index,follow'
  }, [isPreview])
  let body
  if (path === '/') body = <Home articles={published} navigate={navigate}/>
  else if (isPreview) body = <PreviewArticle category={previewCategory} index={previewIndex} navigate={navigate}/>
  else if (article) body = <Article article={article} navigate={navigate}/>
  else if (isArchive) body = <Archive articles={published} navigate={navigate}/>
  else if (section || path === '/destacadas') {
    const label = section || 'Destacadas'
    const list = section ? published.filter(a => a.categories.includes(section)) : published.filter(a => a.featured)
    body = <Listing title={label} articles={list} navigate={navigate}/>
  } else body = <div className="listing-page"><h1>Página no encontrada</h1><SiteLink className="back" href="/" onNavigate={navigate}>Volver a portada</SiteLink></div>
  return <>
    <Header path={path} navigate={navigate} onSearch={() => setSearchOpen(s => !s)}/>
    {searchOpen && <SearchPanel articles={published} navigate={navigate} onClose={() => setSearchOpen(false)}/>}
    {warning && <div className="dev-notice" role="status">{warning}</div>}
    <main className="container" id="contenido">{body}</main>
    <Footer/>
  </>
}
