import useGetDB from './use-get-db'

const useUpdateLastMsgToDB = async (id, item) => {
  const db = await useGetDB(id)
  await db.put('lastMessages', JSON.parse(JSON.stringify(item)))
}

export default useUpdateLastMsgToDB
