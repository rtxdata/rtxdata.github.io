import { useRef } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  variant?: 'default' | 'outline'
  label?: string
}

/**
 * Imports Raiffeisen/Wolt/Glovo `*.json` exports straight into localStorage
 * (the key must end in `.json` — that's what the loader scans for), then fires
 * the `localStorageUpdate` event the DataProvider listens on. The file is read
 * locally in the browser; nothing is uploaded.
 */
export default function ImportButton({ variant = 'default', label = 'Загрузить файл' }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    for (const f of files) {
      const key = f.name.endsWith('.json') ? f.name : `${f.name}.json`
      localStorage.setItem(key, await f.text())
    }
    if (files.length > 0) window.dispatchEvent(new Event('localStorageUpdate'))
    if (ref.current) ref.current.value = '' // allow re-importing the same filename
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept=".json,application/json"
        multiple
        className="hidden"
        onChange={onChange}
      />
      <Button variant={variant} onClick={() => ref.current?.click()}>
        {label}
      </Button>
    </>
  )
}
