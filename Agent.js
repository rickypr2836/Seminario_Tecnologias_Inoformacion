/**
 * Agent.js  —  T3 · Swarm Project
 * ─────────────────────────────────────────────────────────────
 * Criatura bioluminiscente autónoma derivada del trabajo T2-C.
 * Jerarquía:
 *   root (Group) → bell (cuerpo pulsante)
 *                → 6 tentáculos × 3 segmentos
 *
 * Cada instancia tiene:
 *   • Posición y orientación inicial distintas (pasadas al constructor)
 *   • Velocidad y fase de animación aleatorias
 *   • Movimiento autónomo: avanza en su dirección local + giro suave
 *   • Wrap-around al cruzar los límites del mundo
 * ─────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';

/* ─── Materiales compartidos entre instancias (optimización de memoria) ──── */
const MAT_BELL = new THREE.MeshPhongMaterial({
  color: 0x66aacc, emissive: 0x112233,
  shininess: 90, transparent: true, opacity: 0.78,
  side: THREE.DoubleSide,
});
const MAT_RIM = new THREE.MeshPhongMaterial({
  color: 0x44ccff, emissive: 0x002244,
  shininess: 120, transparent: true, opacity: 0.65,
});
const MAT_TENT_BASE = new THREE.MeshPhongMaterial({
  color: 0x8844cc, emissive: 0x220044,
  shininess: 80, transparent: true, opacity: 0.72,
});
const MAT_TENT_MID = new THREE.MeshPhongMaterial({
  color: 0x44aaee, emissive: 0x001122,
  shininess: 100, transparent: true, opacity: 0.60,
});
const MAT_TENT_TIP = new THREE.MeshPhongMaterial({
  color: 0xaaddff, emissive: 0x003344,
  shininess: 140, transparent: true, opacity: 0.45,
});

/* ─── Geometrías compartidas ─────────────────────────────────────────────── */
const GEO_BELL       = new THREE.SphereGeometry(1, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
const GEO_RIM        = new THREE.TorusGeometry(1, 0.08, 12, 60);
const GEO_TENT_BASE  = new THREE.CylinderGeometry(0.055, 0.04, 0.9, 6);
const GEO_TENT_MID   = new THREE.CylinderGeometry(0.04, 0.028, 1.0, 6);
const GEO_TENT_TIP   = new THREE.CylinderGeometry(0.028, 0.008, 1.1, 6);
const GEO_NEMA       = new THREE.SphereGeometry(0.045, 6, 6);

const NUM_TENTACLES = 6;

export class Agent {
  /**
   * @param {object} opts
   * @param {THREE.Vector3}  opts.position   - posición inicial
   * @param {THREE.Euler}    opts.rotation   - orientación inicial
   * @param {number}         opts.speed      - velocidad de traslación (unidades/s)
   * @param {number}         opts.scale      - escala visual del agente
   * @param {THREE.Color}    opts.tintColor  - tinte de color individual
   * @param {number}         opts.phase      - desfase de animación inicial
   * @param {object}         opts.bounds     - { x, y, z } radio del mundo
   */
  constructor({
    position  = new THREE.Vector3(),
    rotation  = new THREE.Euler(),
    speed     = 1.5,
    scale     = 1.0,
    tintColor = null,
    phase     = 0,
    bounds    = { x: 25, y: 15, z: 25 },
  } = {}) {

    /* ── Estado de movimiento ── */
    this.speed   = speed;
    this.bounds  = bounds;
    this.phase   = phase;
    this.alive   = true;

    /* Velocidad de giro aleatoria (wander suave) */
    this.turnSpeedY = (Math.random() - 0.5) * 0.6;   // rad/s
    this.turnSpeedX = (Math.random() - 0.5) * 0.25;

    /* Vector forward en espacio local (Three.js usa -Z como forward) */
    this._forward = new THREE.Vector3();
    this._worldPos = new THREE.Vector3();

    /* ── Construcción del grafo de escena ── */
    this.root = new THREE.Group();
    this.root.position.copy(position);
    this.root.rotation.copy(rotation);
    this.root.scale.setScalar(scale);

    this._buildBody(tintColor);

    /* Tiempo acumulado propio (para animación) */
    this._t = phase;
  }

  /* ─────────────────────────────────────────────────────────
     CONSTRUCCIÓN JERÁRQUICA
  ───────────────────────────────────────────────────────── */
  _buildBody(tintColor) {
    /* Material personalizado por instancia si hay tinte */
    const bellMat = tintColor
      ? MAT_BELL.clone()
      : MAT_BELL;
    if (tintColor) {
      bellMat.color.set(tintColor);
      bellMat.emissive.set(tintColor).multiplyScalar(0.15);
    }

    /* ── Campana ── */
    this._bellGroup = new THREE.Group();
    this.root.add(this._bellGroup);

    const bellMesh = new THREE.Mesh(GEO_BELL, bellMat);
    bellMesh.rotation.x = Math.PI;   // abre hacia abajo
    this._bellGroup.add(bellMesh);

    const rimMesh = new THREE.Mesh(GEO_RIM, MAT_RIM);
    rimMesh.position.y = -0.04;
    this._bellGroup.add(rimMesh);

    /* Luz de emisión interior (cada agente lleva su propia luz pequeña) */
    this._glow = new THREE.PointLight(
      tintColor ? tintColor : 0x44ccff,
      0.6,
      4
    );
    this._bellGroup.add(this._glow);

    /* ── Tentáculos ── */
    this._tentacles = [];
    for (let i = 0; i < NUM_TENTACLES; i++) {
      const angle = (i / NUM_TENTACLES) * Math.PI * 2;
      const r     = 0.92;

      /* Nodo 1 – base */
      const baseGroup = new THREE.Group();
      baseGroup.position.set(Math.cos(angle) * r, -0.05, Math.sin(angle) * r);
      baseGroup.rotation.y = angle;
      baseGroup.rotation.z = 0.22;
      this._bellGroup.add(baseGroup);

      const baseMesh = new THREE.Mesh(GEO_TENT_BASE, MAT_TENT_BASE);
      baseMesh.position.y = -0.45;
      baseGroup.add(baseMesh);

      /* Nodo 2 – medio */
      const midGroup = new THREE.Group();
      midGroup.position.y = -0.9;
      baseGroup.add(midGroup);

      const midMesh = new THREE.Mesh(GEO_TENT_MID, MAT_TENT_MID);
      midMesh.position.y = -0.5;
      midGroup.add(midMesh);

      /* Nodo 3 – punta */
      const tipGroup = new THREE.Group();
      tipGroup.position.y = -1.0;
      midGroup.add(tipGroup);

      const tipMesh = new THREE.Mesh(GEO_TENT_TIP, MAT_TENT_TIP);
      tipMesh.position.y = -0.55;
      tipGroup.add(tipMesh);

      /* Nematocisto (punto brillante en la punta) */
      const nemaMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: tintColor ? tintColor : 0x44ccff,
        emissiveIntensity: 1.0,
        transparent: true, opacity: 0.9,
      });
      const nema = new THREE.Mesh(GEO_NEMA, nemaMat);
      nema.position.y = -1.15;
      tipGroup.add(nema);

      this._tentacles.push({
        baseGroup, midGroup, tipGroup,
        phase: (i / NUM_TENTACLES) * Math.PI * 2,  // desfase único por tentáculo
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     UPDATE — llamado cada frame desde main.js
     @param {number} dt  delta time en segundos
  ───────────────────────────────────────────────────────── */
  update(dt) {
    this._t += dt;
    const t = this._t;

    /* ── 1. Animación del cuerpo (pulsación + tentáculos) ── */
    const pulse = 1 + Math.sin(t * 2.4) * 0.09;
    this._bellGroup.scale.set(
      1 + Math.sin(t * 2.4) * 0.03,
      pulse,
      1 + Math.sin(t * 2.4) * 0.03
    );

    this._tentacles.forEach(({ baseGroup, midGroup, tipGroup, phase }) => {
      baseGroup.rotation.x  = Math.sin(t * 1.8 + phase)           * 0.3;
      baseGroup.rotation.z += (Math.sin(t * 1.4 + phase + 1.0) * 0.18 - baseGroup.rotation.z) * 0.12;
      midGroup.rotation.x   = Math.sin(t * 2.2 + phase + 0.8)     * 0.5;
      midGroup.rotation.z   = Math.cos(t * 1.8 + phase + 0.5)     * 0.28;
      tipGroup.rotation.x   = Math.sin(t * 2.8 + phase + 1.6)     * 0.7;
      tipGroup.rotation.z   = Math.cos(t * 2.4 + phase + 1.2)     * 0.4;
    });

    /* Parpadeo del glow interior */
    this._glow.intensity = 0.5 + Math.sin(t * 2.4) * 0.3;

    /* ── 2. Giro autónomo (wander suave) ── */
    // Varía la dirección de giro lentamente usando sin para suavidad
    const yawDelta   = this.turnSpeedY * Math.sin(t * 0.3) * dt;
    const pitchDelta = this.turnSpeedX * Math.sin(t * 0.25 + 1.0) * dt;
    this.root.rotation.y += yawDelta;
    this.root.rotation.x  = Math.max(-0.5, Math.min(0.5,
      this.root.rotation.x + pitchDelta
    ));

    /* ── 3. Movimiento hacia adelante en espacio local ── */
    // En Three.js el eje -Z es "forward" por defecto
    this._forward.set(0, 0, -1)
      .applyQuaternion(this.root.quaternion)
      .multiplyScalar(this.speed * dt);

    this.root.position.add(this._forward);

    /* ── 4. Wrap-around en los límites del mundo ── */
    const p = this.root.position;
    const b = this.bounds;
    if (p.x >  b.x) p.x = -b.x;
    if (p.x < -b.x) p.x =  b.x;
    if (p.y >  b.y) p.y = -b.y;
    if (p.y < -b.y) p.y =  b.y;
    if (p.z >  b.z) p.z = -b.z;
    if (p.z < -b.z) p.z =  b.z;
  }

  /* Añadir el agente a una escena Three.js */
  addTo(scene) {
    scene.add(this.root);
    return this;
  }

  /* Remover de la escena */
  removeFrom(scene) {
    scene.remove(this.root);
  }

  /* Posición actual (lectura) */
  get position() {
    return this.root.position;
  }
}
