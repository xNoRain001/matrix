import useGetDevices from './use-get-devices'

const useGetAudioOutputs = async () => {
  return (await useGetDevices()).filter(device => device.kind === 'audiooutput')
}

export default useGetAudioOutputs
