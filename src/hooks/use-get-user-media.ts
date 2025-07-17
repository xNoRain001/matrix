const useGetUserMedia = async (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getUserMedia(constraints)
}

export default useGetUserMedia
