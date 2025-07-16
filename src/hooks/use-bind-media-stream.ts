const useBindMediaStream = (elm, mediaStrem: MediaStream) =>
  (elm.srcObject = mediaStrem)

export default useBindMediaStream
