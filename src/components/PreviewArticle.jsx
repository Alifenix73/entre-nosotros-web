import SiteLink from './SiteLink.jsx'
import Sponsors from './Sponsors.jsx'
import ShareArticle from './ShareArticle.jsx'

// Espacios de maquetación, no contenidos publicados. Las noticias reales
// se renderizan desde el componente Article cuando existen datos editoriales.
export default function PreviewArticle({ category, navigate }) {
  const returnHref = category === 'Destacadas'
    ? '/destacadas'
    : category === 'Archivo'
      ? '/archivo'
      : `/seccion/${category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`

  return <article className="article-page preview-article">
    <SiteLink href={returnHref} onNavigate={navigate} className="back">← Volver a {category}</SiteLink>
    <div className="eyebrow">{category}</div>
    <h1>Título de la noticia</h1>
    <figure className="demo-article-photo">
      <div className="demo-image" role="img" aria-label="Área para la fotografía principal de la noticia">IMAGEN DE LA NOTICIA</div>
    </figure>
    <ShareArticle title="Entre Nosotros"/>
    <Sponsors/>
  </article>
}
