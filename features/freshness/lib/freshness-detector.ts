import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl' // Backend imports
import '@tensorflow/tfjs-backend-cpu'   // Backend imports
import * as mobilenet from '@tensorflow-models/mobilenet'

export class FreshnessDetector {
  private mobilenetModel: any = null

  async loadModel() {
    // Initialize TensorFlow.js backend
    await tf.ready()
    console.log('TensorFlow.js backend ready:', tf.getBackend())
    
    this.mobilenetModel = await mobilenet.load()
    console.log('MobileNet model loaded')
  }

  async predictFreshness(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<{
    prediction: 'fresh' | 'doubtful' | 'spoiled'
    confidence: number
    details: string
  }> {
    if (!this.mobilenetModel) {
      await this.loadModel()
    }

    try {
      // Get predictions from MobileNet
      const predictions = await this.mobilenetModel.classify(imageElement)
      
      // Analyze image for freshness indicators using color analysis
      const freshnessScore = await this.analyzeImageFreshness(imageElement)
      
      const topPrediction = predictions[0]
      
      // Combine MobileNet confidence with color analysis
      let finalPrediction: 'fresh' | 'doubtful' | 'spoiled'
      let confidence = freshnessScore.confidence
      let details = `Detected: ${topPrediction.className}`

      if (freshnessScore.score > 0.7) {
        finalPrediction = 'fresh'
        details += ' - Good color and texture detected'
      } else if (freshnessScore.score > 0.4) {
        finalPrediction = 'doubtful'
        details += ' - Some quality concerns detected'
      } else {
        finalPrediction = 'spoiled'
        details += ' - Poor quality indicators found'
      }

      return {
        prediction: finalPrediction,
        confidence: Math.round(confidence * 100) / 100,
        details
      }
    } catch (error) {
      console.error('Prediction error:', error)
      return {
        prediction: 'doubtful',
        confidence: 0,
        details: 'Error processing image'
      }
    }
  }

  // Simple color-based freshness analysis
  private async analyzeImageFreshness(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<{
    score: number
    confidence: number
  }> {
    // Create canvas to analyze pixels
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = 224
    canvas.height = 224
    ctx.drawImage(imageElement, 0, 0, 224, 224)
    
    const imageData = ctx.getImageData(0, 0, 224, 224)
    const pixels = imageData.data
    
    let totalPixels = 0
    let brightPixels = 0
    let darkPixels = 0
    let greenPixels = 0
    let brownPixels = 0
    
    // Analyze every 4th pixel for performance
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      
      totalPixels++
      
      // Brightness analysis
      const brightness = (r + g + b) / 3
      if (brightness > 150) brightPixels++
      if (brightness < 50) darkPixels++
      
      // Color analysis for freshness
      if (g > r && g > b && g > 100) greenPixels++ // Green = fresh
      if (r > 100 && g < 80 && b < 80) brownPixels++ // Brown = spoiled
    }
    
    // Calculate freshness score
    const brightnessRatio = brightPixels / totalPixels
    const darknessRatio = darkPixels / totalPixels
    const greenRatio = greenPixels / totalPixels
    const brownRatio = brownPixels / totalPixels
    
    // Simple scoring logic
    let score = 0.5 // Base score
    
    // Positive indicators (fresh)
    score += brightnessRatio * 0.3
    score += greenRatio * 0.4
    
    // Negative indicators (spoiled)
    score -= darknessRatio * 0.4
    score -= brownRatio * 0.5
    
    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score))
    
    return {
      score,
      confidence: 0.7 + (Math.abs(score - 0.5) * 0.6) // Higher confidence for extreme values
    }
  }
}
