'use client'

import React from 'react'
import { useToast } from '@/components/ui/toast'
import { COUNTRIES, countryNameByCode } from '@/lib/countries'
import type { CountryTranslation } from './types'

interface CountrySelectorProps {
  selectedCountry: string
  countryTranslations: Record<string, CountryTranslation>
  generalCountry: string
  isAdmin: boolean
  onCountryChange: (country: string) => void
  onAddCountry: (country: string) => void
  onRemoveCountry: (country: string) => void
}

export default function CountrySelector({
  selectedCountry,
  countryTranslations,
  generalCountry,
  isAdmin,
  onCountryChange,
  onAddCountry,
  onRemoveCountry
}: CountrySelectorProps) {
  const { addToast } = useToast()
  const defaultCountry = generalCountry || 'DE'

  const handleAddCountry = (newCountry: string) => {
    // Don't allow adding the default country as a translation
    if (newCountry === defaultCountry) {
      addToast({ type: 'error', message: 'Cannot add default country as translation' })
      return
    }
    
    // Don't allow adding if already exists
    if (countryTranslations[newCountry]) {
      addToast({ type: 'error', message: 'Translation for this country already exists' })
      return
    }
    
    onAddCountry(newCountry)
    addToast({ type: 'success', message: `${countryNameByCode(newCountry)} added` })
  }

  const handleRemoveCountry = async (country: string) => {
    await onRemoveCountry(country)
    addToast({ type: 'success', message: `${countryNameByCode(country)} removed` })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="text-sm font-medium text-gray-900 mb-3">Country-specific content</div>

      {/* Country bubbles */}
      <div className="mb-3 flex flex-wrap gap-2">
        {/* Default country */}
        {(() => {
          const isDefaultSelected = selectedCountry === defaultCountry
          return (
            <div 
              key={defaultCountry} 
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
                isDefaultSelected ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <button
                onClick={() => onCountryChange(defaultCountry)}
                type="button"
                title={countryNameByCode(defaultCountry)}
                className={`focus:outline-none ${isDefaultSelected ? 'text-white' : 'text-red-600'}`}
              >
                {countryNameByCode(defaultCountry)}
              </button>
            </div>
          )
        })()}
        
        {/* Translation countries */}
        {Object.keys(countryTranslations)
          .filter((code) => code !== defaultCountry)
          .map((code) => {
            const isSelected = selectedCountry === code
            return (
              <div 
                key={code} 
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  isSelected ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <button
                  onClick={() => onCountryChange(code)}
                  type="button"
                  title={countryNameByCode(code)}
                  className={`focus:outline-none ${isSelected ? 'text-white' : 'text-red-600'}`}
                >
                  {countryNameByCode(code)}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${countryNameByCode(code)}`}
                  className={`ml-1 rounded-full px-1.5 ${
                    isSelected ? 'text-white hover:bg-red-700' : 'text-red-600 hover:bg-gray-100'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveCountry(code)
                  }}
                >
                  ×
                </button>
              </div>
            )
          })}
      </div>

      {/* Country selection dropdown */}
      {!isAdmin && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Select country to add translation:
          </label>
          <select
            id="countryDropdown"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleAddCountry(e.target.value)
                e.target.value = '' // Reset dropdown
              }
            }}
            className="inline-block bg-white border-2 border-red-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer shadow-sm max-w-xs"
          >
            <option value="">Select country to add...</option>
            {COUNTRIES
              .filter((country) => {
                return country.code !== defaultCountry && !countryTranslations[country.code]
              })
              .map((country) => (
                <option key={country.code} value={country.code}>
                  {countryNameByCode(country.code)}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  )
}
