'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const CATALOG_PASSWORD = 'REtellpwLG01'
const STORAGE_KEY = 'catalog_password_verified'

export function CatalogPasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isVerified, setIsVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEY) === 'true'
    }
    return false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === CATALOG_PASSWORD) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, 'true')
      }
      setIsVerified(true)
      setError('')
      setPassword('')
    } else {
      setError('Falsches Passwort. Bitte versuchen Sie es erneut.')
      setPassword('')
    }
  }

  if (isVerified) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Passwort erforderlich
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Bitte geben Sie das Passwort ein, um auf den Katalog zuzugreifen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Passwort eingeben"
              className="w-full"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
          >
            Zugriff erhalten
          </Button>
        </form>
      </Card>
    </div>
  )
}

