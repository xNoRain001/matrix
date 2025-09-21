import { openDB } from 'idb'

let db = null

const useGetDB = async id => {
  if (!db) {
    db = await openDB(`chatDB-${id}`, 24, {
      upgrade(db) {
        let store = null

        if (!db.objectStoreNames.contains('messages')) {
          store = db.createObjectStore('messages', {
            keyPath: 'id',
            autoIncrement: true
          })
          // 创建符合索引
          store.createIndex('contact_id', ['contact', 'id'], { unique: false })
        }

        if (!db.objectStoreNames.contains('lastMessages')) {
          db.createObjectStore('lastMessages', {
            keyPath: 'id' // 对方的 id
          })
        }

        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', {
            keyPath: 'hash' // 文件哈希名作为主键
          })
          store.createIndex('hash', 'hash', { unique: true })
        }

        if (!db.objectStoreNames.contains('bg')) {
          db.createObjectStore('bg', {
            keyPath: 'id'
          })
        }

        if (!db.objectStoreNames.contains('avatar')) {
          db.createObjectStore('avatar', {
            keyPath: 'id'
          })
        }

        if (!db.objectStoreNames.contains('chatBg')) {
          db.createObjectStore('chatBg', {
            keyPath: 'id'
          })
        }
      }
    })
  }

  return db
}

export default useGetDB
