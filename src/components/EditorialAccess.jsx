import SiteLink from './SiteLink.jsx'

const studioUrl = (import.meta.env.VITE_SANITY_STUDIO_URL || '').trim()
const studioReady = /^https:\/\/[-a-z0-9.]+(?:\/[^\s]*)?$/i.test(studioUrl)

/** Ruta informativa; no intenta autenticar desde el frontend público. */
export default function EditorialAccess({ navigate }) {
  return <section className="editorial-access">
    <SiteLink className="back" href="/" onNavigate={navigate}>← Volver a portada</SiteLink>
    <p className="eyebrow">Acceso privado a la redacción</p>
    <h1>Administración editorial</h1>
    <p>Las noticias se gestionan desde Sanity Studio. Los datos se guardan en el CMS y el acceso está protegido con las cuentas reales de Sanity, no con contraseñas incluidas en esta web.</p>
    <div className="editorial-access-panel">
      <h2>Panel para la redacción</h2>
      {studioReady
        ? <><p>Selecciona el enlace e inicia sesión con tu cuenta autorizada.</p>
          <a className="editorial-access-button" href={studioUrl} target="_blank" rel="noopener noreferrer">Abrir panel editorial ↗</a></>
        : <><p><strong>Pendiente de activar.</strong> Antes del primer acceso hay que crear el proyecto Sanity, instalar el Studio incluido en este ZIP y agregar su URL en la configuración.</p>
          <p>El sitio público continúa funcionando durante esta preparación.</p></>}
    </div>
    <p className="editorial-security-note">Las cuentas de dirección y administración se invitan por correo electrónico desde Sanity Manage. No introduzcas claves en el código ni en un archivo público.</p>
  </section>
}
