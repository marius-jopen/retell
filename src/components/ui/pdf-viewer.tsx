'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, TrashIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

// Import polyfills
import '@/lib/polyfills'

// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false })
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false })

interface PDFViewerProps {
  file: string | File | ArrayBuffer | Uint8Array | null
  className?: string
  title?: string
  onLoadSuccess?: (numPages: number) => void
  onLoadError?: (error: Error) => void
  onDelete?: () => void
  showDeleteButton?: boolean
}

export default function PDFViewer({ 
  file, 
  className = '', 
  title = 'PDF Document',
  onLoadSuccess,
  onLoadError,
  onDelete,
  showDeleteButton = true
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState<boolean>(false)
  const [pdfjs, setPdfjs] = useState<any>(null)

  // Ensure this only runs on the client side and configure PDF.js
  useEffect(() => {
    setIsClient(true)
    
    // Dynamically import and configure PDF.js
    import('react-pdf').then(({ pdfjs }) => {
      setPdfjs(pdfjs)
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString()
    })

  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
    setError(null)
    onLoadSuccess?.(numPages)
  }, [onLoadSuccess])

  const onDocumentLoadError = useCallback((error: Error) => {
    setError(error.message)
    setLoading(false)
    onLoadError?.(error)
  }, [onLoadError])

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }, [numPages])

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1.0)
  }, [])

  // Show loading state during hydration and PDF.js loading
  if (!isClient || !pdfjs) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="mt-2 text-sm">Loading PDF viewer...</p>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm">No PDF file selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-2"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
            className="px-3"
          >
            Reset
          </Button>
          {/* Delete button */}
          {showDeleteButton && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              title="Delete file"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Controls */}
      {numPages > 0 && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Content */}
      <div className="p-4">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading PDF</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        ) : (
          <div className="flex justify-center overflow-x-auto">
            <Document
              file={file as any}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                className="shadow-lg max-w-full h-auto"
                width={600}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  )
}
