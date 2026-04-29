import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import s from './Header.module.css'

export default function Header({ isDark, toggleTheme }) {
  const { setConfigModalOpen } = useApp()

  return (
    <header className={s.header}>
      {/* BUI logo — exact markup from BUI Brandline */}
      <div className={s.brand}>
        <div className={s.logoMark}>
          {['B','U','I'].map((l, i) => (
            <div key={l} className={s.logoLetterWrap}>
              <span className={s.logoLetter}>{l}</span>
              {i < 2 && <div className={s.logoPipe} />}
            </div>
          ))}
        </div>
        <div className={s.logoWords}>
          {['INNOVATION™','DELIVERY','RESULTS'].map(w => (
            <div key={w} className={s.logoWord}>{w}</div>
          ))}
        </div>
        <div className={s.divider} />
        <div className={s.titleWrap}>
          <div className={s.titleSub}>Microsoft Purview</div>
          <div className={s.title}>DEPLOYMENT SCRIPT GENERATOR</div>
        </div>
      </div>

      <div className={s.controls}>
        <span className={s.badge}>Microsoft Purview</span>
        <button
          className={`${s.hbtn} ${s.configBtn}`}
          onClick={() => setConfigModalOpen(true)}
        >
          ⚙ Config
        </button>
        <button className={s.hbtn} onClick={toggleTheme}>
          {isDark ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  )
}
