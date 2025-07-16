import useGetAudioInputs from './use-get-audio-inputs'

const useGetAudioInput = async () => {
  return (await useGetAudioInputs())[0]
}

export default useGetAudioInput
