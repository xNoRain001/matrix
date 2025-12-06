const useURLToBlob = async (url, type = '') =>
  new Blob([await (await fetch(url)).arrayBuffer()], { type })

export default useURLToBlob
