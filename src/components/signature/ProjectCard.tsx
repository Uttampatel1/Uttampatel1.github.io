import type { Project } from '../../content'
import ServiceCanvas from '../sections/ServiceCanvas.jsx'
import styles from './ProjectCard.module.css'

// Each project gets its own live illustration (paused off-screen, a still frame under reduced
// motion). Quiet hover: a small lift, the hairline turning teal and the image easing in to 1.03.
export function ProjectCard({ project, index, themeKey }: { project: Project; index: number; themeKey: string }) {
  return (
    <li className={styles.card}>
      <figure className={styles.figure} aria-hidden="true">
        <ServiceCanvas kind={project.visual} theme={themeKey} className={styles.image} />
        <figcaption className={`mono ${styles.tag}`}>P-{String(index + 1).padStart(2, '0')}</figcaption>
      </figure>

      <div className={styles.text}>
        <p className={`mono ${styles.cat}`}>{project.category}</p>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.summary}>{project.summary}</p>
        <ul className={`mono ${styles.stack}`} aria-label="Tools used">
          {project.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div className={styles.stat}>
        {project.metric ? (
          <>
            <span className={`display ${styles.value}`}>{project.metric.value}</span>
            <span className={`mono ${styles.statLabel}`}>{project.metric.label}</span>
          </>
        ) : (
          <span className="mono muted">Stack · {project.stack.length} tools</span>
        )}
      </div>
    </li>
  )
}
