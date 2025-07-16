import useGetMediaStreamTracks from './use-get-media-stream-tracks'

const useCloseMediaStreamTracks = (mediaStrem: MediaStream) =>
  useGetMediaStreamTracks(mediaStrem).forEach(track => track.stop())

export default useCloseMediaStreamTracks
