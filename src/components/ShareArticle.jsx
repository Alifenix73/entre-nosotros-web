import { useState } from 'react'

/** Comparte la URL individual de una noticia; nunca comparte todo el listado. */
export default function ShareArticle({ title, demonstration = false }) {
  const [status, setStatus] = useState('')
  const url = typeof window === 'undefined' ? '' : window.location.href
  const encodedUrl = encodeURIComponent(url)
  const encodedMessage = encodeURIComponent(`${title} — ${url}`)
  const options = [
    { label: 'WhatsApp', short: 'WA', href: `https://api.whatsapp.com/send?text=${encodedMessage}`, className: 'share-whatsapp' },
    { label: 'Facebook', short: 'f', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, className: 'share-facebook' },
    { label: 'X', short: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`, className: 'share-x' },
    { label: 'Correo', short: '✉', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedMessage}`, className: 'share-email' },
  ]

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const text = document.createElement('textarea')
        text.value = url
        text.style.position = 'fixed'
        text.style.opacity = '0'
        document.body.append(text)
        text.select()
        const ok = document.execCommand('copy')
        text.remove()
        if (!ok) throw new Error('No se pudo copiar')
      }
      setStatus('Enlace copiado. Ya puedes compartirlo.')
    } catch {
      setStatus('Copia el enlace desde la barra de direcciones de tu navegador.')
    }
  }

  async function nativeShare() {
    if (!navigator.share) return copyLink()
    try { await navigator.share({ title, url }) }
    catch (error) { if (error?.name !== 'AbortError') setStatus('No se pudo compartir. Prueba otra opción.') }
  }

  return <section className="article-sharing" aria-label="Compartir esta noticia">
    <div className="sharing-heading"><span className="sharing-symbol" aria-hidden="true">↗</span><h2>Comparte esta {demonstration ? 'vista previa' : 'noticia'}</h2></div>
    {demonstration && <p className="sharing-preview-warning">Enlace de demostración: no corresponde a una noticia publicada.</p>}
    <div className="sharing-actions">
      {options.map(option => <a key={option.label} className={`sharing-button ${option.className}`} href={option.href} target={option.label === 'Correo' ? undefined : '_blank'} rel={option.label === 'Correo' ? undefined : 'noopener noreferrer'} aria-label={`Compartir esta noticia por ${option.label}`} title={option.label}>
        <span className="sharing-icon" aria-hidden="true">{option.short}</span><span>{option.label}</span>
      </a>)}
      <button type="button" className="sharing-button sharing-copy" onClick={copyLink} aria-label="Copiar enlace de esta noticia"><span className="sharing-icon" aria-hidden="true">⧉</span><span>Copiar enlace</span></button>
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && <button type="button" className="sharing-button sharing-native" onClick={nativeShare}><span className="sharing-icon" aria-hidden="true">↗</span><span>Más opciones</span></button>}
    </div>
    <p className="sharing-status" role="status" aria-live="polite">{status}</p>
  </section>
}
