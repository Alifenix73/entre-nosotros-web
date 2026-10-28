/** Borradores de información legal; deben validarse con datos de contacto y domicilio. */
import { site } from '../config/site.js'
const pending = (value, label) => value || `[PENDIENTE: ${label}]`
const mailbox = pending(site.privacyEmail || site.publicEmail, 'correo de contacto para privacidad y derechos ARCO')
const publicLocation = site.publicLocation || 'Tampico, Tamaulipas, México'
const contact = pending(site.publicEmail, 'correo institucional de contacto')
const editorialContact = pending(site.editorialContact || site.publicEmail, 'medio de contacto editorial')
const owner = site.editorialOwner
export const legalDocuments = [
  {
    id: 'contacto', title: 'Contacto', symbol: '✉', sections: [
      { title: 'Dirección editorial', paragraphs: [`${site.name} es un medio a cargo de ${owner}.`, `Correo institucional: ${contact}.`, `Ubicación editorial: ${publicLocation}.`, `Consultas editoriales y solicitudes de aclaración: ${editorialContact}.`] },
      { title: 'Atención a solicitudes', paragraphs: ['Para enviar una aclaración, rectificación o solicitud relativa a una publicación, indica la dirección de la noticia, la razón de tu solicitud y un medio de respuesta. La recepción de una solicitud no implica su aceptación automática.'] },
    ],
  },
  {
    id: 'privacidad', title: 'Aviso de privacidad', symbol: '◇', sections: [
      { title: 'Identidad de la responsable', paragraphs: [`La responsable del tratamiento de datos personales es ${owner}, vinculada al medio digital ${site.name}.`, `Ubicación editorial pública: ${publicLocation}.`, 'El domicilio para efectos del aviso integral está pendiente de validación. Este texto es un borrador y debe revisarse antes de la publicación definitiva.', 'Fecha de actualización: 27 de octubre de 2026.'] },
      { title: 'Datos que pueden tratarse', paragraphs: ['En esta etapa, el sitio no incluye formularios públicos de registro, comentarios ni suscripción. Si una persona se comunica por correo, pueden tratarse su nombre, dirección electrónica y la información incluida voluntariamente en el mensaje.', 'Los proveedores de alojamiento y servicios técnicos pueden registrar datos de conexión, como dirección IP, tipo de navegador, fecha, hora y datos necesarios para seguridad y funcionamiento del servicio. La configuración final de cookies y servicios de terceros deberá revisarse al contratar e integrar cada proveedor.', 'No se solicita deliberadamente información personal sensible mediante el sitio público. No incluyas datos sensibles en mensajes no protegidos.'] },
      { title: 'Finalidades', paragraphs: ['Se utilizarán los datos para responder consultas, atender rectificaciones y solicitudes editoriales, proteger la seguridad y continuidad del sitio y cumplir obligaciones legales aplicables.', 'No se utilizarán los datos para campañas publicitarias por correo sin informar previamente las finalidades y, cuando corresponda, obtener el consentimiento exigido.'] },
      { title: 'Transferencias, encargados y conservación', paragraphs: ['Los servicios de hosting, correo y gestión editorial podrán tratar datos por cuenta de la responsable, conforme a sus contratos y políticas aplicables. La identidad de los proveedores y las posibles transferencias internacionales deben verificarse antes del lanzamiento y reflejarse en este aviso si corresponde.', 'La información se conservará solo durante el tiempo necesario para atender su finalidad y cumplir las obligaciones legales y de seguridad correspondientes. El periodo concreto dependerá del tipo de comunicación y la infraestructura finalmente contratada.'] },
      { title: 'Derechos ARCO y limitación de uso', paragraphs: [`Para solicitar acceso, rectificación, cancelación u oposición al tratamiento de datos personales, o limitar su uso o divulgación, escribe a ${mailbox}. Indica el derecho que deseas ejercer, la información pertinente y un medio para recibir respuesta. Podrá solicitarse información razonable para verificar la identidad.`, 'Las solicitudes se atenderán de acuerdo con los requisitos, plazos y excepciones establecidos en la legislación mexicana aplicable.'] },
      { title: 'Cambios al aviso', paragraphs: ['Las modificaciones al aviso se comunicarán mediante su publicación en esta misma sección, señalando la fecha de actualización. La versión definitiva deberá publicarse una vez confirmados el domicilio, el canal de atención, los proveedores y el tratamiento efectivo de datos.'] },
    ],
  },
  {
    id: 'terminos', title: 'Términos de uso', symbol: '§', sections: [
      { title: 'Ámbito de aplicación', paragraphs: [`El acceso y la consulta del sitio ${site.name}, cuya dirección editorial corresponde a ${owner}, se sujetan a estos términos y a la legislación aplicable en México.`, 'El sitio está destinado a la difusión de información periodística, de opinión, cultural, económica y de interés regional o nacional.'] },
      { title: 'Uso permitido', paragraphs: ['Se permite la lectura y el uso personal no comercial de los contenidos, así como compartir enlaces a sus páginas originales. Los contenidos no deben alterarse ni atribuirse falsamente a otra persona.', 'La reutilización comercial, distribución sistemática o reproducción integral de textos, fotografías y diseños puede requerir autorización previa de sus titulares.'] },
      { title: 'Exactitud, actualizaciones y enlaces', paragraphs: ['El medio procurará la verificación de la información y podrá corregir, aclarar o actualizar las publicaciones. Las noticias pueden reflejar hechos en desarrollo y no representan necesariamente información definitiva.', 'Los enlaces a sitios de terceros se facilitan como referencia; cada sitio externo es responsable de su contenido, seguridad y políticas.'] },
      { title: 'Reportes', paragraphs: [`Para solicitar una corrección, reportar material presuntamente ilícito o plantear una reclamación de derechos, escribe a ${editorialContact} e indica la URL y una descripción del caso.`, 'Estos términos no limitan derechos irrenunciables reconocidos por las leyes aplicables.'] },
    ],
  },
  {
    id: 'autor', title: 'Derechos de autor', symbol: '©', sections: [
      { title: 'Titularidad y reserva', paragraphs: [`© ${site.copyrightYear} ${owner}. ${site.name}. Todos los derechos reservados sobre el contenido original del medio, sin perjuicio de los derechos de autores, fotógrafos, colaboradores y terceros expresamente acreditados.`, 'La titularidad de fotografías, marcas, logotipos, piezas de agencias y material aportado por terceros corresponde a sus propietarios respectivos. La mera publicación en el sitio no implica cesión de esos derechos.'] },
      { title: 'Citas, enlaces y autorizaciones', paragraphs: ['Los enlaces a noticias originales se pueden compartir libremente. La cita breve de contenidos deberá respetar la legislación aplicable, la autoría y la fuente.', 'Para reproducir fotografías o textos de forma sustancial, reutilizarlos con fines comerciales o solicitar una licencia, contacta a la dirección editorial antes de utilizarlos.'] },
      { title: 'Reclamaciones', paragraphs: [`Si consideras que algún contenido vulnera derechos de autor, escribe a ${editorialContact} con la URL, una descripción de la obra y la información que acredite tu titularidad o representación. Cada caso será revisado.`, 'Los anuncios y logotipos de patrocinadores siguen siendo propiedad de sus titulares y se mostrarán con la autorización correspondiente.'] },
    ],
  },
  {
    id: 'editorial', title: 'Política editorial', symbol: '✎', sections: [
      { title: 'Responsabilidad', paragraphs: [`${site.name} es un proyecto periodístico bajo la responsabilidad editorial de ${owner}, con el propósito de informar sobre asuntos de relevancia regional y nacional.`, 'Se distinguirá la información noticiosa de los textos de opinión, entrevistas, comunicados y publicidad.'] },
      { title: 'Verificación y fuentes', paragraphs: ['La redacción procurará contrastar los datos importantes, identificar el origen de la información, contextualizar las declaraciones y conceder oportunidad de respuesta cuando sea pertinente.', 'No se fabricarán hechos, citas, fotografías ni fechas de publicación. Cuando el acontecimiento ocurra en una fecha anterior a la publicación digital, podrán indicarse ambas fechas de forma diferenciada.'] },
      { title: 'Correcciones y derecho de réplica', paragraphs: [`Las solicitudes fundamentadas de corrección, aclaración o réplica pueden dirigirse a ${editorialContact}, incluyendo el enlace y los elementos relevantes.`, 'Cuando se detecte un error sustancial, se corregirá procurando dejar constancia de la modificación y su fecha, según la naturaleza del caso y las obligaciones aplicables.'] },
      { title: 'Contenido patrocinado y conflictos de interés', paragraphs: ['Los espacios de publicidad se identificarán como tales. La contratación de anuncios no concede al anunciante control sobre las decisiones de cobertura editorial.', 'Los contenidos pagados, patrocinados o promocionales deben distinguirse claramente de la información periodística independiente.'] },
      { title: 'Respeto a las personas', paragraphs: ['Se evitarán afirmaciones discriminatorias y la publicación innecesaria de datos privados. Se valorará especialmente el tratamiento responsable de información relacionada con víctimas, niñas, niños y adolescentes.'] },
    ],
  },
]
