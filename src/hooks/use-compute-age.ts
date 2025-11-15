const useComputeAge = v => {
  if (!v) {
    return '保密'
  }

  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const _year = new Date(v).getFullYear()
  const _month = new Date(v).getMonth()
  const _day = new Date(v).getDate()
  const full = _month < month || (_month === month && _day <= day)

  return year - _year - (full ? 0 : 1)
}

export default useComputeAge
