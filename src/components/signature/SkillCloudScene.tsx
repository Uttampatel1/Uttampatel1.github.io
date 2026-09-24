// Lazy chunk: three.js + R3F + drei live only here.
// deep import keeps the rest of drei out of the chunk
import { Html } from '@react-three/drei/web/Html'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { palette, series, type SeriesId } from '../../design/tokens'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { useWindowLevel } from '../../hooks/useWindowLevel'
import styles from './SkillCloud.module.css'

export type Cluster = { id: string; label: string; color: SeriesId; items: string[] }

type Props = {
  clusters: Cluster[]
  active: string | null
  onHover: (id: string | null) => void
  running: boolean
  reduce: boolean
}

// lobe anchors (x = left/right, y = up, z = front)
const ANCHORS: Record<string, [number, number, number]> = {
  mldl: [0.45, 0.3, 0.95],
  eng: [-0.55, 0.85, -0.15],
  imaging: [0.25, 0.05, -1.1],
}

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

// Points on (and just under) two hemispheres plus a cerebellum, with a gyral ripple.
function brainPoints(n: number) {
  const r = rng(42)
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1
    const th = r() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    let x = s * Math.cos(th)
    let y = u
    let z = s * Math.sin(th)
    const cereb = r() < 0.1
    const ripple = 1 + 0.05 * Math.sin(x * 9 + z * 7) * Math.sin(y * 11)
    const depth = 0.9 + r() * 0.1
    if (cereb) {
      pos.set([x * 0.75 * depth, -0.62 + y * 0.32 * depth, -0.75 + z * 0.45 * depth], i * 3)
      continue
    }
    const side = x >= 0 ? 1 : -1
    x = side * 0.06 + x * 0.78 * ripple * depth
    y = y * 0.78 * ripple * depth
    z = z * 1.18 * ripple * depth
    if (y < -0.35 && Math.abs(z) > 0.7) y = -0.35 + (y + 0.35) * 0.4 // flatten the base
    pos.set([x, y, z], i * 3)
  }
  return pos
}

function nodesFor(cluster: Cluster, seed: number) {
  const r = rng(seed)
  const [ax, ay, az] = ANCHORS[cluster.id] ?? [0, 0, 0]
  return cluster.items.map((name) => {
    const v = new THREE.Vector3(ax + (r() - 0.5) * 0.7, ay + (r() - 0.5) * 0.6, az + (r() - 0.5) * 0.7)
    // pull toward the cortical surface
    const surf = v.clone().normalize().multiply(new THREE.Vector3(0.84, 0.84, 1.24))
    v.lerp(surf, 0.55)
    return { name, pos: v }
  })
}

function Scene({ clusters, active, onHover, reduce }: Omit<Props, 'running'>) {
  const tier = getDeviceTier()
  const { film } = useWindowLevel()
  const group = useRef<THREE.Group>(null)
  const cloudMat = useRef<THREE.PointsMaterial>(null)
  const [hoverNode, setHoverNode] = useState<string | null>(null)
  const cloud = useMemo(() => brainPoints(tier.low ? 1400 : 3200), [tier.low])
  const nodes = useMemo(() => clusters.map((c, i) => ({ c, nodes: nodesFor(c, 7 + i * 13) })), [clusters])
  const matRefs = useRef<Record<string, THREE.MeshBasicMaterial[]>>({})
  const lineRefs = useRef<Record<string, THREE.LineBasicMaterial | null>>({})
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const fg = film === 'dark' ? palette.bone : '#1d1b17'

  useFrame((_, dt) => {
    if (group.current && !reduce) group.current.rotation.y += dt * 0.12
    const k = reduce ? 1 : Math.min(1, dt * 8)
    if (cloudMat.current) cloudMat.current.opacity += ((active ? 0.1 : 0.55) - cloudMat.current.opacity) * k
    for (const { c } of nodes) {
      const target = !active || active === c.id ? 1 : 0.1
      matRefs.current[c.id]?.forEach((m) => (m.opacity += (target - m.opacity) * k))
      const line = lineRefs.current[c.id]
      if (line) line.opacity += (target * 0.45 - line.opacity) * k
      const label = labelRefs.current[c.id]
      if (label) label.style.opacity = String(target)
    }
  })

  return (
    <group ref={group} rotation={[0.18, -0.6, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={cloudMat} size={0.018} color={fg} transparent opacity={0.55} depthWrite={false} sizeAttenuation />
      </points>

      {nodes.map(({ c, nodes: ns }) => {
        const color = series[c.color][film]
        const [ax, ay, az] = ANCHORS[c.id] ?? [0, 0, 0]
        const seg = new Float32Array(ns.flatMap((n) => [ax, ay, az, n.pos.x, n.pos.y, n.pos.z]))
        matRefs.current[c.id] = []
        return (
          <group key={c.id}>
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[seg, 3]} />
              </bufferGeometry>
              <lineBasicMaterial ref={(m) => void (lineRefs.current[c.id] = m)} color={color} transparent opacity={0.45} />
            </lineSegments>
            {ns.map((n) => (
              <mesh
                key={n.name}
                position={n.pos}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  onHover(c.id)
                  setHoverNode(`${c.id}:${n.name}`)
                }}
                onPointerOut={() => {
                  onHover(null)
                  setHoverNode(null)
                }}
              >
                <sphereGeometry args={[hoverNode === `${c.id}:${n.name}` ? 0.06 : 0.04, 12, 12]} />
                <meshBasicMaterial ref={(m) => void (m && matRefs.current[c.id].push(m))} color={color} transparent />
                {hoverNode === `${c.id}:${n.name}` && (
                  <Html center distanceFactor={6} className={styles.nodeLabel} zIndexRange={[30, 0]}>
                    {n.name}
                  </Html>
                )}
              </mesh>
            ))}
            <Html position={[ax * 1.25, ay * 1.25 + 0.15, az * 1.25]} center zIndexRange={[20, 0]}>
              <div ref={(el) => void (labelRefs.current[c.id] = el)} className={styles.clusterLabel} style={{ color }}>
                {c.label}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

// frameloop="demand" + an interval gives an exact fps cap, and pausing is just stopping the interval.
function FrameCap({ running, fps, burst }: { running: boolean; fps: number; burst: unknown }) {
  const invalidate = useThree((s) => s.invalidate)
  // a short burst of frames after a hover change, so the dim/isolate fade still plays when paused
  useEffect(() => {
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

export default function SkillCloudScene(props: Props) {
  const tier = getDeviceTier()
  return (
    <Canvas
      className={styles.canvas}
      frameloop="demand"
      dpr={tier.low ? 1 : [1, 1.5]}
      camera={{ position: [0, 0.4, 4.1], fov: 38 }}
      gl={{ antialias: !tier.low, alpha: true, powerPreference: 'low-power' }}
      aria-hidden="true"
    >
      <FrameCap running={props.running && !props.reduce} fps={tier.fps} burst={props.active} />
      <Scene clusters={props.clusters} active={props.active} onHover={props.onHover} reduce={props.reduce} />
    </Canvas>
  )
}
