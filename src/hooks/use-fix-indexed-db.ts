import useGetDB from './use-get-db'

const useFixIndexedDB = async id => {
  const db = await useGetDB(id)
  db.close()
  const req = indexedDB.deleteDatabase('chatDB')
  req.onsuccess = () => {
    localStorage.removeItem(`lastMsgProfileMapExpireAt-${id}`)
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
