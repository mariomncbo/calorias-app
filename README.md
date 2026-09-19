# Calorias App

Aplicación web para el seguimiento de calorías diarias (con IA integrada).

[web](https://glowing-moxie-b07325.netlify.app)

## Funciones
- IA integrada que calcula las kcal de una imagen que le pases
- Registro de ingesta diaria de alimentos (kcal)
- Visualización del progreso hacia el objetivo calórico diario
- Historial de días anteriores
- Configuración de objetivo
- Todos los datos se guardan en `localStorage` del navegador, sin backend.
- PWA instalable

## Tecnologías

- HTML, CSS y JavaScript vanilla (sin frameworks)
- PWA con `manifest.json` e icono
- Despliegue estático en Netlify

## Uso local

La aplicación es 100% estática, así que basta con servir el directorio raíz:

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000`.

## Despliegue

Conecta el repositorio a Netlify. No requiere build; se publica el directorio raíz tal cual.
