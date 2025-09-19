const useInitIndexedDBData = (label, messageRecord) => {
  const indexdbLabel = label ? { ...label } : null
  const indexdbMessageRecord = { ...messageRecord }

  return [indexdbLabel, indexdbMessageRecord]
}

export default useInitIndexedDBData
