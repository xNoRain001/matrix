const useAddRoomID = (prefix, pin) => {
  location.search = `?roomId=${prefix}${pin.value.join('')}`
}

export default useAddRoomID
