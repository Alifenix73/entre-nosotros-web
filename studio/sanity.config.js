import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { articleSchema } from './schemas/article.js'

// La autenticación y los permisos reales los controla Sanity, NO esta interfaz.
// El ID del proyecto se establece en studio/.env después de crear el proyecto.
export default defineConfig({
  name: 'entre-nosotros',
  title: 'Entre Nosotros · Redacción',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: [articleSchema] },
})
