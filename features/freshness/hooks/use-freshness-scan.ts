'use client'
import { useState } from 'react'
import { FreshnessDetector } from '../lib/freshness-detector'
import { fileToImageElement } from '../lib/image-utils'
import type { FreshnessResult, ScanState } from '../types/freshness'

export function useFreshnessScan() {
  const [state, setState] = useState<ScanState>({
    isScanning: false,
    result: null,
    error: null
  })

  const scanImage = async (imageFile: File): Promise<FreshnessResult | null> => {
    setState({ isScanning: true, result: null, error: null })

    try {
      // Convert file to image element
      const imageElement = await fileToImageElement(imageFile)
      
      // Initialize detector and predict
      const detector = new FreshnessDetector()
      const result = await detector.predictFreshness(imageElement)
      
      setState({ isScanning: false, result, error: null })
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState({ 
        isScanning: false, 
        result: null, 
        error: errorMessage 
      })
      return null
    }
  }

  const resetScan = () => {
    setState({ isScanning: false, result: null, error: null })
  }

  return {
    ...state,
    scanImage,
    resetScan
  }
}
