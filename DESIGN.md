---
name: Nordic Calorie & Macro Sanctuary
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#464742'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#767871'
  outline-variant: '#c6c7c0'
  surface-tint: '#5e5f5b'
  primary: '#020201'
  on-primary: '#ffffff'
  primary-container: '#1c1d1a'
  on-primary-container: '#858581'
  inverse-primary: '#c7c6c2'
  secondary: '#506354'
  on-secondary: '#ffffff'
  secondary-container: '#d0e5d2'
  on-secondary-container: '#546758'
  tertiary: '#040100'
  on-tertiary: '#ffffff'
  tertiary-container: '#291908'
  on-tertiary-container: '#998068'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2dd'
  primary-fixed-dim: '#c7c6c2'
  on-primary-fixed: '#1b1c19'
  on-primary-fixed-variant: '#464743'
  secondary-fixed: '#d3e8d5'
  secondary-fixed-dim: '#b7ccb9'
  on-secondary-fixed: '#0e1f13'
  on-secondary-fixed-variant: '#394b3d'
  tertiary-fixed: '#fcddc1'
  tertiary-fixed-dim: '#dfc1a6'
  on-tertiary-fixed: '#281807'
  on-tertiary-fixed-variant: '#57432e'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  numeral-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  margin: 1.5rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a disciplined Scandinavian architectural sensibility tailored for conscious nutritional tracking. Rather than treating nutrition as an obsessive, high-stress chore, the UI creates an atmosphere of serene intentionality, absolute clarity, and quiet luxury.

### Aesthetic Core
- **Scandinavian Minimalism:** Uncompromising dedication to reductive visual architecture. Every line, pixel, and typographic mark carries purpose. Clutter, decorative excess, and visual noise are eradicated.
- **Atmosphere & Tone:** Calm, composed, discerning, and effortless. Interfaces feel like a natural light-filled studio in Stockholm or Copenhagen—quiet stone, bleached oak, and crisp linen.
- **Emotional Intent:** Dismantle tracking anxiety. Replace red warning badges and aggressive gamification streaks with quiet reflection, balanced telemetry, and tactile poise.

## Colors

The color palette embraces Nordic mineral tones, combining carbon ink, warm whitewashed limestone, and an organic pine/sage accent.

- **Primary (`#1C1D1A` - Deep Carbon):** An ultra-dense, warm mineral black used for primary typography, authoritative numbers, and solid tactile primary buttons.
- **Secondary (`#4A5D4E` - Silent Pine / Faded Sage):** A restrained botanical green serving as the sole nutritional progress accent, active macro distribution indicator, and quiet positive confirmation.
- **Tertiary (`#C2A68C` - Nordic Sand / Warm Stone):** A subtle, warm mineral beige used for baseline micro-accents, caloric target indicators, and background macro proportion segments.
- **Neutral (`#F9F9F7` - Bleached Chalk):** The expansive canvas ground. Off-white with an imperceptible warm tint that prevents ocular fatigue and preserves tactile softness.

### Functional Roles & Nuance
- **Surface Elevation:** Background runs on `#F9F9F7`, card containers utilize `#FFFFFF`, and subtle recessed states rest on `#F2F2EE`.
- **Delicate Outlines:** Structural dividers and borders utilize a calibrated `rgba(28, 29, 26, 0.06)` to create ethereal separation without visual weight.
- **Text Hierarchies:** Primary labels rely on `#1C1D1A`, secondary data relies on a soft graphite `#6B6D66`, and placeholder metrics rest in `#A2A49D`.

## Typography

The typographical cadence balances the organic geometric grace of **Plus Jakarta Sans** for headlines and calorie counters with the pristine utilitarian legibility of **Inter** for descriptions and telemetry.

### Rules of Engagement
- **Tabular Numerals:** All calorie counts, gram weights, and nutritional metrics must employ tabular lining numbers (`font-variant-numeric: tabular-nums`) to ensure vertical alignment throughout logs.
- **Editorial Contrast:** Numeric totals are prioritized in light weights (`400`) at dramatic scales rather than heavy, blunt bold weights, allowing white space around the digits to create emphasis.
- **Label Hierarchy:** Category labels, macro identifiers (Protein, Carbs, Fat), and timestamp metadata use `label-caps` in uppercase styling with deliberate tracking (+0.06em) and subdued contrast.

## Layout & Spacing

A mobile-centric fluid grid anchored by ample architectural margins. The composition deliberately favors vertical breathing room over density, elevating daily food intake into an intentional journal rather than an overwhelming spreadsheet.

### Rhythm & Alignment
- **Margins & Safe Zones:** Mobile displays maintain a strict horizontal gutter and outer margin of `1.5rem` (24px). No content touches the outer screen boundary.
- **Vertical Air:** Major functional blocks (Macro rings/bars, meal cards, timeline feeds) are separated by `space-xl` (40px) of negative space.
- **Grid Structure:** Single-column stacked layouts on standard mobile viewpoints; adapts to a dual-column symmetrical card split on tablet/landscape views with `1rem` column gutters.

## Elevation & Depth

True to minimalist Scandinavian architecture, physical depth is articulated through surface layering, delicate borders, and low-opacity ambient glazes rather than synthetic drop shadows.

### Surface Strategy
- **Layering:** Level 0 (App Canvas) sits on `#F9F9F7`. Level 1 (Nutrition Cards, Floating Bar) rests on `#FFFFFF`. Level 2 (Nested food entries, input rows) resides on `#F5F5F1`.
- **Ethereal Line Work:** Outlines replace drop shadows. Cards feature a razor-sharp `1px solid rgba(28, 29, 26, 0.05)`. Under dark backgrounds or pressed states, borders transition to `rgba(28, 29, 26, 0.1)`.
- **Tactile Hover/Active State:** Interactive surface components utilize a micro-press scale (`scale(0.99)`) accompanied by an imperceptible ambient bleed: `0 4px 20px -2px rgba(28, 29, 26, 0.03)`.

## Shapes

The geometric framework applies clean, natural curvature that softens structured metric grids without devolving into childish or bubbly forms.

- **Primary Geometry:** Cards, log drawers, and module containers adhere to `rounded-lg` (16px / 1rem).
- **Interactive Controls:** Search bars, primary log triggers, and pill filters maintain soft continuous bounds at `rounded-xl` (24px / 1.5rem).
- **Macro Visualizers:** Segmented nutritional bars feature capped micro-radii (4px) to preserve precise data perception while maintaining harmonious softness.

## Components

### Buttons
- **Primary:** Solid `#1C1D1A` fill, `#FFFFFF` crisp text, 48px height, `rounded-xl`. High-contrast, completely flat without bevels or drop shadows.
- **Secondary / Ghost:** Transparent background with `1px solid rgba(28, 29, 26, 0.12)`, `#1C1D1A` text.
- **Quick-Add FAB:** An unobtrusive 52px floating circle in deep carbon `#1C1D1A` with a delicate sage or warm sand hover state.

### Calorie & Macro Visualizers
- **Macro Distribution Bar:** A whisper-thin (6px) horizontal partitioned strip. Unfilled baseline sits at `#EBECE8`; Protein is rendered in `#4A5D4E` (Silent Pine), Carbs in `#C2A68C` (Warm Stone), and Healthy Fats in a muted slate `#7C8077`.
- **Daily Target Ring:** Minimalist circular meter with 4px stroke width, floating freely without harsh track shadows.

### Cards & Meal Clusters
- **Meal Logs (Breakfast, Lunch, Dinner):** Pristine `#FFFFFF` surfaces bounded by a hairline `1px solid rgba(28, 29, 26, 0.05)`. Content padding is generous (`space-lg` / 24px).
- **List Items:** Individual food items within a meal card rely on 1px border dividers (`rgba(28, 29, 26, 0.03)`). Calories sit in `numeral-metric` at 18px, aligned right.

### Input Fields & Search
- **Search Bar:** Minimal `#FFFFFF` or `#F2F2EE` fill, no harsh borders, subtle placeholder text in `#A2A49D`.
- **Numeric Macro Adjuster:** Clean inline counter fields with zero chrome; digits expand responsively with immediate inline micro-labels ("g", "kcal").

### Chips & Filter Pills
- Unselected chips use `#FFFFFF` with a 1px border (`rgba(28, 29, 26, 0.07)`). Active chips transition quietly to `#1C1D1A` with `#F9F9F7` text.