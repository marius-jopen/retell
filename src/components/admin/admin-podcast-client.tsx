'use client'

import { useState, useMemo } from 'react'
import { AdminPodcastFilter } from './admin-podcast-filter'
import AdminPodcastTable from './admin-podcast-table'

interface Podcast {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  author_id: string
  category: string
  language: string
  country: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  rss_url: string | null
  created_at: string
  updated_at: string
  user_profiles: {
    full_name: string
    email: string
    company: string | null
  } | null
  episodes: Array<{
    id: string
    title: string
    status: 'draft' | 'pending' | 'approved' | 'rejected'
  }>
}

interface AdminPodcastClientProps {
  podcasts: Podcast[]
}

export function AdminPodcastClient({ podcasts }: AdminPodcastClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')

  // Extract unique values for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(podcasts.map(p => p.status).filter(Boolean))]
    return uniqueStatuses.sort()
  }, [podcasts])

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(podcasts.map(p => p.category).filter(Boolean))]
    return uniqueCategories.sort()
  }, [podcasts])

  const languages = useMemo(() => {
    const uniqueLanguages = [...new Set(podcasts.map(p => p.language).filter(Boolean))]
    return uniqueLanguages.sort()
  }, [podcasts])

  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(podcasts.map(p => p.user_profiles?.full_name).filter(Boolean) as string[])]
    return uniqueAuthors.sort()
  }, [podcasts])

  // Filter podcasts based on all criteria
  const filteredPodcasts = useMemo(() => {
    return podcasts.filter(podcast => {
      const matchesSearch = !searchQuery || 
        podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.user_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.user_profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        podcast.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !selectedStatus || podcast.status === selectedStatus
      const matchesCategory = !selectedCategory || podcast.category === selectedCategory
      const matchesLanguage = !selectedLanguage || podcast.language === selectedLanguage
      const matchesAuthor = !selectedAuthor || podcast.user_profiles?.full_name === selectedAuthor

      return matchesSearch && matchesStatus && matchesCategory && matchesLanguage && matchesAuthor
    })
  }, [podcasts, searchQuery, selectedStatus, selectedCategory, selectedLanguage, selectedAuthor])

  return (
    <>
      <AdminPodcastFilter
        onSearchChange={setSearchQuery}
        onStatusChange={setSelectedStatus}
        onCategoryChange={setSelectedCategory}
        onLanguageChange={setSelectedLanguage}
        onAuthorChange={setSelectedAuthor}
        searchValue={searchQuery}
        statusValue={selectedStatus}
        categoryValue={selectedCategory}
        languageValue={selectedLanguage}
        authorValue={selectedAuthor}
        statuses={statuses}
        categories={categories}
        languages={languages}
        authors={authors}
        resultCount={filteredPodcasts.length}
      />

      <AdminPodcastTable podcasts={filteredPodcasts} />
    </>
  )
} 