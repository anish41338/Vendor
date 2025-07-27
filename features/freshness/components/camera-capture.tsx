'use client'
import { useRef, useState, useEffect } from 'react'
import { useFreshnessScan } from '../hooks/use-freshness-scan'
import { validateImageFile } from '../lib/image-utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, Upload, RotateCcw } from 'lucide-react'

export function CameraCapture() {
  const [isClient, setIsClient] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { isScanning, result, error, scanImage, resetScan } = useFreshnessScan()

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">
          <p>Loading camera interface...</p>
        </div>
      </Card>
    )
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!validateImageFile(file)) {
      alert('Please select a valid image file (JPEG, PNG, WebP) under 5MB')
      return
    }

    // Show preview
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)

    // Scan the image
    await scanImage(file)
  }

  const handleReset = () => {
    setSelectedImage(null)
    resetScan()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getResultColor = () => {
    switch (result?.prediction) {
      case 'fresh': return 'text-green-600 bg-green-50'
      case 'spoiled': return 'text-red-600 bg-red-50'
      case 'doubtful': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Check Food Freshness
        </h3>

        {/* File Upload */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="w-full"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Upload Image'}
          </Button>
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="space-y-4">
            <img
              src={selectedImage}
              alt="Selected produce"
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Loading State */}
        {isScanning && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Analyzing freshness...</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`p-4 rounded-lg ${getResultColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold capitalize">
                {result.prediction}
              </span>
              <span className="text-sm">
                {Math.round(result.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-sm">{result.details}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            <p className="text-sm">Error: {error}</p>
          </div>
        )}

        {/* Reset Button */}
        {(result || error) && (
          <Button 
            onClick={handleReset}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Scan Another Image
          </Button>
        )}
      </div>
    </Card>
  )
}
