import { useState } from 'react'
import { sponsors } from '../config/sponsors.js'
import { site } from '../config/site.js'

function SponsorCard({ sponsor }) {
  const [broken, setBroken] = useState(false)

  if (sponsor.available) {
    const mailto = `mailto:${site.publicEmail}?subject=${encodeURIComponent('Quiero anunciarme en Entre Nosotros')}`
    return <article className="ad-card ad-card-available">
      <span className="ad-label">PUBLICIDAD</span>
      <div className="ad-available-content">
        <span className="ad-sparkle" aria-hidden="true">✦</span>
        <a className="ad-cta" href={mailto} aria-label="Solicitar información sobre espacios publicitarios">
          <span className="ad-live-dot" aria-hidden="true" />
          Tu anuncio puede estar aquí
        </a>
        <small>Haz que tu marca forme parte de nuestra comunidad</small>
      </div>
    </article>
  }

  const content = sponsor.image && !broken
    ? <img className="sponsor-logo" src={sponsor.image} alt={`Anuncio de ${sponsor.name}`} onError={() => setBroken(true)} loading="lazy" />
    : <div className="sponsor-pending" aria-hidden="true">IMAGEN DEL ANUNCIO PENDIENTE</div>

  // Una sola zona clicable: ocupa TODO el recuadro, no sólo el texto.
  const isWeb = /^https?:\/\//i.test(sponsor.url || '')
  const linkProps = isWeb ? { target: '_blank', rel: 'noopener noreferrer sponsored' } : {}

  return <article className="ad-card ad-card-sponsored">
    {sponsor.url ?
      <a className="ad-sponsor-link" href={sponsor.url} {...linkProps} aria-label={`Abrir anuncio de ${sponsor.name}`}>
        {content}
      </a> :
      <div className="ad-sponsor-link ad-sponsor-inactive" aria-label={`Anuncio de ${sponsor.name}`}>
        {content}
      </div>}
    <span className="ad-label ad-label-overlay">PUBLICIDAD</span>
  </article>
}

export default function Sponsors() {
  return <section className="news-section ads-section" aria-label="Espacios publicitarios">
    <div className="ads-grid">{sponsors.map((s) => <SponsorCard key={s.id} sponsor={s}/>)}</div>
  </section>
}
