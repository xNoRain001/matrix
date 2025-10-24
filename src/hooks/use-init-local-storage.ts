const useInitLocalStorate = (key, value) => {
  try {
    const data = JSON.parse(localStorage.getItem(key))

    if (!data) {
      return value
    }

    const { version } = value

    // 如果存在版本号，需要进行版本控制
    if (version !== undefined) {
      if (version === data.version) {
        value = data
      } else {
        // diff
        delete data.version
        const keys = Object.keys(value)

        for (let i = 0, l = keys.length; i < l; i++) {
          const key = keys[i]
          value[key] = data[key]
        }

        localStorage.setItem(key, JSON.stringify(value))
      }
    } else {
      value = data
    }
  } catch {}

  return value
}

export default useInitLocalStorate
