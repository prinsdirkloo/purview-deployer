import React from 'react'
import s from './Buttons.module.css'

export function BtnPrimary({ children, onClick, disabled, style }) {
  return <button className={s.primary} onClick={onClick} disabled={disabled} style={style}>{children}</button>
}
export function BtnSecondary({ children, onClick, style }) {
  return <button className={s.secondary} onClick={onClick} style={style}>{children}</button>
}
export function BtnSuccess({ children, onClick, disabled }) {
  return <button className={s.success} onClick={onClick} disabled={disabled}>{children}</button>
}
export function BtnDownload({ children, onClick, style }) {
  return <button className={s.download} onClick={onClick} style={style}>{children}</button>
}
