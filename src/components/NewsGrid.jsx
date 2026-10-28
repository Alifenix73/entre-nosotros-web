import SiteLink from './SiteLink.jsx'
import { slugify } from '../config/site.js'

export function NewsCard({ article, navigate }) {
  return <article className="news-card">
    <SiteLink href={`/noticia/${article.slug}`} onNavigate={navigate} className="card-link">
      {article.image ? <img className="card-image" src={article.image} alt={article.imageAlt || ''} loading="lazy" /> : <div className="card-image placeholder-image" aria-hidden="true"><span>ENTRE NOSOTROS</span></div>}
      <div className="card-content"><h3>{article.title}</h3>{article.summary && <p>{article.summary}</p>}<small>{article.publishedAt || 'Fecha por confirmar'}</small></div>
    </SiteLink>
  </article>
}
export function NewsSlot({ index, category, navigate }) {
  const href = `/vista-previa/${slugify(category)}/${index}`
  return <article className="news-card news-slot">
    <SiteLink href={href} onNavigate={navigate} className="card-link" aria-label={`Abrir vista previa de noticia ${index} de ${category}`}>
      <div className="card-image slot-image" aria-hidden="true"><span>IMAGEN DE LA NOTICIA</span></div>
      <div className="card-content"><h3>Espacio para noticia {index}</h3><p>Entra para comprobar cómo se mostrarán la noticia y sus anuncios.</p><small className="preview-link-text">Ver nota completa →</small></div>
    </SiteLink>
  </article>
}
export default function NewsGrid({ articles, navigate, category, minSlots=4, emptyMessage=false }) {
  const count = Math.max(0, minSlots - articles.length)
  return <>
    {emptyMessage && !articles.length && <p className="search-empty">No encontramos noticias publicadas con ese criterio.</p>}
    <div className="news-grid">
      {articles.map(a => <NewsCard key={a.slug} article={a} navigate={navigate} />)}
      {Array.from({ length: count }, (_, index) => <NewsSlot key={`slot-${index}`} index={articles.length + index + 1} category={category} navigate={navigate} />)}
    </div>
  </>
}
