const useTransformGender = v =>
  v === 'other' ? '保密' : v === 'male' ? '男' : '女'

export default useTransformGender
