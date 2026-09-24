import { AnimatePresence, LazyMotion, m } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { projects } from '../../data/projects'
import { categories, categoryIds, ease, type CategoryId } from '../../design/tokens'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { refreshScroll } from '../../lib/scroll'
import { ModelCard } from '../signature/ModelCard'
import { Layer } from '../ui/Layer'
import styles from './Sections.module.css'

// layout animations need Framer's domMax bundle; it loads on demand, and until then the grid
// simply re-renders without animation
const features = () => import('../signature/motionFeatures').then((r) => r.default)

type Filter = 'all' | CategoryId
const INITIAL = 6

// featured first, then category order: the default "sort" of the dataset
const ordered = [...projects].sort(
  (a, b) => Number(!!b.featured) - Number(!!a.featured) || categoryIds.indexOf(a.category) - categoryIds.indexOf(b.category),
)

export function Work() {
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState(false)
  const reduce = useReducedMotion()

  // the command bar can route here with a category ("#work?cat=llm")
  useEffect(() => {
    const on = (e: Event) => {
      const cat = (e as CustomEvent<string>).detail as Filter
      if (cat === 'all' || cat in categories) setFilter(cat)
    }
    window.addEventListener('work-filter', on)
    return () => window.removeEventListener('work-filter', on)
  }, [])

  const rows = useMemo(() => (filter === 'all' ? ordered : ordered.filter((p) => p.category === filter)), [filter])
  const visible = filter === 'all' && !expanded ? rows.slice(0, INITIAL) : rows
  const query = filter === 'all' ? 'df.sort_values("featured")' : `df[df.category == "${filter}"]`

  const choose = (f: Filter) => {
    setFilter(f)
    setExpanded(false)
    refreshScroll()
  }

  return (
    <Layer
      id="work"
      meta={`tensor [${projects.length}, ${categoryIds.length}]`}
      aside={`${projects.length} models · ${categoryIds.length} classes`}
      title={
        <>
          Models <em>in production.</em>
        </>
      }
      lead="Every project is a model with a card. Hover one, or press Run inference, to read its stack, status and one real metric."
    >
      <div className={styles.filters} role="group" aria-label="Filter models by category">
        {(['all', ...categoryIds] as Filter[]).map((c) => (
          <button
            key={c}
            type="button"
            className={`mono ${styles.filter}`}
            aria-pressed={filter === c}
            onClick={() => choose(c)}
            style={c === 'all' ? undefined : ({ '--cat': `var(--cat-${c})` } as React.CSSProperties)}
          >
            {c !== 'all' && <i aria-hidden="true" />}
            {c === 'all' ? 'All' : categories[c].label}
            <span className={styles.count}>{c === 'all' ? projects.length : projects.filter((p) => p.category === c).length}</span>
          </button>
        ))}
      </div>
      <p className={`mono ${styles.query}`} aria-live="polite">
        <span aria-hidden="true">&gt;&gt;&gt; </span>
        {query} <span className="muted">→ {rows.length} rows</span>
      </p>

      <LazyMotion features={features} strict>
        <ul className={styles.models}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p) => (
              <m.li
                key={p.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
                transition={{ duration: 0.55, ease: ease.out, delay: reduce ? 0 : 0.02 * visible.indexOf(p) }}
              >
                <ModelCard project={p} index={projects.indexOf(p)} />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </LazyMotion>

      {filter === 'all' && rows.length > INITIAL && (
        <button
          type="button"
          className={`btn ${styles.more}`}
          onClick={() => {
            setExpanded((e) => !e)
            refreshScroll()
          }}
          aria-expanded={expanded}
        >
          {expanded ? 'Show fewer models' : `Load all ${rows.length} models`} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
      )}
    </Layer>
  )
}
