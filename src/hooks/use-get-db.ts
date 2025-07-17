import { openDB } from 'idb'

const useGetDB = async () => {
  return openDB('chatDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('roomId', 'roomId')
      }
    }
  })
}

export default useGetDB
