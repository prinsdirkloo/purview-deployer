import React from 'react'
import { useApp } from '../../context/AppContext.jsx'
import ls from '../steps/labels/Labels.module.css'
import s from './Header.module.css'

export default function Header({ isDark, toggleTheme, activeTrack, setActiveTrack }) {
  const { setConfigModalOpen } = useApp()

  return (
    <header className={s.header}>
      {/* BUI logo */}
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

      {/* Track switcher — grid column 2, naturally centred */}
      <div className={ls.trackSwitcher}>
        <button
          className={[ls.trackBtn, activeTrack === 'dlp' && ls.trackBtnActive].filter(Boolean).join(' ')}
          onClick={() => setActiveTrack('dlp')}
        >
          Custom SIT &amp; DLP Deployment
        </button>
        <button
          className={[ls.trackBtn, activeTrack === 'labels' && ls.trackBtnActive].filter(Boolean).join(' ')}
          onClick={() => setActiveTrack('labels')}
        >
          Sensitivity Labels
        </button>
      </div>

      {/* Controls — grid column 3, aligned right */}
      <div className={s.controls} style={{ justifySelf: 'end' }}>
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
