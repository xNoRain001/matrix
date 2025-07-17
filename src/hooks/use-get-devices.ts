const useGetDevices = async () => {
  return navigator.mediaDevices.enumerateDevices()
}

export default useGetDevices
