import useGetDevices from './use-get-devices'

const useGetAudioInputs = async () => {
  return (await useGetDevices()).filter(device => device.kind === 'audioinput')
}

export default useGetAudioInputs
