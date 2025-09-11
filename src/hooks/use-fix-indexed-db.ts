import useGetDB from './use-get-db'

const useFixIndexedDB = async () => {
  const db = await useGetDB()
  db.close()
  const req = indexedDB.deleteDatabase('chatDB')
  req.onsuccess = () => {
    localStorage.removeItem('lastMsgProfileMapExpireAt')
    location.reload()
  }
  req.onerror = () => {
    console.log('数据库删除失败')
  }
  req.onblocked = () => {
    console.log('数据库删除被阻塞')
  }
}

export default useFixIndexedDB
