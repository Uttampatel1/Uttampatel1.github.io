import { Component, lazy, Suspense, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { skillClusters, skills } from '../../content'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Cluster } from './SkillCloudScene'
import styles from './SkillCloud.module.css'

const SkillCloudScene = lazy(() => import('./SkillCloudScene'))

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// Signature 6: skills as a rotating, brain-shaped point cloud. The list beside it is the real,
// accessible content and the controls: hovering or focusing a cluster isolates it in 3D.
export function SkillCloud() {
  const clusters: Cluster[] = useMemo(
    () =>
      skillClusters.map((c) => ({
        id: c.id,
        label: c.label,
        color: c.color,
        items: [...skills.filter((g) => (c.groups as readonly string[]).includes(g.group)).flatMap((g) => g.items), ...c.extra],
      })),
    [],
  )
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const active = hover ?? pinned
  const stage = useRef<HTMLDivElement>(null)
  const near = useInView(stage, { rootMargin: '400px', once: true })
  const visible = useInView(stage)
  const reduce = useReducedMotion()

  const summary = clusters.map((c) => `${c.label}: ${c.items.join(', ')}`).join('. ')

  return (
    <div className={styles.layout}>
      <div ref={stage} className={styles.stage} role="img" aria-label={`Brain-shaped point cloud of skills in four clusters. ${summary}.`}>
        <div className={`mono ${styles.stageMeta}`} aria-hidden="true">
          <span>3D · POINT CLOUD</span>
          <span>{active ? `ISOLATED · ${clusters.find((c) => c.id === active)?.label.toUpperCase()}` : 'ALL CLUSTERS'}</span>
        </div>
        {near && (
          <GLBoundary>
            <Suspense fallback={<div className={`mono ${styles.loading}`}>Reconstructing volume…</div>}>
              <SkillCloudScene clusters={clusters} active={active} onHover={setHover} running={visible} reduce={reduce} />
            </Suspense>
          </GLBoundary>
        )}
      </div>

      <ul className={styles.clusters} data-stagger>
        {clusters.map((c) => (
          <li
            key={c.id}
            className={`${styles.cluster} ${active && active !== c.id ? styles.dim : ''}`}
            style={{ '--series': `var(--series-${c.color})` } as CSSProperties}
            onPointerEnter={() => setHover(c.id)}
            onPointerLeave={() => setHover(null)}
          >
            <button
              type="button"
              className={styles.clusterBtn}
              aria-pressed={pinned === c.id}
              onFocus={() => setHover(c.id)}
              onBlur={() => setHover(null)}
              onClick={() => setPinned((p) => (p === c.id ? null : c.id))}
            >
              <i aria-hidden="true" />
              <span>{c.label}</span>
              <span className={`mono ${styles.count}`}>
                n={String(c.items.length).padStart(2, '0')}
              </span>
            </button>
            <p className={styles.items}>{c.items.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
