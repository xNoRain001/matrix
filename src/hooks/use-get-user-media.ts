const useGetUserMedia = async (constraints: MediaStreamConstraints) => {
  return await navigator.mediaDevices.getUserMedia(constraints)
}

export default useGetUserMedia
