# Enjambre Abismal — T3: Mundo 3D Autónomo

> Proyecto de gráficas 3D desarrollado con Three.js.  
> Integración de los entregables T1, T2 y T3 mediante una arquitectura modular basada en ES Modules.

---

## Integrantes

- Carlos Ricardo Perez Richards
- Iker Adán González Vega
- Vicente García Alfaro

---

## Demo

### GitHub Pages

https://rickypr2836.github.io/Seminario_Tecnologias_Inoformacion/

---

## Estructura del proyecto

```text
Seminario_Tecnologias_Inoformacion/
│
├── index.html
├── Agent.js
├── World.js
├── main.js
├── style.css
└── README.md
```

---

## Evidencia de cumplimiento

### T1 – Mundo 3D

Implementado en `World.js`.

- Renderer WebGL con sombras habilitadas.
- Cámara PerspectiveCamera.
- Sistema de iluminación con HemisphereLight y DirectionalLight.
- OrbitControls para navegación libre.
- Manejo dinámico de resize.
- Render loop mediante requestAnimationFrame.
- Entorno 3D con partículas y efectos ambientales.

### T2-C – Agente Jerárquico

Implementado en `Agent.js`.

- Modelo jerárquico basado en nodos.
- Campana bioluminiscente articulada.
- Seis tentáculos compuestos por múltiples segmentos.
- Animaciones procedurales utilizando funciones trigonométricas (`Math.sin`).
- Movimiento orgánico continuo.

### T3 – Enjambre Autónomo

Implementado en `main.js`.

- Integración completa de T1 y T2-C.
- Creación de 10 agentes autónomos.
- Posiciones iniciales aleatorias.
- Orientaciones iniciales aleatorias.
- Velocidades individuales para cada instancia.
- Movimiento autónomo en dirección local.
- Sistema wrap-around en los límites del mundo.
- Interacción mediante controles de usuario.

---

## Funcionalidades principales

- Simulación 3D interactiva en tiempo real.
- Enjambre de 10 agentes autónomos.
- Cámara orbital con zoom y desplazamiento.
- Control global de velocidad.
- Pausa y reanudación de la simulación.
- Redistribución dinámica de agentes.
- Interfaz HUD con métricas en tiempo real.

---

## Tecnologías utilizadas

- JavaScript ES6 Modules
- Three.js r165
- HTML5
- CSS3
- GitHub Pages

---

## Instrucciones de uso

1. Abrir la demo mediante GitHub Pages.
2. Utilizar el mouse para navegar por la escena.
3. Ajustar la velocidad mediante el control deslizante.
4. Utilizar los botones de pausa y dispersión para interactuar con el enjambre.

---

## Objetivo del proyecto

Desarrollar una simulación gráfica tridimensional que integre un entorno 3D, un agente articulado jerárquico y un sistema multiagente autónomo capaz de desplazarse e interactuar dentro de un espacio virtual, aplicando los conceptos vistos durante las entregas T1, T2 y T3.
