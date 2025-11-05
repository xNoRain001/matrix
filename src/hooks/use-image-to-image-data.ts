const useImageToImageData = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const { width, height } = image
  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)
  return context.getImageData(0, 0, width, height)
}

export default useImageToImageData
