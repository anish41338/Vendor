export interface FreshnessScan {
  id: string
  vendor_id: string
  image_url: string
  product_name: string
  result: 'fresh' | 'doubtful' | 'spoiled'
  confidence: number
  details: string
  created_at: string
}

export interface FreshnessResult {
  prediction: 'fresh' | 'doubtful' | 'spoiled'
  confidence: number
  details: string
}

export interface ScanState {
  isScanning: boolean
  result: FreshnessResult | null
  error: string | null
}
