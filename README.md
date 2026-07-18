# AK820 Mechanical Keyboard Simulator & Tester

Simulador visual y auditivo del teclado mecánico AK820. Permite escribir con el teclado físico o hacer clic en las teclas virtuales para probar sonidos, efectos de retroiluminación RGB y estadísticas de escritura en tiempo real.

## Características

- **Teclado virtual interactivo** con diseño fiel al AK820 (TKL + numpad layout)
- **Sonidos de teclas** realistas (simple, espacio, enter, backspace)
- **Retroiluminación RGB** con 5 modos:
  - RGB Wave (arcoíris animado)
  - Reactive Pulse (responde al teclar)
  - Solid Cyan
  - Solid Magenta
  - Backlight Off
- **Soporte de teclado físico** con feedback visual sincronizado
- **Modo oscuro / claro** con transiciones suaves
- **Estadísticas en tiempo real**: WPM y contador de teclas
- **Consola de terminal** con texto monoespaciado
- **Controles de volumen** con slider y toggle de sonido
- **Indicadores LED** (Caps Lock, Win, OS)
- **Atajos de función** via teclas F1-F8
- **Toast notifications** para feedback de acciones

## Atajos de teclado (F-keys)

| Tecla | Acción |
|-------|--------|
| F1 | Alternar tema claro/oscuro |
| F2 | Bajar volumen |
| F3 | Subir volumen |
| F4 | Activar/desactivar sonido |
| F6 | Ciclar efecto de retroiluminación |
| F7 | Copiar texto al portapapeles |
| F8 | Limpiar texto y estadísticas |

## Estructura del proyecto

```
keyboard-ak820/
├── index.html
├── js/
│   └── index.js          # Lógica del simulador
├── scss/
│   ├── styles.scss       # Estilos fuente (SCSS)
│   └── styles.css        # CSS compilado
└── media/
    └── audio/
        ├── simple_key_sound_1.m4a
        ├── space_key_sound_1.m4a
        ├── enter_key_sound_1.m4a
        └── backspace_key_sound_1.m4a
```

## Uso

Abrir `index.html` en un navegador. No requiere servidor local ni dependencias.

## Tecnologías

- HTML5
- SCSS / CSS3 (variables CSS, flexbox, grid, animaciones)
- JavaScript vanilla (ES modules)
- [Tabler Icons](https://tabler.io/icons) (iconos)
