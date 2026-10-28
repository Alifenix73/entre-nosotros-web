/** Datos institucionales. Completar ANTES de publicar el sitio en producción. */
export const site = {
  name: 'Ángeles Barrios está Entre Nosotros',
  tagline: 'PERIODISMO CON SENTIDO REGIONAL',
  editorialOwner: 'María de los Ángeles Barrios Gudiño',
  copyrightYear: 2026,
  // Pendientes de validación editorial y jurídica; no inventar datos.
  publicEmail: 'contacto@entrenosotros.org',
  privacyEmail: 'contacto@entrenosotros.org',
  publicLocation: 'Tampico, Tamaulipas, México',
  legalAddress: '', // No divulgar domicilio particular; validar domicilio legal profesional antes de publicar el aviso integral.
  editorialContact: 'contacto@entrenosotros.org',
  // Actualizar en cuanto esté definida la URL pública.
  publicUrl: '',
}
export const categories = ['Tamaulipas', 'Nacional', 'Zona Sur', 'Opinión', 'Cultura', 'Entrevistas', 'Economía']
export const initialCategories = ['Tamaulipas', 'Nacional', 'Zona Sur']
export const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const categoryUrl = (name) => `/seccion/${slugify(name)}`
export const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Destacadas', href: '/destacadas' },
  ...categories.map((name) => ({ label: name, href: categoryUrl(name) })),
  { label: 'Archivo', href: '/archivo' },
]
