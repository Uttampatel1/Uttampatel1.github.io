import { Component, lazy, Suspense, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { skillClusters } from '../../data/skills'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { neighbours } from './embedding'
import styles from './EmbeddingSpace.module.css'

const EmbeddingScene = lazy(() => import('./EmbeddingScene'))

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// Signature 6: skills as points in a slowly drifting 3D embedding space. The list beside it is the
// real content and the keyboard/touch controls: a cluster button isolates that cluster (the rest
// dims to 10%), and focusing or hovering a skill draws lines to its nearest neighbours.
export function EmbeddingSpace() {
  const [hoverCluster, setHoverCluster] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const [skill, setSkill] = useState<string | null>(null)
  const activeCluster = hoverCluster ?? pinned
  const stage = useRef<HTMLDivElement>(null)
  const near = useInView(stage, { rootMargin: '400px', once: true })
  const visible = useInView(stage)
  const reduce = useReducedMotion()

  const nbrs = useMemo(() => (skill ? neighbours(skill) : []), [skill])
  const skillName = skill?.split(':')[1]
  const summary = skillClusters.map((c) => `${c.label}: ${c.items.join(', ')}`).join('. ')

  return (
    <div className={styles.layout}>
      <div
        ref={stage}
        className={styles.stage}
        role="img"
        aria-label={`A 3D embedding space of skills drifting slowly, grouped into ${skillClusters.length} clusters. ${summary}.`}
      >
        <div className={`mono ${styles.stageMeta}`} aria-hidden="true">
          <span>dim=3 · n={skillClusters.reduce((s, c) => s + c.items.length, 0)}</span>
          <span>
            {activeCluster
              ? `isolate(${skillClusters.find((c) => c.id === activeCluster)?.label})`
              : skill
                ? `knn("${skillName}", k=4)`
                : 'all clusters'}
          </span>
        </div>
        {near && (
          <GLBoundary>
            <Suspense fallback={<div className={`mono ${styles.loading}`}>projecting embeddings…</div>}>
              <EmbeddingScene activeCluster={activeCluster} activeSkill={skill} onSkill={setSkill} running={visible} reduce={reduce} />
            </Suspense>
          </GLBoundary>
        )}
        <p className={`mono ${styles.knn}`} aria-live="polite">
          {skill && nbrs.length > 0 && (
            <>
              nearest to {skillName}: {nbrs.map((n) => `${n.point.name} ${n.sim.toFixed(2)}`).join(' · ')}
            </>
          )}
        </p>
      </div>

      <ul className={styles.clusters}>
        {skillClusters.map((c) => (
          <li
            key={c.id}
            className={`${styles.cluster} ${activeCluster && activeCluster !== c.id ? styles.dim : ''}`}
            style={{ '--cat': `var(--cat-${c.color})` } as CSSProperties}
            onPointerEnter={() => setHoverCluster(c.id)}
            onPointerLeave={() => setHoverCluster(null)}
          >
            <button
              type="button"
              className={styles.clusterBtn}
              aria-pressed={pinned === c.id}
              onFocus={() => setHoverCluster(c.id)}
              onBlur={() => setHoverCluster(null)}
              onClick={() => setPinned((p) => (p === c.id ? null : c.id))}
            >
              <i aria-hidden="true" />
              <span>{c.label}</span>
              <span className={`mono ${styles.count}`}>n={String(c.items.length).padStart(2, '0')}</span>
            </button>
            <ul className={styles.items} aria-label={`${c.label} skills`}>
              {c.items.map((name) => {
                const key = `${c.id}:${name}`
                return (
                  <li key={key}>
                    <button
                      type="button"
                      className={`${styles.skill} ${skill === key ? styles.skillOn : ''}`}
                      onPointerEnter={() => setSkill(key)}
                      onPointerLeave={() => setSkill(null)}
                      onFocus={() => setSkill(key)}
                      onBlur={() => setSkill(null)}
                    >
                      {name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
