'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/select'

interface AdminPodcastFilterProps {
  onStatusChange: (status: string) => void
  onCategoryChange: (category: string) => void
  onLanguageChange: (language: string) => void
  onAuthorChange: (author: string) => void
  onSearchChange: (search: string) => void
  statusValue: string
  categoryValue: string
  languageValue: string
  authorValue: string
  searchValue: string
  statuses: string[]
  categories: string[]
  languages: string[]
  authors: string[]
  resultCount: number
}

export function AdminPodcastFilter({
  onStatusChange,
  onCategoryChange,
  onLanguageChange,
  onAuthorChange,
  onSearchChange,
  statusValue,
  categoryValue,
  languageValue,
  authorValue,
  searchValue,
  statuses,
  categories,
  languages,
  authors,
  resultCount
}: AdminPodcastFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = statusValue || categoryValue || languageValue || authorValue

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search podcasts or authors..."
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

      {/* Results count and clear filters */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{resultCount} podcast{resultCount !== 1 ? 's' : ''}</span>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onStatusChange('')
              onCategoryChange('')
              onLanguageChange('')
              onAuthorChange('')
            }}
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 mt-3 border-t border-gray-100">
          <Select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            placeholder="All Statuses"
            className="text-xs"
            options={statuses.map(status => ({ 
              value: status, 
              label: status.charAt(0).toUpperCase() + status.slice(1) 
            }))}
          />
          
          <Select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="All Categories"
            className="text-xs"
            options={categories.map(cat => ({ 
              value: cat, 
              label: cat.charAt(0).toUpperCase() + cat.slice(1) 
            }))}
          />
          
          <Select
            value={languageValue}
            onChange={(e) => onLanguageChange(e.target.value)}
            placeholder="All Languages"
            className="text-xs"
            options={languages.map(lang => ({ 
              value: lang, 
              label: lang.toUpperCase() 
            }))}
          />

          <Select
            value={authorValue}
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="All Authors"
            className="text-xs"
            options={authors.map(author => ({ 
              value: author, 
              label: author 
            }))}
          />
        </div>
      )}
    </div>
  )
} 