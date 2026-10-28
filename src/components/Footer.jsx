import { useEffect, useRef, useState } from 'react'
import { legalDocuments } from '../content/legal.js'
import { site } from '../config/site.js'
export default function Footer() {
  const [active, setActive] = useState(null)
  const closeButton = useRef(null)
  const opener = useRef(null)
  useEffect(() => {
    if (!active) return
    closeButton.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') { setActive(null); return }
      if (event.key === 'Tab') {
        const dialog = document.querySelector('.legal-dialog')
        const list = [...(dialog?.querySelectorAll('button, a[href]') || [])]
        if (!list.length) return
        const first = list[0], last = list[list.length-1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    const prior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prior; opener.current?.focus() }
  }, [active])
  function show(doc, event) { opener.current = event.currentTarget; setActive(doc) }
  return <>
    <footer className="footer"><div className="footer-inner"><div className="footer-title">Ángeles Barrios está <strong>Entre Nosotros</strong></div><p className="footer-tagline">PERIODISMO CON SENTIDO REGIONAL</p><div className="footer-buttons" aria-label="Documentos legales y contacto">{legalDocuments.map(doc => <button type="button" key={doc.id} onClick={(event) => show(doc,event)} title={doc.title} aria-label={`Abrir ${doc.title}`}>{doc.symbol}</button>)}</div><p className="legal-labels">Contacto · Aviso de privacidad · Términos de uso · Derechos de autor · Política editorial</p><p className="copyright">© {site.copyrightYear} {site.editorialOwner}. Todos los derechos reservados.</p></div></footer>
    {active && <div className="modal-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setActive(null) }}>
      <section className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-dialog-title" tabIndex={-1}>
        <div className="dialog-heading"><h2 id="legal-dialog-title">{active.title}</h2><button ref={closeButton} className="modal-close" aria-label="Cerrar ventana" onClick={() => setActive(null)}>×</button></div>
        <div className="dialog-scroll">{active.sections.map((section,i) => <section className="legal-section" key={i}><h3>{section.title}</h3>{section.paragraphs.map((p,j) => <p key={j}>{p}</p>)}</section>)}</div>
        <div className="dialog-actions"><button className="modal-done" onClick={() => setActive(null)}>Cerrar</button></div>
      </section>
    </div>}
  </>
}
