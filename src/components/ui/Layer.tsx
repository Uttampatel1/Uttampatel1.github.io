import type { ReactNode } from 'react'
import { layerLabel, type LayerId } from '../../design/tokens'
import { DataStreamWipe } from './DataStreamWipe'
import styles from './Layer.module.css'

type Props = {
  id: Exclude<LayerId, 'top'>
  title: ReactNode
  meta: string // top-right micro label, e.g. a tensor shape
  aside?: ReactNode // bottom-left micro label
  lead?: ReactNode
  className?: string
  children: ReactNode
}

// Every section is one layer of the forward pass: hairline frame, corner labels, and a
// data-stream wipe that sweeps the top rule in when the layer enters view.
export function Layer({ id, title, meta, aside, lead, className, children }: Props) {
  return (
    <section id={id} className={`${styles.layer} ${className ?? ''}`} aria-labelledby={`${id}-title`} data-layer={id} tabIndex={-1}>
      <div className={`wrap ${styles.frame}`}>
        <DataStreamWipe />
        <div className={`mono ${styles.metaTop}`} aria-hidden="true">
          <span className={styles.layerName}>{layerLabel(id)}</span>
          <span>{meta}</span>
        </div>
        <header className={styles.head}>
          <h2 id={`${id}-title`} className={`display ${styles.title}`}>
            {title}
          </h2>
          {lead && <div className={styles.lead}>{lead}</div>}
        </header>
        {children}
        <div className={`mono ${styles.metaBottom}`} aria-hidden="true">
          <span>{aside ?? '—'}</span>
          <span>→ forward</span>
        </div>
      </div>
    </section>
  )
}
