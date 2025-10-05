const useOpenPostDetailOverlay = (
  postMap,
  targetId,
  postId,
  postIndex,
  postDetailOverlay
) => {
  postMap[targetId].activePostId = postId
  postMap[targetId].activePostIndex = postIndex
  postMap[targetId].activePost = postMap[targetId].posts[postIndex]
  postDetailOverlay.open({
    targetId: targetId
  })
}

export default useOpenPostDetailOverlay
