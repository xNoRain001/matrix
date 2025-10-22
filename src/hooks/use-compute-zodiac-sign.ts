const useComputeZodiacSign = birthday => {
  const date = new Date(birthday)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return '水瓶座'
  }

  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return '双鱼座'
  }

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return '白羊座'
  }

  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return '金牛座'
  }

  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) {
    return '双子座'
  }

  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) {
    return '巨蟹座'
  }

  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return '狮子座'
  }

  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return '处女座'
  }

  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) {
    return '天秤座'
  }

  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) {
    return '天蝎座'
  }

  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) {
    return '射手座'
  }

  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return '摩羯座'
  }
}

export default useComputeZodiacSign
