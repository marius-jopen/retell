'use client'

import { useState } from 'react'
import { Select } from './select'

interface FilterBarProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string) => void
  onLanguageChange?: (language: string) => void
  onCountryChange?: (country: string) => void
  searchValue: string
  categoryValue: string
  languageValue?: string
  countryValue?: string
  categories: string[]
  languages?: string[]
  countries?: { code: string; name: string }[]
  resultCount: number
}

export function FilterBar({
  onSearchChange,
  onCategoryChange,
  onLanguageChange,
  onCountryChange,
  searchValue,
  categoryValue,
  languageValue = '',
  countryValue = '',
  categories,
  languages = [],
  countries = [],
  resultCount
}: FilterBarProps) {
  const hasActiveFilters = categoryValue || languageValue || countryValue

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 mb-6">
      {/* Single row layout */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 cursor-pointer min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Country Filter */}
        <div className="relative">
          <select
            value={countryValue}
            onChange={(e) => onCountryChange && onCountryChange(e.target.value)}
            className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 cursor-pointer min-w-[130px]"
          >
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              onCategoryChange('')
              if (onLanguageChange) onLanguageChange('')
              if (onCountryChange) onCountryChange('')
            }}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}

        {/* Results count */}
        <div className="bg-gray-100 rounded-lg px-3 py-2.5 whitespace-nowrap">
          <span className="text-sm font-medium text-gray-600">
            {resultCount} found
          </span>
        </div>
      </div>
    </div>
  )
} 