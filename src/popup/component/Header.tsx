import './header.css'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface HeaderProps {
  recordCount: number
}

export const Header: React.FC<HeaderProps> = ({ recordCount }: HeaderProps) => {
  const { t } = useTranslation()

  return (
        <header className="l-header">
            <h1 className="l-header-title">{t('Timeline')}</h1>
            <span id="l-header-available-count" className="l-header-available-count">
                {t('ActivityCount', { count: recordCount })}
            </span>
        </header>
  )
}
