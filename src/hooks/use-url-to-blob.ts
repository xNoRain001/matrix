const useURLToBlob = async url => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return new Blob([arrayBuffer])
}

export default useURLToBlob
