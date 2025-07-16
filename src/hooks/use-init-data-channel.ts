const useInitDataChannel = (pc: RTCPeerConnection) => {
  const dataChannel = pc.createDataChannel('fileTransfer')

  dataChannel.bufferedAmountLowThreshold = 65536
  dataChannel.onopen = () => {
    console.log('数据通道已打开')
  }
  dataChannel.onclose = () => {
    console.log('数据通道已关闭')
  }
  dataChannel.onerror = () => {
    console.log('数据通道错误')
  }

  return dataChannel
}

export default useInitDataChannel
