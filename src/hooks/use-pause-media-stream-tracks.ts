import useGetMediaStreamTracks from './use-get-media-stream-tracks'

const usePauseMediaStreamTracks = (mediaStrem: MediaStream) =>
  useGetMediaStreamTracks(mediaStrem).forEach(track => (track.enabled = false))

export default usePauseMediaStreamTracks
