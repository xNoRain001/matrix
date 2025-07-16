import useGetMediaStreamTracks from './use-get-media-stream-tracks'

const useResumeMediaStreamTracks = (mediaStrem: MediaStream) =>
  useGetMediaStreamTracks(mediaStrem).forEach(track => (track.enabled = true))

export default useResumeMediaStreamTracks
