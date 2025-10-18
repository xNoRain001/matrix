// @ts-nocheck
const useExitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    // Safari
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    // Firefox
    document.mozCancelFullScreen()
  } else if (document.msExitFullscreen) {
    // IE/Edge
    document.msExitFullscreen()
  }
}

export default useExitFullscreen
