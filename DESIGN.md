---
name: Balanza — etiqueta y libro mayor
colors:
  desk: '#e7e6e0'
  sheet: '#faf9f5'
  sheet-2: '#f1f0ea'
  sheet-3: '#e9e8e1'
  ink: '#1a1c1b'
  muted: '#63655e'
  faint: '#9c9e96'
  signal: '#4a5d4e'
  signal-soft: '#e2e9e0'
  clay: '#9a5b3a'
  rule: 'rgba(26, 28, 27, 0.13)'
  rule-soft: 'rgba(26, 28, 27, 0.07)'
typography:
  hero:
    fontFamily: Archivo
    fontSize: clamp(44px, 13.5vw, 56px)
    fontWeight: '300'
    letterSpacing: -0.042em
    lineHeight: '0.92'
  title:
    fontFamily: Archivo
    fontSize: 26px
    fontWeight: '500'
    letterSpacing: -0.022em
  section:
    fontFamily: Archivo
    fontSize: 15px
    fontWeight: '600'
  body:
    fontFamily: Archivo
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.55'
  small:
    fontFamily: Archivo
    fontSize: 13px
  micro:
    fontFamily: Archivo
    fontSize: 12px
spacing:
  base: 4px
  pad: 22px
  row-v: 13px
  section-gap: 20px
radius:
  control: 10px
  sheet: 20px
  pill: 9999px
---

## Concepto

La app es un **diario de energía**: una etiqueta nutricional y un libro mayor. La
interfaz toma la gramática de la etiqueta (filetes finos, cifras tabulares alineadas
a la derecha, totales) en lugar del kit genérico de tarjetas. La calma no viene de
adornos, viene de la disciplina: un solo gesto memorable y todo lo demás en silencio.

## Principios

1. **Un solo gesto.** El balance del día es lo único que grita. Nada compite con él.
2. **Filetes, no sombras.** La profundidad la da el contraste lienzo/hoja, no el `box-shadow`.
3. **Sin etiquetas en mayúsculas.** Se acabaron los `LABEL-CAPS` repartidos por todas las tarjetas.
4. **El color es información.** El verde solo marca progreso; el arcilla solo marca exceso.
5. **Cifras tabulares siempre.** `font-variant-numeric: tabular-nums` en toda la app.
6. **Copys de interfaz.** Verbos llanos, frases cortas, sin disculpas ni adornos.

## Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--desk` | `#e7e6e0` | Mesa: solo detrás de la hoja, en escritorio |
| `--sheet` | `#faf9f5` | La hoja: fondo de toda la app |
| `--sheet-2` | `#f1f0ea` | Superficies hundidas: inputs, riel del segmentado |
| `--ink` | `#1a1c1b` | Texto principal, botón primario, indicador activo |
| `--muted` | `#63655e` | Texto secundario, etiquetas, unidades (5,7:1) |
| `--faint` | `#9c9e96` | Solo decorativo (puntos, encabezados de día, aria-hidden) |
| `--signal` | `#4a5d4e` | Progreso, confirmación, marca de opción activa |
| `--clay` | `#9a5b3a` | Exceso sobre la meta, borrado. Nunca rojo de alarma |
| `--rule` | `ink` 13 % | Filetes estructurales |
| `--rule-soft` | `ink` 7 % | Rieles, divisiones internas |

No existe modo oscuro. No se introducen colores fuera de esta tabla.

## Tipografía

Una sola familia: **Archivo** (300/400/500/600). Sin segunda fuente, sin serif decorativa.

- **Hero** — 300, `clamp(44px,13.5vw,56px)`, tracking `-0.042em`. El número es el diseño.
- **Título de vista** — 26 / 500 / `-0.022em`.
- **Encabezado de sección** — 15 / 600.
- **Cuerpo** — 15 / 400 / 1.55.
- **Micro** — 12 / 400, `--muted`. Nunca en mayúsculas, nunca con tracking amplio.

## Layout

- Hoja única de 440 px como máximo; en escritorio centrada sobre `--desk`, con borde
  de 1 px y radio 8. En móvil ocupa el viewport completo (`100dvh`).
- Márgenes laterales 22 px. Las secciones se separan con **filetes**, no con cajas.
- Numeración y datos siempre alineados a la derecha; nombres y etiquetas a la izquierda.
- Radios: 0 en filas y filetes, 10 px en controles, 20 px en hojas, círculo en steppers.

## Componentes

### Balance (hero)
Dos cifras enfrentadas sobre la misma línea base: consumido a la izquierda (21 px,
`--muted`), restante a la derecha (hero, `--ink`). Debajo, una regla de 2 px que **es**
el medidor de progreso, con la meta impresa encima en una pastilla del color de la hoja.
Si se supera la meta, el relleno y la cifra pasan a `--clay` y la leyenda dice
«por encima» con la diferencia.

### Franja semanal
Siete columnas con filetes verticales: letra del día, número y punto de estado
(relleno = meta alcanzada, contorno arcilla = sin alcanzar, contorno tenue = pendiente).
El día de hoy se marca con peso 600 y un subrayado de 2 px. No es interactiva: es un
resumen, y se anuncia como lista con `aria-label` por día.

### Libro mayor
Filas de 13 px de padding vertical separadas por filetes. La primera fila del diario es
siempre **Anotar comida**. Las ingestas muestran nombre a la izquierda y kcal a la
derecha; al abrirse, la descripción aparece con `grid-template-rows: 0fr → 1fr` y se
revela un botón «Eliminar ingesta» para teclado.

### Formularios
Lista de ajustes: etiqueta a la izquierda, control a la derecha, filete entre filas.
Sin tarjetas de 2×2. Steppers de 38 px con input de `4ch`; segmentados de 2 opciones;
listas de opción con marca de verificación en `--signal`. Validación en línea con
`role="status"` y el campo enfocado.

### Hojas modales
Bottom sheet con asa, esquinas de 20 px y arrastre desde la cabecera con traspaso de
velocidad. Se cierra con Escape, con el scrim o con un gesto de más de 96 px (o 0,55 px/ms).
El foco entra en el diálogo y vuelve al disparador al cerrar.

### Pestañas
Tres textos, sin iconos. Un tick de 18 × 2 px en `--ink` se desliza bajo la pestaña activa.

## Movimiento

- Un único momento orquestado: la regla del balance se dibuja al cargar (`scaleX` 0 → 1, 700 ms).
- Cambios de progreso: `width` 450 ms. Apertura de hoja: 320 ms. Tick de pestañas: 260 ms.
- Todo el movimiento sensible al gesto es interrumpible: el arrastre lee la posición
  actual y la nueva animación parte de ahí.
- `prefers-reduced-motion`: sin dibujo, sin escaneo, sin shimmer, transiciones a 0.
- `prefers-reduced-transparency`: pestañas y scrim opacos.
- `prefers-contrast: more`: filetes y textos secundarios reforzados.

## Accesibilidad

- Objetivos táctiles ≥ 38 px (steppers) y 44-48 px (filas y botones).
- Anillo de foco `2px` en `--ink` con 2 px de separación; inputs con anillo único.
- Diálogos con `role="dialog"`, `aria-modal`, trampa de foco, Escape y restauración.
- `role="progressbar"` con `aria-valuetext` («630 de 2220 kcal consumidas»).
- Región `aria-live` para «Ingesta guardada / eliminada».
- Nunca `user-scalable=no`.

## Voz

«Anotar comida», «Aún no hay nada anotado hoy.», «No se pudo leer la foto. Puedes
anotarlo a mano.», «240 de margen». Se describe lo que pasa; no se felicita ni se
regaña al usuario.

## Antipatrones (lo que se eliminó del diseño anterior)

- Tarjetas blancas idénticas con la misma sombra y el mismo radio para todo.
- Etiquetas `LABEL-CAPS` en cada bloque.
- Número grande + etiqueta pequeña + barra dentro de una tarjeta.
- Iconos Material Symbols y dos tipografías de relleno.
- Chips de estado «Completado / No completado» en rojo y gris.
