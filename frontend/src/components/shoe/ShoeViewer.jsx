import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './ShoeViewer.css'

// ─── Material properties per type ───────────────────────────────────────────
const MATERIAL_PROPS = {
  leather: { roughness: 0.35, metalness: 0.0,  envMapIntensity: 1.2 },
  mesh:    { roughness: 0.75, metalness: 0.0,  envMapIntensity: 0.5 },
  suede:   { roughness: 0.92, metalness: 0.0,  envMapIntensity: 0.3 },
  canvas:  { roughness: 0.80, metalness: 0.0,  envMapIntensity: 0.4 },
  patent:  { roughness: 0.05, metalness: 0.15, envMapIntensity: 2.0 },
  knit:    { roughness: 0.85, metalness: 0.0,  envMapIntensity: 0.4 },
}

// Helper to robustly parse hex strings (including shorthand format like #888 or #fff)
function parseHex(hexColor) {
  let clean = hexColor.replace('#', '')
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0
  const g = parseInt(clean.substring(2, 4), 16) || 0
  const b = parseInt(clean.substring(4, 6), 16) || 0
  return { r, g, b }
}

// ─── Build a procedural canvas texture ──────────────────────────────────────
function buildPatternTexture(pattern, hexColor) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  // Parse hex → rgb robustly
  const { r, g, b } = parseHex(hexColor)
  const rgbString = `rgb(${r},${g},${b})`
  const darker  = `rgb(${Math.max(0,r-40)},${Math.max(0,g-40)},${Math.max(0,b-40)})`
  const lighter = `rgb(${Math.min(255,r+50)},${Math.min(255,g+50)},${Math.min(255,b+50)})`

  ctx.fillStyle = rgbString
  ctx.fillRect(0, 0, size, size)

  switch (pattern) {
    case 'gradient': {
      const grad = ctx.createLinearGradient(0, 0, 0, size)
      grad.addColorStop(0, lighter)
      grad.addColorStop(1, darker)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, size, size)
      break
    }
    case 'stripe': {
      ctx.fillStyle = rgbString
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = darker
      for (let i = 0; i < size; i += 24) {
        ctx.fillRect(i, 0, 12, size)
      }
      break
    }
    case 'dots': {
      ctx.fillStyle = rgbString
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = darker
      const spacing = 20
      for (let y = 10; y < size; y += spacing) {
        for (let x = (Math.floor(y / spacing) % 2 === 0 ? 10 : 20); x < size; x += spacing) {
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break
    }
    case 'geo': {
      ctx.fillStyle = rgbString
      ctx.fillRect(0, 0, size, size)
      ctx.strokeStyle = darker
      ctx.lineWidth = 1.5
      const cell = 32
      for (let y = 0; y < size; y += cell) {
        for (let x = 0; x < size; x += cell) {
          ctx.beginPath()
          ctx.moveTo(x + cell / 2, y)
          ctx.lineTo(x + cell, y + cell / 2)
          ctx.lineTo(x + cell / 2, y + cell)
          ctx.lineTo(x, y + cell / 2)
          ctx.closePath()
          ctx.stroke()
        }
      }
      break
    }
    case 'camo': {
      ctx.fillStyle = rgbString
      ctx.fillRect(0, 0, size, size)
      const camoPalette = [darker, lighter, `rgba(${r},${g},${b},0.5)`]
      
      // Seeded random number generator for stability
      let seed = r + g * 31 + b * 17
      const lcgRandom = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296
        return seed / 4294967296
      }
      
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = camoPalette[Math.floor(lcgRandom() * camoPalette.length)]
        ctx.beginPath()
        const cx2 = Math.floor(lcgRandom() * size)
        const cy = Math.floor(lcgRandom() * size)
        const w = 20 + Math.floor(lcgRandom() * 40)
        const h = 10 + Math.floor(lcgRandom() * 20)
        ctx.ellipse(cx2, cy, w, h, lcgRandom() * 6, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    default: // solid — just the plain color
      break
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

// ─── Decide zone for a mesh ──────────────────────────────────────────────────
// Strategy: inspect mesh name first; then fall back to mesh index bucket
function getMeshZone(name, idx, total) {
  const n = name.toLowerCase()
  if (n.includes('lace') || n.includes('shoelace')) return 'lace'
  if (n.includes('sole') || n.includes('outsole'))  return 'sole'
  if (n.includes('midsole'))                         return 'sole'
  if (n.includes('tongue') || n.includes('collar'))  return 'tongue'
  if (n.includes('upper') || n.includes('body') || n.includes('vamp')) return 'upper'
  if (n.includes('heel') || n.includes('counter') || n.includes('logo') ||
      n.includes('badge') || n.includes('brand') || n.includes('swoosh') ||
      n.includes('trim') || n.includes('accent')) return 'accent'

  // Index-based fallback: distribute across zones
  const bucket = Math.floor((idx / Math.max(total, 1)) * 5)
  return ['upper', 'sole', 'accent', 'lace', 'tongue'][bucket] || 'upper'
}

export default function ShoeViewer({
  colorUpper  = '#F5F5F5',
  colorSole   = '#EFEFEF',
  colorAccent = '#E0E0E0',
  colorLace   = '#FFFFFF',
  colorTongue = '#F0F0F0',
  material    = 'leather',
  pattern     = 'solid',
  materials   = null,
  patterns    = null,
  size        = 'md',
  animated    = true,
  rotating    = false,
}) {
  const mountRef    = useRef(null)
  const sceneRef    = useRef(null)       // { scene, camera, renderer, controls, meshes, textures }
  const frameRef    = useRef(null)
  const startTimeRef = useRef(performance.now())
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Keep latest props in ref so the animation loop can read them without stale closures
  const propsRef = useRef({ colorUpper, colorSole, colorAccent, colorLace, colorTongue, material, pattern, materials, patterns })
  propsRef.current = { colorUpper, colorSole, colorAccent, colorLace, colorTongue, material, pattern, materials, patterns }

  // ── Apply colors + pattern + material to all meshes ──────────────────────
  const applyAll = useCallback(() => {
    if (!sceneRef.current) return
    const { meshes, textures } = sceneRef.current
    const { colorUpper: cU, colorSole: cS, colorAccent: cA, colorLace: cL, colorTongue: cT,
            material: mat, pattern: pat, materials: mats, patterns: pats } = propsRef.current

    const zoneColors = { upper: cU, sole: cS, accent: cA, lace: cL, tongue: cT }

    // Normalize materials mapping
    const zoneMaterials = typeof mats === 'object' && mats !== null ? {
      upper: mats.upper || mat,
      sole: mats.sole || mat,
      accent: mats.accent || mat,
      lace: mats.lace || mat,
      tongue: mats.tongue || mat
    } : {
      upper: mat, sole: mat, accent: mat, lace: mat, tongue: mat
    }

    // Normalize patterns mapping
    const zonePatterns = typeof pats === 'object' && pats !== null ? {
      upper: pats.upper || pat,
      sole: pats.sole || pat,
      accent: pats.accent || pat,
      lace: pats.lace || pat,
      tongue: pats.tongue || pat
    } : {
      upper: pat, sole: pat, accent: pat, lace: pat, tongue: pat
    }

    meshes.forEach((node) => {
      const m = node.material
      if (!m) return

      // Store pendingProps so they are available immediately when onBeforeCompile runs
      m.userData.pendingProps = {
        colorUpper: cU,
        colorSole: cS,
        colorAccent: cA,
        colorLace: cL,
        colorTongue: cT,
        zoneColors,
        zonePatterns,
        zoneMaterials
      }

      const uniforms = m.userData.shaderUniforms
      if (!uniforms) return

      // Update colors
      uniforms.uColorUpper.value.set(cU)
      uniforms.uColorSole.value.set(cS)
      uniforms.uColorAccent.value.set(cA)
      uniforms.uColorLace.value.set(cL)
      uniforms.uColorTongue.value.set(cT)

      // Update maps & properties
      const zones = ['upper', 'sole', 'accent', 'lace', 'tongue']
      zones.forEach(zone => {
        const hex = zoneColors[zone] || cU
        const zonePat = zonePatterns[zone] || 'solid'
        const zoneMat = zoneMaterials[zone] || 'leather'
        const matProps = MATERIAL_PROPS[zoneMat] || MATERIAL_PROPS.leather

        const capZone = zone.charAt(0).toUpperCase() + zone.slice(1)
        uniforms[`uRoughness${capZone}`].value = matProps.roughness
        uniforms[`uMetalness${capZone}`].value = matProps.metalness

        if (zonePat === 'solid') {
          uniforms[`uHasMap${capZone}`].value = 0.0
          uniforms[`uMap${capZone}`].value = null
        } else {
          const texKey = `${zonePat}|${hex}`
          if (!textures[texKey]) {
            textures[texKey] = buildPatternTexture(zonePat, hex)
          }
          uniforms[`uHasMap${capZone}`].value = 1.0
          uniforms[`uMap${capZone}`].value = textures[texKey]
        }
      })
      m.needsUpdate = true
    })
  }, [])

  // ── React to prop changes after initial mount ────────────────────────────
  useEffect(() => {
    applyAll()
  }, [colorUpper, colorSole, colorAccent, colorLace, colorTongue, material, pattern, materials, patterns, applyAll])

  // ── Setup Three.js scene (runs once) ─────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const w = container.clientWidth  || 300
    const h = container.clientHeight || 200

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100)
    camera.position.set(0, 1.2, 6)

    // Renderer (transparent background so CSS gradient shows)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping    = true
    controls.dampingFactor    = 0.06
    controls.minDistance      = 3
    controls.maxDistance      = 9
    controls.maxPolarAngle    = Math.PI / 2 + 0.15
    controls.target.set(0, 0, 0)

    // Lighting rig
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(4, 8, 5)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.8)
    fillLight.position.set(-5, 2, -4)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
    rimLight.position.set(0, 3, -6)
    scene.add(rimLight)

    const bottomBounce = new THREE.HemisphereLight(0xffffff, 0x888888, 0.5)
    scene.add(bottomBounce)

    // Store refs
    sceneRef.current = { scene, camera, renderer, controls, meshes: [], textures: {} }

    // Load model
    const loader = new GLTFLoader()
    loader.load(
      '/models/shoe.glb',
      (gltf) => {
        if (!sceneRef.current) return;
        const model = gltf.scene

        // Center + auto-scale
        const box = new THREE.Box3().setFromObject(model)
        const center = new THREE.Vector3()
        box.getCenter(center)
        model.position.sub(center)
        const sizeVec = new THREE.Vector3()
        box.getSize(sizeVec)
        const scale = 3.8 / Math.max(sizeVec.x, sizeVec.y, sizeVec.z)
        model.scale.setScalar(scale)

        scene.add(model)

        // Collect all meshes and inject custom compiled materials to prevent jagged split boundaries
        const meshes = []
        model.traverse(node => {
          if (node.isMesh) {
            const geom = node.geometry;
            if (geom && geom.attributes.position && geom.index) {
              geom.computeBoundingBox();
              const box = geom.boundingBox;
              const widthX = box.max.x - box.min.x;
              const height = box.max.y - box.min.y;
              const depthZ = box.max.z - box.min.z;
              
              node.castShadow = true;
              node.receiveShadow = true;
              
              // Clone the material to keep it independent
              const m = node.material.clone();
              node.material = m;

              // Inject the custom onBeforeCompile PBR zone shader!
              m.onBeforeCompile = (shader) => {
                m.userData.shaderUniforms = shader.uniforms;

                const pending = m.userData.pendingProps;

                // 1. Box dimensions uniforms
                shader.uniforms.uBoxMin = { value: new THREE.Vector3(box.min.x, box.min.y, box.min.z) };
                shader.uniforms.uBoxSize = { value: new THREE.Vector3(widthX, height, depthZ) };

                // 2. Color uniforms
                shader.uniforms.uColorUpper  = { value: new THREE.Color(pending ? pending.colorUpper : '#F5F5F5') };
                shader.uniforms.uColorSole   = { value: new THREE.Color(pending ? pending.colorSole : '#EFEFEF') };
                shader.uniforms.uColorAccent = { value: new THREE.Color(pending ? pending.colorAccent : '#E0E0E0') };
                shader.uniforms.uColorLace   = { value: new THREE.Color(pending ? pending.colorLace : '#FFFFFF') };
                shader.uniforms.uColorTongue = { value: new THREE.Color(pending ? pending.colorTongue : '#F0F0F0') };

                // 3. Roughness / Metalness helpers & uniforms
                const defaultProps = { roughness: 0.5, metalness: 0.0 };
                const getRough = (zone) => {
                  if (!pending) return defaultProps.roughness;
                  const zMat = pending.zoneMaterials[zone];
                  return (MATERIAL_PROPS[zMat] || MATERIAL_PROPS.leather).roughness;
                };
                const getMetal = (zone) => {
                  if (!pending) return defaultProps.metalness;
                  const zMat = pending.zoneMaterials[zone];
                  return (MATERIAL_PROPS[zMat] || MATERIAL_PROPS.leather).metalness;
                };

                shader.uniforms.uRoughnessUpper  = { value: getRough('upper') };
                shader.uniforms.uRoughnessSole   = { value: getRough('sole') };
                shader.uniforms.uRoughnessAccent = { value: getRough('accent') };
                shader.uniforms.uRoughnessLace   = { value: getRough('lace') };
                shader.uniforms.uRoughnessTongue = { value: getRough('tongue') };

                shader.uniforms.uMetalnessUpper  = { value: getMetal('upper') };
                shader.uniforms.uMetalnessSole   = { value: getMetal('sole') };
                shader.uniforms.uMetalnessAccent = { value: getMetal('accent') };
                shader.uniforms.uMetalnessLace   = { value: getMetal('lace') };
                shader.uniforms.uMetalnessTongue = { value: getMetal('tongue') };

                // 4. Map & HasMap helpers & uniforms
                const getMapAndHasMap = (zone) => {
                  if (!pending) return { map: null, hasMap: 0.0 };
                  const pat = pending.zonePatterns[zone];
                  if (pat === 'solid') return { map: null, hasMap: 0.0 };
                  const hex = pending.zoneColors[zone] || pending.colorUpper;
                  const texKey = `${pat}|${hex}`;
                  if (!textures[texKey]) {
                    textures[texKey] = buildPatternTexture(pat, hex);
                  }
                  return { map: textures[texKey], hasMap: 1.0 };
                };

                const mapUpper = getMapAndHasMap('upper');
                const mapSole = getMapAndHasMap('sole');
                const mapAccent = getMapAndHasMap('accent');
                const mapLace = getMapAndHasMap('lace');
                const mapTongue = getMapAndHasMap('tongue');

                shader.uniforms.uMapUpper  = { value: mapUpper.map };
                shader.uniforms.uMapSole   = { value: mapSole.map };
                shader.uniforms.uMapAccent = { value: mapAccent.map };
                shader.uniforms.uMapLace   = { value: mapLace.map };
                shader.uniforms.uMapTongue = { value: mapTongue.map };

                shader.uniforms.uHasMapUpper  = { value: mapUpper.hasMap };
                shader.uniforms.uHasMapSole   = { value: mapSole.hasMap };
                shader.uniforms.uHasMapAccent = { value: mapAccent.hasMap };
                shader.uniforms.uHasMapLace   = { value: mapLace.hasMap };
                shader.uniforms.uHasMapTongue = { value: mapTongue.hasMap };

                // Inject Vertex Shader code
                shader.vertexShader = shader.vertexShader.replace(
                  '#include <common>',
                  `#include <common>
                   #ifndef USE_UV
                     varying vec2 vUv;
                   #endif
                   varying vec3 vLocalPos;`
                );
                shader.vertexShader = shader.vertexShader.replace(
                  '#include <begin_vertex>',
                  `#include <begin_vertex>
                   #ifndef USE_UV
                     vUv = uv;
                   #endif
                   vLocalPos = position;`
                );

                // Inject Fragment Shader definitions
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <common>',
                  `#include <common>
                   #ifndef USE_UV
                     varying vec2 vUv;
                   #endif
                   varying vec3 vLocalPos;
                   uniform vec3 uBoxMin;
                   uniform vec3 uBoxSize;

                   uniform vec3 uColorUpper;
                   uniform vec3 uColorSole;
                   uniform vec3 uColorAccent;
                   uniform vec3 uColorLace;
                   uniform vec3 uColorTongue;

                   uniform sampler2D uMapUpper;
                   uniform sampler2D uMapSole;
                   uniform sampler2D uMapAccent;
                   uniform sampler2D uMapLace;
                   uniform sampler2D uMapTongue;

                   uniform float uHasMapUpper;
                   uniform float uHasMapSole;
                   uniform float uHasMapAccent;
                   uniform float uHasMapLace;
                   uniform float uHasMapTongue;

                   uniform float uRoughnessUpper;
                   uniform float uRoughnessSole;
                   uniform float uRoughnessAccent;
                   uniform float uRoughnessLace;
                   uniform float uRoughnessTongue;

                   uniform float uMetalnessUpper;
                   uniform float uMetalnessSole;
                   uniform float uMetalnessAccent;
                   uniform float uMetalnessLace;
                   uniform float uMetalnessTongue;`
                );

                // Inject Custom Zone Definition Helper
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <roughnessmap_pars_fragment>',
                  `#include <roughnessmap_pars_fragment>
                   int getZone(vec3 pos, vec3 bMin, vec3 bSize) {
                     vec3 local = (pos - bMin) / bSize;
                     float nx = local.x;
                     float ny = local.y;
                     float nz = local.z;
                     if (ny < 0.22) return 1;
                     if (nx < 0.15 && ny > 0.25) return 2;
                     if (nx > 0.38 && nx < 0.72 && ny > 0.40 && ny < 0.72 && nz > 0.42 && nz < 0.58) return 3;
                     if (nx > 0.25 && nx < 0.68 && ny > 0.35 && nz > 0.38 && nz < 0.62) return 4;
                     return 0;
                   }`
                );

                // Inject Roughness Factor override
                shader.fragmentShader = shader.fragmentShader.replace(
                  'float roughnessFactor = roughness;',
                  `int z = getZone(vLocalPos, uBoxMin, uBoxSize);
                   float roughnessFactor = (z == 1 ? uRoughnessSole : (z == 2 ? uRoughnessAccent : (z == 3 ? uRoughnessLace : (z == 4 ? uRoughnessTongue : uRoughnessUpper))));`
                );

                // Inject Metalness Factor override
                shader.fragmentShader = shader.fragmentShader.replace(
                  'float metalnessFactor = metalness;',
                  `int z = getZone(vLocalPos, uBoxMin, uBoxSize);
                   float metalnessFactor = (z == 1 ? uMetalnessSole : (z == 2 ? uMetalnessAccent : (z == 3 ? uMetalnessLace : (z == 4 ? uMetalnessTongue : uMetalnessUpper))));`
                );

                // Inject Color Fragment / Texture blend override
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <color_fragment>',
                  `#include <color_fragment>
                   int z2 = getZone(vLocalPos, uBoxMin, uBoxSize);
                   vec3 zColor = uColorUpper;
                   float hasMap = uHasMapUpper;
                   vec4 texColor = vec4(1.0);

                   if (z2 == 1) {
                     zColor = uColorSole;
                     hasMap = uHasMapSole;
                     if (hasMap > 0.5) texColor = texture2D(uMapSole, vUv);
                   } else if (z2 == 2) {
                     zColor = uColorAccent;
                     hasMap = uHasMapAccent;
                     if (hasMap > 0.5) texColor = texture2D(uMapAccent, vUv);
                   } else if (z2 == 3) {
                     zColor = uColorLace;
                     hasMap = uHasMapLace;
                     if (hasMap > 0.5) texColor = texture2D(uMapLace, vUv);
                   } else if (z2 == 4) {
                     zColor = uColorTongue;
                     hasMap = uHasMapTongue;
                     if (hasMap > 0.5) texColor = texture2D(uMapTongue, vUv);
                   } else {
                     if (hasMap > 0.5) texColor = texture2D(uMapUpper, vUv);
                   }

                   if (hasMap > 0.5) {
                     diffuseColor.rgb = texColor.rgb;
                   } else {
                     diffuseColor.rgb = zColor;
                   }`
                );
              };

              meshes.push(node);
            } else {
              node.castShadow = true;
              node.receiveShadow = true;
              meshes.push(node);
            }
          }
        })
        sceneRef.current.meshes = meshes
        sceneRef.current.model  = model

        // Apply initial white sneaker colors + current settings
        applyAll()
        setLoading(false)
      },
      undefined,
      (err) => {
        if (!sceneRef.current) return;
        console.error('GLB load error:', err)
        setError('Could not load 3D shoe model.')
        setLoading(false)
      }
    )

    // Resize handler
    const onResize = () => {
      if (!container) return
      const nw = container.clientWidth
      const nh = container.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      frameRef.current = requestAnimationFrame(animate)
      const t = (performance.now() - startTimeRef.current) * 0.001
      const model = sceneRef.current?.model
      if (model) {
        if (rotating) {
          model.rotation.y += 0.007
        } else if (animated) {
          model.rotation.y = Math.sin(t * 0.35) * 0.28
          model.position.y = Math.sin(t * 1.4)  * 0.07
        }
      }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frameRef.current)
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      scene.traverse(obj => {
        if (!obj.isMesh) return
        obj.geometry?.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach(m => {
          m?.map?.dispose()
          m?.dispose()
        })
      })
      // Dispose cached textures
      if (sceneRef.current?.textures) {
        Object.values(sceneRef.current.textures).forEach(t => t?.dispose())
      }
      renderer.dispose()
      sceneRef.current = null
    }
  }, [rotating, animated, applyAll])

  return (
    <div className={`shoe-viewer shoe-viewer--${size} ${animated ? 'shoe-viewer--animated' : ''} ${rotating ? 'shoe-viewer--rotating' : ''}`}>
      {loading && (
        <div className="shoe-viewer-loading">
          <div className="spinner" />
          <span>Loading 3D Model…</span>
        </div>
      )}
      {error && (
        <div className="shoe-viewer-error">⚠️ {error}</div>
      )}
      <div ref={mountRef} className="shoe-3d-canvas-container" />
      <div className="shoe-glow" style={{ background: `radial-gradient(ellipse, ${colorSole}33, transparent 70%)` }} />
    </div>
  )
}
