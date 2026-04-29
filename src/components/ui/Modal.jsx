import React, { useEffect } from 'react'
import s from './Modal.module.css'

export default function Modal({ open, onClose, title, children, footer, wide }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={s.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={[s.modal, wide && s.wide].filter(Boolean).join(' ')}>
        <div className={s.header}>
          <span className={s.title}>{title}</span>
          <button className={s.close} onClick={onClose}>✕</button>
        </div>
        <div className={s.body}>{children}</div>
        {footer && <div className={s.footer}>{footer}</div>}
      </div>
    </div>
  )
}
