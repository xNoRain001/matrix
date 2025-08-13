const useBackToProfile = (open, router) => {
  if (!open) {
    router.replace('/profile')
  }
}

export default useBackToProfile
