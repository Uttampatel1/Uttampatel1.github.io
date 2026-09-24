import styles from './Todo.module.css'

// A clearly marked gap in the content. Visible in `npm run dev`, removed from production builds.
export function Todo({ children }: { children: React.ReactNode }) {
  if (!import.meta.env.DEV) return null
  return (
    <span className={styles.todo} role="note">
      TODO · {children}
    </span>
  )
}
