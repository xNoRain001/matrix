<template>
  <q-stepper
    v-if="isRegister"
    class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
    v-model="step"
    ref="stepperRef"
    color="primary"
  >
    <q-step
      :name="1"
      title="注册"
      active-icon="how_to_reg"
      icon="how_to_reg"
      :done="step > 1"
    >
      <q-form ref="registerFormRef">
        <q-input
          placeholder="example@gmail.com"
          outlined
          dense
          type="email"
          v-model="registerForm.email"
          label="邮箱"
          stack-label
          lazy-rules
          :rules="[
            val =>
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) ||
              '邮箱格式不正确'
          ]"
        />
        <q-input
          placeholder="password"
          outlined
          dense
          type="password"
          v-model="registerForm.password"
          label="密码"
          stack-label
          lazy-rules
          :rules="[val => val.length >= 8 || '密码长度至少为 8 位']"
        />
      </q-form>
    </q-step>

    <q-step
      :name="2"
      title="验证"
      active-icon="verified"
      icon="verified"
      :done="step > 2"
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

    <q-step :name="3" title="资料" active-icon="face" icon="face">
      <q-form ref="userInfoFormRef" class="grid grid-cols-1 gap-4">
        <q-input
          label="头像"
          dense
          outlined
          v-model="userInfo.avatar"
        ></q-input>
        <q-input
          label="昵称"
          dense
          outlined
          v-model="userInfo.nickname"
          lazy-rules
          :rules="[val => Boolean(val) || '昵称不能为空']"
        ></q-input>
        <q-select
          label="性别"
          dense
          outlined
          :options="genderOptions"
          v-model="userInfo.gender"
        ></q-select>
        <q-input
          label="出生日期"
          dense
          outlined
          v-model="userInfo.birthday"
          mask="date"
          lazy-rules
          :rules="['date']"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date :locale="dateLocale" v-model="birthday">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="关闭" color="primary" />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          label="地区"
          dense
          outlined
          v-model="userInfo.region"
        ></q-input>
      </q-form>
    </q-step>

    <template v-slot:navigation>
      <q-stepper-navigation :class="step !== 3 ? '' : 'mt-6'">
        <q-btn
          v-if="step !== 2"
          @click="onNext"
          color="primary"
          :label="step === 3 ? '完成' : '下一步'"
        />
        <q-btn
          v-if="step === 1"
          class="!ml-4"
          @click="onCancelRegister"
          color="primary"
          label="返回登录"
        />
      </q-stepper-navigation>
    </template>
  </q-stepper>
  <q-form
    class="w-full max-w-[var(--room-width)]"
    v-else
    ref="loginFormRef"
    @submit="onLogin"
  >
    <q-input
      placeholder="example@gmail.com"
      outlined
      dense
      type="email"
      v-model="loginForm.email"
      label="邮箱"
      stack-label
      lazy-rules
      :rules="[
        val =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) ||
          '邮箱格式不正确'
      ]"
    />
    <q-input
      placeholder="password"
      outlined
      dense
      type="password"
      v-model="loginForm.password"
      label="密码"
      stack-label
      lazy-rules
      :rules="[val => val.length >= 8 || '密码长度至少为 8 位']"
    />
    <q-btn label="登录" type="submit" color="primary" />
    <q-btn @click="onRegister" class="!ml-4" label="注册" color="primary" />
  </q-form>
</template>

<script lang="ts" setup>
import { dateLocale } from '@/const'
import { watch, reactive, ref } from 'vue'

import { useNotify } from '@/hooks'
import {
  hasVerification,
  getPublicKey,
  isExistedUser,
  register,
  validateVerificationCode,
  updateProfile,
  login
} from '@/apis'

let timer = null
let pause = false
const userInfo = ref({
  nickname: '',
  avatar: '',
  gender: '',
  birthday: '',
  region: ''
})
const birthday = ref('未知')
const genderOptions = ['男', '女']
const registerPin = ref([])
const pinLength = 4
const step = ref(1)
const registerFormRef = ref(null)
const stepperRef = ref(null)
const userInfoFormRef = ref(null)
const loginFormRef = ref(null)
const loginForm = reactive({
  email: '',
  password: ''
})
const registerForm = reactive({
  email: '',
  password: ''
})
const isRegister = ref(true)
const pemHeader = '-----BEGIN PUBLIC KEY-----'
const pemFooter = '-----END PUBLIC KEY-----'

const importPublicKey = async () => {
  const { data: publicKey } = await getPublicKey()
  const pemContents = publicKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s+/g, '')
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  return crypto.subtle.importKey(
    'spki',
    binaryDer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  )
}

const getEncryptedUserInfo = async userInfo => {
  const publicKey = await importPublicKey()
  const encoded = new TextEncoder().encode(JSON.stringify(userInfo))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded
  )
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}

const onNext = async () => {
  const _step = step.value

  if (_step === 1) {
    const success = await registerFormRef.value.validate()

    if (success) {
      try {
        const { email } = registerForm
        // 先判断邮箱是否已经被注册
        await isExistedUser(email)
        // 如果邮箱没有被注册，再判断是不是给这个邮箱发送过验证码并且还没过期
        const { data: has } = await hasVerification(email, 'register')

        // 验证码存在且未过期
        if (has) {
          // 直接进行到下一步让用户输入验证码
          useNotify('已经发送过验证码')
          return next()
        }

        const encryptedUserInfo = await getEncryptedUserInfo(registerForm)
        const { message } = await register(encryptedUserInfo)
        useNotify(message)
        next()
      } catch (error) {
        useNotify(error, 'negative')
      }
    }
  } else if (_step === 3) {
    const success = userInfoFormRef.value.validate()

    if (success) {
      try {
        await updateProfile(registerForm.email, userInfo.value)
      } catch (error) {
        useNotify(error, 'negative')
      }
    }
  }
}

const onCancelRegister = () => (isRegister.value = false)

const onRegister = () => (isRegister.value = true)

const initTimeout = () =>
  setTimeout(() => {
    pause = false
    clearTimeout(timer)
  }, 5000)

// TODO: 使用验证码登录
const onLogin = async () => {
  // 表单通过验证后这里面的代码才会执行
  if (pause) {
    clearTimeout(timer)
    timer = initTimeout()
    useNotify('操作过于频繁，请在 5 秒后重试', 'warning')
    return
  }

  pause = true
  timer = initTimeout()

  try {
    // await isExistedUser(email)
    // 不进行存在性检测，因为 loginService 内部会检测
    const encryptedUserInfo = await getEncryptedUserInfo(loginForm)
    const { data: token } = await login(encryptedUserInfo)
    localStorage.setItem('token', token)

    useNotify('登录成功')
  } catch (error) {
    useNotify(error, 'negative')
  }
}

const next = () => stepperRef.value.next()

watch(registerPin, async v => {
  if (v.length === pinLength) {
    if (pause) {
      clearTimeout(timer)
      timer = initTimeout()
      useNotify('操作过于频繁，请在 5 秒后重试', 'warning')
      return
    }

    pause = true
    timer = initTimeout()

    try {
      const { data } = await validateVerificationCode(
        'register',
        registerForm.email,
        v.join('')
      )
      // other -> '未知'
      data.gender = '未知'
      userInfo.value = data
      next()
    } catch (error) {
      useNotify(error, 'negative')
      registerPin.value = []
    }
  }
})
</script>

<style>
.q-stepper--horizontal .q-stepper__step-inner {
  padding-bottom: 0;
}
</style>
