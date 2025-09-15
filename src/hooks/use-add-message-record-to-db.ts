import useGetDB from './use-get-db'

const useAddMessageRecordToDB = async (id, label, messageRecord) => {
  const db = await useGetDB(id)

  if (label) {
    await db.add('messages', label)
  }

  await db.add('messages', messageRecord)
}

export default useAddMessageRecordToDB
