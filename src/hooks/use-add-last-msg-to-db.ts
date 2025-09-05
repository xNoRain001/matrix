import useGetDB from './use-get-db'

const useAddLastMsgToDB = async record => {
  const db = await useGetDB()
  await db.put('lastMessages', record)
}

export default useAddLastMsgToDB
