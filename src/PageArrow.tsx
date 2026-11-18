import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const VisiblePage = createContext(false)
export function PageArrowScope({ active, children }: { active: boolean; children: ReactNode }) {
  return <VisiblePage.Provider value={active}>{children}</VisiblePage.Provider>
}
export function PageArrow({ direction, label, onClick }: {
  direction: 'previous' | 'next'; label: string; onClick: () => void
}) {
  const visible = useContext(VisiblePage)
  if (!visible) return null
  // Outside chapter transforms and scrolling containers: always anchored to the window.
  return createPortal(<button type="button" className={`album-page-arrow album-page-arrow-${direction}`} aria-label={label} onClick={onClick}>
    <svg className="album-page-arrow-icon" width="38" height="26" viewBox="0 0 44 28" fill="none" aria-hidden="true" focusable="false">
      <path d="M5 14.2C15.4 13.5 26.2 14.6 38 13.8M29 5.7C31.7 8.6 34.8 11.1 38 13.8C34.8 16.6 31.7 19.3 28.7 22.1" />
    </svg>
  </button>, document.body)
}
