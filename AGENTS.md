# AGENTS.md — Antojos del Campo

Actúa como Ingeniero Frontend Senior especializado en HTML, CSS, JavaScript y Responsive Design.

## Contexto del proyecto

Sitio web catálogo virtual para **"Antojos del Campo"**, negocio de productos lácteos, amasijos y mixes congelados artesanales de **San Pedro de los Milagros, Antioquia (Colombia)**. La frescura directa del campo, con pedidos por WhatsApp.

## Stack

- Sitio estático sin frameworks ni build steps.
- `index.html` — estructura completa.
- `css/styles.css` — todos los estilos (único archivo CSS).
- `assets/images/` — logo, fotos de productos y afiches de mixes (PNG locales).
- Fuentes: **Fredoka** (display) y **Quicksand** (cuerpo) vía Google Fonts.

## Paleta y estilo (NO modificar sin autorización)

- Verdes orgánicos: `#4a7c3f`, `#2d5a27`, `#7cb342`, `#a8d45a`
- Marrones tierra: `#8b6914`, `#6b4f3a`, `#a08060`
- Cremas: `#faf6ef`, `#f0e8d8`
- Acentos: `#e8b923` (maíz), `#e07a3a` (naranja)
- Estilo *farm-to-table* moderno con texturas sutiles, bordes redondeados (20px) y sombras suaves.

## Estructura de la página

1. **Héroe** — banner de paisaje con overlay, logo flotante animado, tagline y CTA "VER CATÁLOGO".
2. **Origen** — tarjeta destacada sobre San Pedro de los Milagros.
3. **Catálogo** (id="catalogo") con dos subsecciones:
   - **A. Clásicos del Campo** (8 productos): Quesitos, Cuajadas, Pandequesos, Almojábanas, Quesadillas de bocadillo, Quesadillas de arequipe, Mantequilla natural, Arepas de chocolo. Cada tarjeta tiene foto + descripción + precio (`$10.000` a `$16.000`) + enlace WhatsApp.
   - **B. Mixes Frescos e Instantáneos** (4 productos): Mix Verde, Mix Rojo, Mix Amarillo, Mix Naranja. Pack x 10 unidades (120 g c/u), precio $25.000. Cada tarjeta tiene el **afiche publicitario a la izquierda** (aspect-ratio 2:3) + bloque de texto a la derecha (badge, ingredientes, beneficios, sellos "Sin conservantes/agua/azúcar", precio y botón "Pedir ahora"). Bloque de preparación común debajo.
4. **Footer** — contacto WhatsApp, Instagram (@antojos.delcampo), teléfono 313 699 4356.
5. **Botón flotante de WhatsApp** — fijo abajo a la derecha con animación de pulso.

## Estado actual y cambios recientes

- Las imágenes de los mixes son **afiches publicitarios** con información crítica (precio, preparación, sellos). NO deben recortarse ni distorsionarse. Los PNG se editaron para tener exactamente **aspect-ratio 2:3** (padding transparente simétrico); el contenedor `.mix-card__visual` usa `aspect-ratio: 2/3` + `object-fit: cover`.
- **Lightbox (vista previa ampliada)**: al hacer click/tap sobre las imágenes de mixes y clásicos se abre un modal `.lightbox` con la imagen en grande. Cierra con click en fondo/imagen, botón × o tecla ESC. Congela el scroll de fondo.
- **Icono de lupa minimalista**: círculo *frosted glass* de 34px con lupa SVG de trazo fino (verde `#2d5a27`), semi-transparente (opacity 0.7), sutil y no invasivo.
- Fotos de los 8 clásicos son locales: `quesito.png`, `cuajada.png`, `pandequeso.png`, `almojabanas.png`, `quesadillas-bocadillo.png`, `quesadillas-arequipe.png`, `mantequilla.jpg`, `arepa-chocolo.jpg`.
- El logo actual es `assets/images/logonuevo.png` (fondo blanco exterior convertido a transparente con borde difuminado; los blancos internos del diseño se preservan), usado en el nav del héroe, héroe y footer con `border-radius: 50%`. El original `logonuevo.jpeg` se conserva como respaldo sin referenciar.
- Responsive: móvil (columnas apiladas) y escritorio (≥768px: tarjetas horizontales; mixes con imagen al 45% del ancho).

## Convenciones

- Metodología BEM (`product-card__image-wrap`, `mix-card__visual`, `lightbox__close`).
- Variables CSS en `:root` para colores, radios, sombras y transiciones.
- Sin dependencias JS; un solo `<script>` inline al final del body.
- Pedidos por WhatsApp: `http://wa.me/+573136994356?text=...`.
- No agregar comentarios en el código salvo que se pida.
- Respuestas y código en español.

## Reglas

1. No modifiques estructura general, paleta, tipografía ni textos existentes salvo petición explícita.
2. Mantén el código limpio y modular.
3. Todo cambio debe ser responsive (móvil y escritorio).
4. Verifica siempre el resultado antes de dar por terminado.
