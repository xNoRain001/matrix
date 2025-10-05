const useOpenSpace = (
  profileSpaceOverlay,
  userInfo,
  activeTargetIds,
  targetId,
  targetProfile
) => {
  // 如果之前已经打开，不进行重复打开，同时禁止打开自己的空间
  if (!activeTargetIds.has(targetId) && targetId !== userInfo.id) {
    profileSpaceOverlay.open({
      targetId,
      targetProfile
    })
  }
}

export default useOpenSpace
