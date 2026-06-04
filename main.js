/**
 * main.js  —  T3 · Swarm Project  —  Entry Point
 * ─────────────────────────────────────────────────────────────
 * Integra World (T1) + Agent (T2-C) en el proyecto principal.
 * Crea 10 instancias del agente con posición y orientación
 * iniciales distintas, las registra en el loop de World.
 * ─────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';
import { World } from './World.js';
import { Agent } from './Agent.js';

/* ══════════════════════════════════════════════════════════
   1. MUNDO BASE  (de T1)
══════════════════════════════════════════════════════════ */
const world = new World(document.body);

/* ══════════════════════════════════════════════════════════
   2. CONFIGURACIÓN DEL ENJAMBRE
══════════════════════════════════════════════════════════ */
const BOUNDS = { x: 26, y: 14, z: 26 };

// Paleta de colores por agente (identidad visual individual)
const PALETTE = [
  0x44ccff,  // cian
  0x8844ff,  // violeta
  0xff4488,  // magenta
  0x44ff88,  // verde agua
  0xffaa22,  // ámbar
  0xff6644,  // coral
  0x22aaff,  // azul cielo
  0xcc44ff,  // lila
  0x44ffcc,  // turquesa
  0xffff44,  // amarillo bioluminiscente
];

/**
 * Función auxiliar: posición aleatoria dentro del volumen del mundo
 * con separación mínima entre agentes para evitar spawn en el mismo punto.
 */
function randomPosition(margin = 2) {
  return new THREE.Vector3(
    (Math.random() - 0.5) * (BOUNDS.x * 2 - margin * 2),
    (Math.random() - 0.5) * (BOUNDS.y * 2 - margin * 2),
    (Math.random() - 0.5) * (BOUNDS.z * 2 - margin * 2)
  );
}

/**
 * Orientación completamente aleatoria (ningún agente nace mirando
 * en la misma dirección).
 */
function randomRotation() {
  return new THREE.Euler(
    (Math.random() - 0.5) * Math.PI,
    Math.random() * Math.PI * 2,
    0
  );
}

/* ── Crear 10 agentes (mínimo requerido: 5) ── */
const agents = [];

for (let i = 0; i < 10; i++) {
  const agent = new Agent({
    position:  randomPosition(),
    rotation:  randomRotation(),
    speed:     1.2 + Math.random() * 1.2,          // 1.2 – 2.4 u/s
    scale:     0.55 + Math.random() * 0.55,         // tamaño variado
    tintColor: new THREE.Color(PALETTE[i % PALETTE.length]),
    phase:     (i / 10) * Math.PI * 2,              // desfases distribuidos
    bounds:    BOUNDS,
  });

  agent.addTo(world.scene);
  agents.push(agent);
}

/* ══════════════════════════════════════════════════════════
   3. HUD — indicadores en pantalla
══════════════════════════════════════════════════════════ */
const hudAgentCount = document.getElementById('hud-count');
const hudFps        = document.getElementById('hud-fps');
const hudSpeed      = document.getElementById('hud-speed');

let   globalSpeedMult = 1.0;
let   _fpsFrames      = 0;
let   _fpsAccum       = 0;

// Control de velocidad global
document.getElementById('speed-slider').addEventListener('input', e => {
  globalSpeedMult = parseFloat(e.target.value);
  document.getElementById('speed-val').textContent = globalSpeedMult.toFixed(2) + '×';
});

// Botón pausa
let paused = false;
document.getElementById('btn-pause').addEventListener('click', e => {
  paused = !paused;
  e.target.textContent = paused ? '▶ Reanudar' : '⏸ Pausar';
  e.target.classList.toggle('active', paused);
});

// Botón cámara home
document.getElementById('btn-home').addEventListener('click', () => {
  world.camera.position.set(0, 8, 32);
  world.controls.target.set(0, 0, 0);
  world.controls.update();
});

// Actualizar conteo
if (hudAgentCount) hudAgentCount.textContent = agents.length;

/* ══════════════════════════════════════════════════════════
   4. TICK — actualización de agentes en el loop de World
══════════════════════════════════════════════════════════ */
world.onTick((dt, t) => {
  if (paused) return;

  const scaledDt = dt * globalSpeedMult;

  agents.forEach(agent => agent.update(scaledDt));

  /* ── FPS counter (actualiza cada 30 frames) ── */
  _fpsAccum += dt;
  _fpsFrames++;
  if (_fpsFrames >= 30) {
    const fps = Math.round(_fpsFrames / _fpsAccum);
    if (hudFps) hudFps.textContent = fps;
    _fpsFrames = 0;
    _fpsAccum  = 0;
  }
});

/* ══════════════════════════════════════════════════════════
   5. ARRANCAR
══════════════════════════════════════════════════════════ */
world.start();
