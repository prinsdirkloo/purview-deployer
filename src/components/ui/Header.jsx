import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import s from './Header.module.css'

export default function Header({ isDark, toggleTheme }) {
  const { setConfigModalOpen } = useApp()

  return (
    <header className={s.header}>
      <div className={s.brand}>
        <div className={s.logo}>
          B<span className={s.pipe}>|</span>U<span className={s.pipe}>|</span>I
        </div>
        <div className={s.titleWrap}>
          <div className={s.title}>Purview Deployment Script Generator</div>
          <div className={s.sub}>Innovation · Delivery · Results</div>
        </div>
      </div>
      <div className={s.controls}>
        <span className={s.badge}>Microsoft Purview</span>
        <button className={`${s.hbtn} ${s.configBtn}`} onClick={() => setConfigModalOpen(true)}>
          ⚙ Config
        </button>
        <button className={s.hbtn} onClick={toggleTheme}>
          {isDark ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  )
}
