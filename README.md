# LUMIERE_OPTIQUE

Experiencia e-commerce premium de gafas para Lumiere_Optique en Bogotá, con tienda, personalización, probador virtual y backoffice. Incluye Next.js App Router, TypeScript, Tailwind CSS, next-intl, TanStack Query/Table, Zustand, React Hook Form y Zod.

## Requisitos

- Node.js 20.9 o posterior
- npm

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Rutas

- `/` — Inicio de Lumiere_Optique
- `/shop` — Catálogo con filtros por rostro, material, estilo y lente
- `/product/sol-01` — Detalle del producto y vista giratoria de 24 posiciones
- `/configure/sol-01` — Configuración de lentes y validación de compatibilidad de fórmula
- `/design` — Configurador de montura y recepción de propuestas de diseño
- `/try-on/sol-01` — Probador virtual con cámara y face landmarks de MediaPipe
- `/checkout` — Carga de receta, captura manual de fórmula y método de pago demostrativo
- `/admin/users` — CRUD paginado de usuarios, filtros y exportación CSV/Excel
- `/admin/inventory`, `/admin/inventory/new` — Inventario y formulario de alta de producto con imágenes de galería/cámara
- `/admin/designs`, `/admin/lab` — Revisión de diseños y órdenes del laboratorio
- `/admin/login` — Inicio de sesión del backoffice; protege las páginas y los endpoints administrativos con una cookie firmada

La tienda ofrece cambio de idioma desde la cabecera (español, inglés y francés); la selección se conserva en una cookie. El acceso a WhatsApp está disponible desde el botón flotante, la ficha de producto y el checkout. El pie de página incluye los datos de contacto, Instagram y el mapa de la tienda: Cra. 21 #24 Sur-80, Bogotá, Colombia.

En desarrollo, el acceso de demostración es `admin@opticaosuna.co` / `OsunaDemo2025!`. Para cambiarlo, copia `.env.example` a `.env.local` y define `ADMIN_EMAIL`, `ADMIN_PASSWORD` y un `ADMIN_SESSION_SECRET` aleatorio. En producción, esas tres variables son obligatorias; nunca uses las credenciales de demostración.

## Manual de usuario por rol

### Visitante o cliente

1. Entra a `/` y selecciona **Descubre la colección** o **Explorar**.
2. En `/shop`, filtra las monturas por rostro, material, estilo o tipo de lente. Usa el selector de orden para ordenar por popularidad o precio; en móvil, abre **Filtros** para ver las opciones.
3. Abre una montura para consultar sus medidas y desliza el control de **Vista 360°** para cambiar la vista. **Pruébatelas** abre el probador virtual; autoriza el uso de la cámara y centra el rostro. También puedes explorar el catálogo sin activar la cámara.
4. Selecciona **Configurar lentes**, elige el tipo de lente y, si conoces tu esfera, introdúcela para comprobar la compatibilidad. Si la graduación supera el máximo permitido para esa montura, el sistema bloquea la continuación.
5. Continúa a receta y pago. Adjunta la receta como PDF o imagen, o escribe esfera, cilindro, eje, adición y DIP. Para la DIP, puedes medir con cámara y una tarjeta bancaria o escribir el valor manualmente.
6. Selecciona Wompi, MercadoPago o contraentrega y confirma el pedido de demostración.

### Cliente creador

1. Entra en **Diseña tus gafas** o abre `/design`.
2. Ajusta el material, el color de la montura, el tono de las lentes y el grabado (hasta 10 caracteres). La vista previa refleja la configuración.
3. Adjunta un archivo `.glb`, `.obj`, `.svg` o `.png` de hasta 20 MB, escribe tu nombre, correo y una descripción de al menos 10 caracteres, y envía la propuesta.
4. Verás la confirmación en pantalla. El equipo de Óptica Osuna podrá revisar la propuesta desde **Diseños recibidos** en el backoffice.

### Administrador

1. Abre `/admin/login` e inicia sesión. En desarrollo puedes usar las credenciales de demostración indicadas arriba. Selecciona **Cerrar sesión** en la barra lateral al terminar.
2. En **Resumen**, consulta los accesos rápidos y la actividad de demostración.
3. En **Usuarios**, busca por nombre o correo, filtra por rol, cambia el tamaño de página (10, 25 o 50), crea perfiles, edita sus datos o elimina un perfil confirmando la operación. Usa **CSV** o **Excel** para descargar los resultados que coinciden con los filtros actuales.
4. En **Inventario**, busca productos, identifica si provienen del inventario propio o de un diseño aprobado y usa **+**, **−** o el campo de cantidad para ajustar el stock. Edita sus datos y fotos o elimínalos. Al llegar a cero unidades, el producto queda como agotado y permanece visible en el inventario; deja de mostrarse en la tienda.
5. En **Diseños recibidos**, revisa la idea y su archivo, define un precio cotizado y selecciona **Aprobar** o **Rechazar**. Al aprobar, se crea automáticamente un producto con stock inicial de una unidad y origen **Diseño Cliente**.
6. En **Laboratorio óptico**, selecciona una orden para consultar su fórmula e instrucciones de biselado. **Imprimir** abre el diálogo de impresión del navegador y el botón de estado avanza la orden.

### Técnico de laboratorio

1. Inicia sesión como administrador autorizado y abre **Laboratorio óptico** (`/admin/lab`).
2. Busca y selecciona la orden correcta. Antes de fabricar, verifica el cliente, la montura y los valores de esfera, cilindro, eje, adición y DIP contra la receta original.
3. Sigue las instrucciones de biselado de la ficha. Usa **Imprimir** si necesitas una copia física.
4. Cuando la orden avance, selecciona el botón de estado para pasar de pendiente a biselado y luego a lista para despacho.
5. Si un valor no coincide con la receta, no continúes con la fabricación: solicita que se revise la orden con el administrador o profesional óptico responsable.

### Si no puedes acceder o algo falla

- Si `/admin` te redirige a `/admin/login`, inicia sesión de nuevo. La sesión administrativa vence después de ocho horas.
- Si el probador o el medidor DIP no inicia, permite el acceso a la cámara y verifica tu conexión; MediaPipe descarga su modelo cuando se activa la función.
- Si el probador no reconoce el rostro, mejora la iluminación, centra la cara y mira al frente. Puedes seguir usando la tienda sin la cámara.
- Si los filtros no muestran resultados, quita uno o varios filtros o pulsa **Limpiar filtros**.

Los usuarios, productos y propuestas usan Route Handlers con datos mock en memoria. Los productos activos aparecen en inicio, tienda y ficha de producto. El inventario administrativo incluye también productos agotados; el stock se persiste en memoria mientras corre el proceso y vuelve a los datos de demostración al reiniciarlo. Las imágenes se conservan como datos en memoria; el tamaño total de imágenes por producto está limitado a 10 MB. Esta demostración no es una base de datos permanente ni un almacenamiento de archivos; para producción conecta una base de datos y un almacenamiento de imágenes, y reemplaza la confirmación de pago por las credenciales de Wompi/MercadoPago. La cámara requiere permiso del navegador y conexión para descargar el modelo de MediaPipe. La lectura OCR de la receta y los pagos son demostrativos; la fórmula puede ingresarse manualmente. La medición DIP usa el ancho estándar de una tarjeta bancaria como escala y es orientativa, no sustituye una medición óptica profesional.

## Comprobaciones

```bash
npm run typecheck
npm run build
```
