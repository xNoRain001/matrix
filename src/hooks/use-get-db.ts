import { openDB } from 'idb'

let db = null

const useGetDB = async () => {
  if (!db) {
    db = await openDB('chatDB', 5, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('messages')) {
          const store = db.createObjectStore('messages', {
            keyPath: 'id',
            autoIncrement: true
          })
          store.createIndex('contact', 'contact')
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
      }
    })

    // const storeNames = db.objectStoreNames
    // for (let i = 0; i < storeNames.length; i++) {
    //   const storeName = storeNames[i]
    //   const tx = db.transaction(storeName, 'readwrite')
    //   await tx.objectStore(storeName).clear()
    //   await tx.done
    // }
  }

  return db
}

export default useGetDB
