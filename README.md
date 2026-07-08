# Turiexpress — Landing Page

Landing page lista para desplegar en **Firebase Hosting**.

## Estructura del proyecto

```
turiexpress/
├── firebase.json          # Configuración de Firebase Hosting
├── .firebaserc            # Proyecto Firebase
├── README.md              # Este archivo
└── public/                # Carpeta pública (se sube a Firebase)
    ├── index.html         # Landing principal
    ├── 404.html           # Página de error 404
    ├── css/
    │   └── styles.css     # Estilos
    ├── js/
    │   └── main.js        # Interacciones y animaciones
    ├── images/            # Imágenes (placeholders)
    └── tours/
        ├── tour-1.html    # Paseo por el Río Piura y Fogata
        ├── tour-2.html    # Tour Nocturno en Catacaos
        ├── tour-3.html    # Ruta Gastronómica
        └── tour-4.html    # Glamping en Sechura
```

## Secciones de la landing

1. **Hero** — Eslogan "Escapa de la rutina. Vive Piura."
2. **¿Qué es Turiexpress?** — Servicio en 4 iconos.
3. **¿Por qué elegirnos?** — 4 beneficios.
4. **Nuestros Tours** — 4 tarjetas con CTA a páginas individuales.
5. **¿Qué incluye?** — Tabla resumen.
6. **Nuestra experiencia** — Estadísticas.
7. **Opiniones** — 3 testimonios.
8. **Preguntas frecuentes** — Acordeón.
9. **Reserva** — Formulario de contacto.
10. **Footer** — Logo, redes, contacto.

## Despliegue en Firebase

### 1. Instala Firebase CLI (si no lo tienes)

```bash
npm install -g firebase-tools
```

### 2. Inicia sesión

```bash
firebase login
```

### 3. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)

Crea el proyecto con el ID `turiexpress` (o el que prefieras) y **Hosting activado**.

### 4. Conecta este código al proyecto

```bash
cd turiexpress
firebase use --add
```

Selecciona el proyecto que acabas de crear.

### 5. Despliega

```bash
firebase deploy
```

Cuando termine, Firebase te dará una URL tipo:
`https://turiexpress.web.app`

## Personalización rápida

- **Colores** → variables CSS en `public/css/styles.css` (`--primary`, `--accent`, etc.)
- **Imágenes** → reemplaza los SVG de `public/images/` por fotos reales.
- **WhatsApp / correo** → datos en el footer (`public/index.html`) y en `js/main.js`.
- **Formulario** → actualmente muestra un mensaje de éxito. Para guardar reservas, conecta `js/main.js` a **Cloud Functions** o **Firestore**.

## Licencia

© Turiexpress — Todos los derechos reservados.
