const useGenHash = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  const ext = file.name.split('.').pop()
  return `${hashHex}${ext ? '.' + ext : ''}`
}

export default useGenHash
