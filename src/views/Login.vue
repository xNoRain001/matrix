<template>
  <div class="flex-center flex h-[calc(100vh-2rem)]">
    <q-stepper
      v-if="isRegister"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="registerStep"
      ref="registerStepperRef"
    >
      <q-step
        :name="1"
        title="注册"
        active-icon="how_to_reg"
        icon="how_to_reg"
        :done="registerStep > 1"
      >
        <q-input
          dense
          placeholder="example@gmail.com"
          outlined
          type="email"
          v-model="registerForm.email"
          label="邮箱"
        />
        <q-input
          dense
          :type="isPwd ? 'password' : 'text'"
          outlined
          v-model="registerForm.password"
          label="密码（长度至少为 8 位）"
          class="mt-4"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </q-step>

      <q-step
        :name="2"
        title="验证"
        active-icon="verified"
        icon="verified"
        :done="registerStep > 2"
      >
        <div>输入邮箱中收到的验证码</div>
        <UPinInput
          class="mt-4"
          autofocus
          size="xl"
          :length="pinLength"
          v-model="registerPin"
        />
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="mt-4">
          <q-btn
            v-if="registerStep === 1"
            @click="onRegisterNext"
            color="primary"
            label="注册"
            rounded
          />
          <q-btn
            :class="registerStep === 1 ? '!ml-4' : ''"
            @click="onCancelRegister"
            color="primary"
            label="返回登录"
            rounded
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <q-stepper
      v-if="isLogin"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="loginStep"
      ref="loginStepperRef"
    >
      <q-step
        :name="1"
        title="登录"
        active-icon="how_to_reg"
        icon="how_to_reg"
        :done="loginStep > 1"
      >
        <q-input
          dense
          placeholder="example@gmail.com"
          outlined
          type="email"
          v-model="loginForm.email"
          label="邮箱"
        />
        <q-input
          dense
          :type="isPwd ? 'password' : 'text'"
          outlined
          v-model="loginForm.password"
          label="密码"
          class="mt-4"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <div class="text-primary mt-4 flex justify-between">
          <div @click="onUpdatePassword" class="cursor-pointer underline">
            忘记密码
          </div>
          <div @click="onLoginWithVC" class="cursor-pointer">
            使用验证码登录
          </div>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="mt-4">
          <q-btn @click="onLogin" label="登录" color="primary" rounded />
          <q-btn
            @click="onRegister"
            class="!ml-4"
            label="注册"
            color="primary"
            rounded
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <q-stepper
      v-if="isLoginWithVC"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="loginWithVCStep"
      ref="loginWithVCStepperRef"
    >
      <q-step
        :name="1"
        title="邮箱"
        active-icon="email"
        icon="email"
        :done="loginWithVCStep > 1"
      >
        <q-input
          dense
          placeholder="example@gmail.com"
          outlined
          type="email"
          v-model="loginWithVCForm.email"
          label="邮箱"
        />
      </q-step>

      <q-step
        :name="2"
        title="验证"
        active-icon="verified"
        icon="verified"
        :done="loginWithVCStep > 2"
      >
        <div>
          <div>输入邮箱中收到的验证码</div>
          <UPinInput
            class="mt-4"
            autofocus
            size="xl"
            :length="pinLength"
            v-model="loginWithVCPin"
          />
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="mt-4">
          <q-btn
            v-if="loginWithVCStep === 1"
            @click="onLoginWithVCNext"
            label="发送验证码"
            color="primary"
            rounded
          />
          <q-btn
            :class="loginWithVCStep === 1 ? '!ml-4' : ''"
            @click="onCancleLoginWithVC"
            label="使用密码登录"
            color="primary"
            rounded
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <q-stepper
      v-if="isUpdatePassword"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="updatePasswordStep"
    >
      <q-step
        :name="1"
        title="重置密码"
        active-icon="email"
        icon="email"
        :done="updatePasswordStep > 1"
      >
        <q-input
          dense
          placeholder="example@gmail.com"
          outlined
          type="email"
          v-model="updatePasswordForm.email"
          label="邮箱"
        />
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation class="mt-4">
          <q-btn
            @click="onUpdatePasswordNext"
            color="primary"
            :label="sentResetPasswordURL ? '已发送验证码' : '发送验证码'"
            rounded
          />
          <q-btn
            class="!ml-4"
            @click="onCancelUpadtePassword"
            color="primary"
            label="返回登录"
            rounded
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>

<script lang="ts" setup>
import { watch, reactive, ref } from 'vue'

import { useEncryptUserInfo, useNotify } from '@/hooks'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import {
  hasPin,
  hasResetPasswordURL,
  isExistedUser,
  login,
  register,
  sendPin,
  sendResetPasswordURL,
  validatePin
} from '@/apis/auth'

const registerPin = ref([])
const updatePasswordPin = ref([])
const loginWithVCPin = ref([])
const pinLength = 4
const registerStep = ref(1)
const loginStep = ref(1)
const loginWithVCStep = ref(1)
const updatePasswordStep = ref(1)
const registerStepperRef = ref(null)
const loginStepperRef = ref(null)
const loginWithVCStepperRef = ref(null)
const updatePasswordStepperRef = ref(null)
const loginForm = reactive({
  email: '',
  password: ''
})
const registerForm = reactive({
  email: '',
  password: ''
})
const loginWithVCForm = reactive({
  email: '',
  code: ''
})
const updatePasswordForm = reactive({ email: '' })
const isLogin = ref(true)
const isRegister = ref(false)
const router = useRouter()
const { userInfo } = storeToRefs(useUserInfoStore())
const isUpdatePassword = ref(false)
const isLoginWithVC = ref(false)
const sentResetPasswordURL = ref(false)
const isPwd = ref(true)

const onLoginWithVCNext = async () => {
  const _step = loginWithVCStep.value

  if (_step === 1) {
    const { email } = loginWithVCForm

    if (!isValidEmail(email)) {
      return useNotify('邮箱格式不正确', 'negative')
    }

    try {
      const { data: existed } = await isExistedUser(email)

      if (!existed) {
        throw new Error('邮箱不存在')
      }

      const { data: has } = await hasPin(email, 'login')

      if (has) {
        useNotify('已经发送过验证码')
      } else {
        const { message } = await sendPin(email, 'login')
        useNotify(message)
      }

      loginWithVCNext()
    } catch (error) {
      useNotify(error, 'negative')
    }
  }
}

const onUpdatePassword = () => {
  isLogin.value = false
  isUpdatePassword.value = true
}

const onCancelUpadtePassword = () => {
  isUpdatePassword.value = false
  updatePasswordStep.value = 1
  isLogin.value = true
}

const onUpdatePasswordNext = async () => {
  const { email } = updatePasswordForm

  if (!isValidEmail(email)) {
    return useNotify('邮箱格式不正确', 'negative')
  }

  try {
    const { data: existed } = await isExistedUser(email)

    if (!existed) {
      throw new Error('邮箱未注册')
    }

    const { data: has } = await hasResetPasswordURL(email)

    if (has) {
      sentResetPasswordURL.value = true
      useNotify('已经发送过验证码')
    } else {
      const { message } = await sendResetPasswordURL(email)
      sentResetPasswordURL.value = true
      useNotify(message)
    }
  } catch (error) {
    useNotify(error, 'negative')
  }
}

const isValidEmail = email =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)

const isValidPassword = password => password.length >= 8

const onRegisterNext = async () => {
  const _step = registerStep.value

  if (_step === 1) {
    const { email, password } = registerForm

    if (!isValidEmail(email)) {
      return useNotify('邮箱格式不正确', 'negative')
    }

    if (!isValidPassword(password)) {
      return useNotify('密码要求长度至少为 8 位', 'negative')
    }

    try {
      // 先判断邮箱是否已经被注册
      const { data: existed } = await isExistedUser(email)

      if (existed) {
        throw new Error('邮箱已被注册')
      }

      // 如果邮箱没有被注册，再判断是不是给这个邮箱发送过验证码并且还没过期
      const { data: has } = await hasPin(email, 'register')

      // 验证码存在且未过期
      if (has) {
        // 直接进行到下一步让用户输入验证码
        // TODO: 解决之前的密码已经保存在 redis 中，此次输入的密码是无用的
        useNotify('已经发送过验证码')
      } else {
        const encryptedUserInfo = await useEncryptUserInfo(registerForm)
        const { message } = await register(encryptedUserInfo)
        useNotify(message)
      }

      registerNext()
    } catch (error) {
      useNotify(error.message, 'negative')
    }
  }
}

const onCancelRegister = () => {
  isRegister.value = false
  registerStep.value = 1
  isLogin.value = true
}

const onRegister = () => {
  isLogin.value = false
  isRegister.value = true
}

const onLoginWithVC = () => {
  isLogin.value = false
  isLoginWithVC.value = true
}

const onCancleLoginWithVC = () => {
  isLoginWithVC.value = false
  loginWithVCStep.value = 1
  isLogin.value = true
}

const onLogin = async () => {
  const { email, password } = loginForm

  if (!isValidEmail(email)) {
    return useNotify('邮箱格式不正确', 'negative')
  }

  if (!isValidPassword(password)) {
    return useNotify('密码要求长度至少为 8 位', 'negative')
  }

  try {
    // await isExistedUser(email)
    // 不进行存在性检测，因为 loginService 内部会检测
    const encryptedUserInfo = await useEncryptUserInfo(loginForm)
    const {
      data: { token, userInfo: _userInfo }
    } = await login(encryptedUserInfo)
    localStorage.setItem('token', token)
    userInfo.value = _userInfo
    router.replace('/match')
    useNotify('登录成功')
  } catch (error) {
    useNotify(error, 'negative')
  }
}

const loginWithVCNext = () => loginWithVCStepperRef.value.next()

const registerNext = () => registerStepperRef.value.next()

const updatePasswordNext = () => updatePasswordStepperRef.value.next()

watch(registerPin, async v => {
  if (v.length === pinLength) {
    try {
      const {
        data: { token, userInfo: _userInfo }
      } = await validatePin('register', registerForm.email, v.join(''))
      localStorage.setItem('token', token)
      userInfo.value = _userInfo
      router.replace('/match')
      useNotify('登录成功')
    } catch (error) {
      useNotify(error, 'negative')
      registerPin.value = []
    }
  }
})

watch(updatePasswordPin, async v => {
  if (v.length === pinLength) {
    try {
      await validatePin('update-password', updatePasswordForm.email, v.join(''))
      updatePasswordNext()
    } catch (error) {
      useNotify(error, 'negative')
      updatePasswordPin.value = []
    }
  }
})

watch(loginWithVCPin, async v => {
  if (v.length === pinLength) {
    try {
      const {
        data: { token, userInfo: _userInfo }
      } = await validatePin('login', loginWithVCForm.email, v.join(''))
      localStorage.setItem('token', token)
      userInfo.value = _userInfo
      router.replace('/match')
    } catch (error) {
      useNotify(error, 'negative')
      loginWithVCPin.value = []
    }
  }
})
</script>

<style>
.q-stepper--horizontal .q-stepper__step-inner {
  padding-bottom: 0;
}
</style>
