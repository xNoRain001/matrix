// @ts-nocheck
const useRequestFullscreen = () => {
  const doc = document.documentElement

  if (doc.requestFullscreen) {
    doc.requestFullscreen()
  } else if (doc.webkitRequestFullscreen) {
    // Safari
    doc.webkitRequestFullscreen()
  } else if (doc.mozRequestFullScreen) {
    // Firefox
    doc.mozRequestFullScreen()
  } else if (doc.msRequestFullscreen) {
    // IE/Edge
    doc.msRequestFullscreen()
  }
}

export default useRequestFullscreen
