import React from 'react'
/** Enlace semántico; navegación local sin recargar con historial y teclado normales. */
export default function SiteLink({ href, onNavigate, children, ...props }) {
  return <a href={href} {...props} onClick={(event) => {
    props.onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === '_blank') return
    event.preventDefault()
    onNavigate(href)
  }}>{children}</a>
}
