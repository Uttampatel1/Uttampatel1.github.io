import type { ReactNode } from 'react'
import { slice } from '../../design/tokens'
import styles from './Slice.module.css'

type Props = {
  id: string
  index: number // section number, shown as "03"
  sliceNo: number // position in the 128-slice "volume"
  title: ReactNode
  kicker: string // short mono label beside the index
  aside?: ReactNode // bottom-left micro label
  className?: string
  children: ReactNode
}

// Every section is one slice of the scan: hairline frame, DICOM-style corner labels,
// a ruler down the left edge and a scanline that sweeps it in (lib/scroll.ts).
export function Slice({ id, index, sliceNo, title, kicker, aside, className, children }: Props) {
  return (
    <section
      id={id}
      className={`${styles.slice} ${className ?? ''}`}
      aria-labelledby={`${id}-title`}
      data-slice
      tabIndex={-1}
    >
      <div className={`wrap ${styles.frame}`}>
        <div className={`mono ${styles.metaTop}`} aria-hidden="true">
          <span>
            <b className={styles.index}>{String(index).padStart(2, '0')}</b> — {kicker}
          </span>
          <span>{slice(sliceNo)}</span>
        </div>
        <span className={styles.ruler} aria-hidden="true" />
        <span className={styles.scanline} data-scanline aria-hidden="true" />
        <div className={styles.body} data-slice-body>
          <h2 id={`${id}-title`} className={`display ${styles.title}`}>
            {title}
          </h2>
          {children}
        </div>
        <div className={`mono ${styles.metaBottom}`} aria-hidden="true">
          <span>
            {aside ?? kicker}
          </span>
          <span>
            IDX {String(index).padStart(2, '0')}.{String(sliceNo).padStart(3, '0')}
          </span>
        </div>
      </div>
    </section>
  )
}
