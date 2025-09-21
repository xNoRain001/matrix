const useInitLocalStorate = (key, value) => {
  try {
    const data = JSON.parse(localStorage.getItem(key))

    if (data) {
      value = data
    }
  } catch {}

  return value
}

export default useInitLocalStorate
