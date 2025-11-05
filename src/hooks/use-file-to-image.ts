const useFileToImage = async file => {
  const url = URL.createObjectURL(file)
  const img = await new Promise<HTMLImageElement>(resolve => {
    const image = new Image()
    image.src = url
    image.onload = () => resolve(image)
  })
  return img
}

export default useFileToImage
