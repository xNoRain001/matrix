const useGetDevices = async () => {
  return await navigator.mediaDevices.enumerateDevices()
}

export default useGetDevices
