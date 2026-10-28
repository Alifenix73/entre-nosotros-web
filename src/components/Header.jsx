import { useEffect, useRef, useState } from 'react'
import { navItems, site } from '../config/site.js'
import SiteLink from './SiteLink.jsx'

export default function Header({ path, navigate, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event) => { if (event.key === 'Escape') { setMenuOpen(false); buttonRef.current?.focus() } }
    const onPointer = (event) => { if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer) }
  }, [menuOpen])
  const go = (target) => { setMenuOpen(false); navigate(target) }
  return <>
    <header className="hero" id="inicio">
      <div className="hero-controls">
        <button ref={buttonRef} className="round-button" type="button" onClick={() => setMenuOpen(v => !v)} aria-controls="menu-desplegable" aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú de secciones' : 'Abrir menú de secciones'}>{menuOpen ? '×' : '☰'}</button>
        <button className="round-button" type="button" onClick={onSearch} aria-label="Abrir búsqueda">⌕</button>
      </div>
      <SiteLink href="/" onNavigate={go} className="masthead"><span>Ángeles Barrios está</span><strong>Entre Nosotros</strong><em>{site.tagline}</em></SiteLink>
      {menuOpen && <nav ref={menuRef} id="menu-desplegable" className="mobile-menu" aria-label="Menú desplegable de secciones">
        <div className="mobile-menu-title">Explorar el periódico</div>
        {navItems.map(item => <SiteLink key={item.href} href={item.href} onNavigate={go} aria-current={path === item.href ? 'page' : undefined}>{item.label}</SiteLink>)}
      </nav>}
    </header>
    <nav className="topnav" aria-label="Navegación principal">
      {navItems.map(item => <SiteLink key={item.href} href={item.href} onNavigate={go} aria-current={path === item.href ? 'page' : undefined}>{item.label}</SiteLink>)}
    </nav>
  </>
}
