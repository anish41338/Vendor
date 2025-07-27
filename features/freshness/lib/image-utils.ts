export const resizeImage = (file: File, maxWidth: number = 224, maxHeight: number = 224): Promise<HTMLCanvasElement> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      canvas.width = maxWidth
      canvas.height = maxHeight
      ctx.drawImage(img, 0, 0, maxWidth, maxHeight)
      resolve(canvas)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

export const fileToImageElement = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize
}
