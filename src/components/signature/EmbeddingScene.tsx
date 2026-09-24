// Lazy chunk: three.js + R3F + drei live only here.
// deep import keeps the rest of drei out of the chunk
import { Html } from '@react-three/drei/web/Html'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { skillClusters } from '../../data/skills'
import { categories } from '../../design/tokens'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { useTemperature } from '../../hooks/useTemperature'
import { centroids, neighbours, points } from './embedding'
import styles from './EmbeddingSpace.module.css'

type Props = {
  activeCluster: string | null
  activeSkill: string | null
  onSkill: (key: string | null) => void
  running: boolean
  reduce: boolean
}

const colorOf = (clusterId: string, theme: 'light' | 'dark') => {
  const c = skillClusters.find((s) => s.id === clusterId)!
  return categories[c.color][theme]
}

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

function Scene({ activeCluster, activeSkill, onSkill, reduce }: Omit<Props, 'running'>) {
  const tier = getDeviceTier()
  const { theme, t: temp } = useTemperature()
  const group = useRef<THREE.Group>(null)
  const meshes = useRef<Record<string, THREE.Mesh | null>>({})
  const noiseMat = useRef<THREE.PointsMaterial>(null)
  const fg = theme === 'dark' ? '#ECE8DF' : '#1B1A17'

  // background "unlabelled" points so the space reads as a dense embedding
  const noise = useMemo(() => {
    const r = rng(3)
    const n = tier.low ? 300 : 700
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) arr.set([(r() - 0.5) * 6, (r() - 0.5) * 4, (r() - 0.5) * 6], i * 3)
    return arr
  }, [tier.low])

  const nbrs = useMemo(() => (activeSkill ? neighbours(activeSkill) : []), [activeSkill])
  const nbrKeys = useMemo(() => new Set(nbrs.map((n) => n.point.key)), [nbrs])
  const lines = useMemo(() => {
    const p = points.find((q) => q.key === activeSkill)
    if (!p) return null
    return new Float32Array(nbrs.flatMap((n) => [...p.pos, ...n.point.pos]))
  }, [activeSkill, nbrs])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (group.current && !reduce) group.current.rotation.y += dt * (0.03 + temp * 0.06)
    const k = reduce ? 1 : Math.min(1, dt * 8)
    for (const p of points) {
      const m = meshes.current[p.key]
      if (!m) continue
      if (!reduce) m.position.set(p.pos[0], p.pos[1] + Math.sin(t * 0.6 + p.pos[0] * 3) * 0.035, p.pos[2])
      const mat = m.material as THREE.MeshBasicMaterial
      const target = activeCluster && activeCluster !== p.cluster ? 0.1 : activeSkill && p.key !== activeSkill && !nbrKeys.has(p.key) ? 0.35 : 1
      mat.opacity += (target - mat.opacity) * k
      const s = p.key === activeSkill ? 1.8 : nbrKeys.has(p.key) ? 1.35 : 1
      m.scale.setScalar(m.scale.x + (s - m.scale.x) * k)
    }
    if (noiseMat.current) noiseMat.current.opacity += ((activeCluster || activeSkill ? 0.06 : 0.22) - noiseMat.current.opacity) * k
  })

  return (
    <group ref={group} rotation={[0.2, 0.4, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[noise, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={noiseMat} size={0.014} color={fg} transparent opacity={0.22} depthWrite={false} />
      </points>

      {points.map((p) => (
        <mesh
          key={p.key}
          ref={(m) => void (meshes.current[p.key] = m)}
          position={p.pos}
          onPointerOver={(e) => {
            e.stopPropagation()
            onSkill(p.key)
          }}
          onPointerOut={() => onSkill(null)}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color={colorOf(p.cluster, theme)} transparent />
          {(p.key === activeSkill || nbrKeys.has(p.key)) && (
            <Html center distanceFactor={7} zIndexRange={[30, 0]} className={styles.pointLabel} style={{ pointerEvents: 'none' }}>
              <span data-strong={p.key === activeSkill || undefined}>{p.name}</span>
            </Html>
          )}
        </mesh>
      ))}

      {lines && (
        <lineSegments>
          <bufferGeometry key={activeSkill ?? undefined}>
            <bufferAttribute attach="attributes-position" args={[lines, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={fg} transparent opacity={0.55} />
        </lineSegments>
      )}

      {skillClusters.map((c) => {
        const [x, y, z] = centroids[c.id]
        const dim = activeCluster && activeCluster !== c.id
        return (
          <Html key={c.id} position={[x * 1.18, y * 1.18 + 0.42, z * 1.18]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <div className={styles.clusterLabel} style={{ color: categories[c.color][theme], opacity: dim ? 0.1 : 1 }}>
              {c.label}
            </div>
          </Html>
        )
      })}
    </group>
  )
}

// frameloop="demand" + an interval gives an exact fps cap; pausing off-screen is just stopping it.
function FrameCap({ running, fps, burst }: { running: boolean; fps: number; burst: unknown }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    // a short burst after a hover change so the fade still plays when the loop is paused
    const id = window.setInterval(() => invalidate(), 1000 / fps)
    const stop = window.setTimeout(() => clearInterval(id), 700)
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [burst, fps, invalidate])
  useEffect(() => {
    invalidate()
    if (!running) return
    const id = window.setInterval(() => invalidate(), 1000 / fps)
    return () => clearInterval(id)
  }, [running, fps, invalidate])
  return null
}

export default function EmbeddingScene(props: Props) {
  const tier = getDeviceTier()
  return (
    <Canvas
      className={styles.canvas}
      frameloop="demand"
      dpr={tier.low ? 1 : [1, 1.5]}
      camera={{ position: [0, 0.3, 6.2], fov: 40 }}
      gl={{ antialias: !tier.low, alpha: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <FrameCap running={props.running && !props.reduce} fps={tier.fps} burst={`${props.activeCluster}|${props.activeSkill}`} />
      <Scene activeCluster={props.activeCluster} activeSkill={props.activeSkill} onSkill={props.onSkill} reduce={props.reduce} />
    </Canvas>
  )
}
