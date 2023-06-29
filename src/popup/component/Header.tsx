import './header.css'
import React from 'react'

interface HeaderProps {
  recordCount: number
}

export const Header: React.FC<HeaderProps> = ({ recordCount }: HeaderProps) => {
  return (
        <header className="l-header">
            <h1 className="l-header-title">タイムライン</h1>
            <span id="l-header-available-count" className="l-header-available-count">
                {recordCount}個のアクティビティ
            </span>
        </header>
  )
}
