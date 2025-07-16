import useGetMediaStreamTracks from './use-get-media-stream-tracks'

const useAddMediaStreamToPC = (
  pc: RTCPeerConnection,
  mediaStrem: MediaStream
) => {
  useGetMediaStreamTracks(mediaStrem).forEach(track =>
    pc.addTrack(track, mediaStrem)
  )
}

export default useAddMediaStreamToPC
