const useBye = async (leaveAfterConnected: Function) => {
  await leaveAfterConnected()
}

export default useBye
