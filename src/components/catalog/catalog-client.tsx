'use client'

import { useState, useMemo } from 'react'
import { PodcastCard } from '@/components/ui/podcast-card'
import { FilterBar } from '@/components/ui/filter-bar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { countryNameByCode } from '@/lib/countries'

interface Episode {
  id: string
  title: string
  duration?: number
  episode_number?: number
}

interface Podcast {
  id: string
  title: string
  description: string
  category: string
  language: string
  country: string
  cover_image_url: string | null
  episodes?: Episode[]
  license_countries?: string[]
  translations?: Array<{ language_code: string; title: string; description: string }>
}

interface CatalogClientProps {
  podcasts: Podcast[]
}

export function CatalogClient({ podcasts }: CatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')

  // Extract unique categories from podcasts
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(podcasts.map(p => p.category).filter(Boolean))]
    return uniqueCategories.sort()
  }, [podcasts])

  // Extract unique countries from podcasts (default country + license countries + translation countries)
  const countries = useMemo(() => {
    const countrySet = new Set<string>()
    
    podcasts.forEach(podcast => {
      // Add default country (fallback to 'DE' if empty/null)
      const defaultCountry = podcast.country || 'DE'
      countrySet.add(defaultCountry)
      
      // Add license countries
      if (podcast.license_countries) {
        podcast.license_countries.forEach(code => {
          if (code && code.trim()) {
            countrySet.add(code)
          }
        })
      }
      
      // Add translation countries
      if (podcast.translations) {
        podcast.translations.forEach(t => {
          if (t.language_code && t.language_code.trim()) {
            countrySet.add(t.language_code)
          }
        })
      }
    })
    
    // Convert to array with country names, filter out 'Unknown', and sort
    return Array.from(countrySet)
      .map(code => ({ code, name: countryNameByCode(code) }))
      .filter(country => country.name !== 'Unknown')
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [podcasts])

  // Filter podcasts based on search and filters
  const filteredPodcasts = useMemo(() => {
    return podcasts.filter(podcast => {
      const matchesSearch = !searchQuery || 
        podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory || podcast.category === selectedCategory
      
      const matchesCountry = !selectedCountry || 
        podcast.country === selectedCountry ||
        (podcast.license_countries && podcast.license_countries.includes(selectedCountry)) ||
        (podcast.translations && podcast.translations.some(t => t.language_code === selectedCountry))

      return matchesSearch && matchesCategory && matchesCountry
    })
  }, [podcasts, searchQuery, selectedCategory, selectedCountry])

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No podcasts yet</h3>
        <p className="text-gray-500 mb-6">
          Be the first to discover amazing content when it arrives!
        </p>
        <Link href="/auth/signup?role=author">
          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
            Become a Creator
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <FilterBar
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onCountryChange={setSelectedCountry}
        searchValue={searchQuery}
        categoryValue={selectedCategory}
        countryValue={selectedCountry}
        categories={categories}
        countries={countries}
        resultCount={filteredPodcasts.length}
      />

      {filteredPodcasts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.674-2.64" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-4">
            Try different search terms or filters
          </p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('')
              setSelectedCountry('')
            }}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPodcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      )}
    </>
  )
} 