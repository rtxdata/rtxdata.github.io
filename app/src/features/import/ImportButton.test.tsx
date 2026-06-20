import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ImportButton from './ImportButton'

describe('ImportButton', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('writes a picked .json file to localStorage and fires localStorageUpdate', async () => {
    const spy = vi.fn()
    window.addEventListener('localStorageUpdate', spy)

    const { container } = render(<ImportButton />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['{"transactions":{}}'], 'Raiff_x.json', { type: 'application/json' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(localStorage.getItem('Raiff_x.json')).toBe('{"transactions":{}}'))
    expect(spy).toHaveBeenCalled()
    window.removeEventListener('localStorageUpdate', spy)
  })

  it('renders the trigger label', () => {
    render(<ImportButton label="Импортировать файл" />)
    expect(screen.getByRole('button', { name: 'Импортировать файл' })).toBeInTheDocument()
  })
})
