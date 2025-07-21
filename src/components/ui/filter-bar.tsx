'use client'

import { useState } from 'react'
import { Input } from './input'
import { Select } from './select'

interface FilterBarProps {
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string) => void
  onLanguageChange: (language: string) => void
  searchValue: string
  categoryValue: string
  languageValue: string
  categories: string[]
  languages: string[]
  resultCount: number
}

export function FilterBar({
  onSearchChange,
  onCategoryChange,
  onLanguageChange,
  searchValue,
  categoryValue,
  languageValue,
  categories,
  languages,
  resultCount
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = categoryValue || languageValue

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 pl-10 transition-all"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors relative"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Clear filters - only show when filters are active */}
      {hasActiveFilters && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => {
              onCategoryChange('')
              onLanguageChange('')
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-gray-100">
          <Select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="Category"
            className="text-xs"
            options={categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))}
          />
          
          <Select
            value={languageValue}
            onChange={(e) => onLanguageChange(e.target.value)}
            placeholder="Language"
            className="text-xs"
            options={languages.map(lang => ({ value: lang, label: lang.toUpperCase() }))}
          />
        </div>
      )}
    </div>
  )
} 