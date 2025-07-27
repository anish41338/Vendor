'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Dynamically import the component with no SSR
const CameraCapture = dynamic(
  () => import('@/features/freshness/components/camera-capture').then(mod => ({ default: mod.CameraCapture })),
  { 
    ssr: false,
    loading: () => (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading freshness scanner...</p>
          </div>
        </div>
      </div>
    )
  }
)

export default function FreshnessScanPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Food Freshness Scanner
          </h1>
          <p className="text-gray-600">
            Loading AI-powered freshness detection...
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Food Freshness Scanner
        </h1>
        <p className="text-gray-600">
          Upload a photo of your produce to check its freshness using AI
        </p>
      </div>
      
      <CameraCapture />
    </div>
  )
}
