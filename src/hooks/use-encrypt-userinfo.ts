import { getPublicKey } from '@/apis/auth'

const pemHeader = '-----BEGIN PUBLIC KEY-----'
const pemFooter = '-----END PUBLIC KEY-----'

const importPublicKey = async () => {
  const { data: publicKey } = await getPublicKey()
  const pemContents = publicKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s+/g, '')
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  // 只支持 https 或 localhost
  return crypto.subtle.importKey(
    'spki',
    binaryDer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  )
}

const useEncryptUserInfo = async userInfo => {
  const publicKey = await importPublicKey()
  const encoded = new TextEncoder().encode(JSON.stringify(userInfo))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded
  )
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}

export default useEncryptUserInfo
