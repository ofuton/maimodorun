import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../../../src/popup/component/Header.tsx'
import '../i18n'

describe('src/popup/component/Header.tsx', () => {
  it('tests Header component', () => {
    render(<Header recordCount={1}/>)
    expect(screen.getByText('1個のアクティビティ')).toBeInTheDocument()

    render(<Header recordCount={2}/>)
    expect(screen.getByText('2個のアクティビティ')).toBeInTheDocument()
  })
})
