import useGetAudioOutputs from './use-get-audio-outputs'

const useGetAudioOutput = async () => {
  return (await useGetAudioOutputs())[0]
}

export default useGetAudioOutput
