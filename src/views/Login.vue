<template>
  <div class="flex-center flex h-[calc(100vh-32px)]">
    <q-stepper
      v-if="isRegister"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="registerStep"
      ref="registerStepperRef"
      color="primary"
    >
      <q-step
        :name="1"
        title="注册"
        active-icon="how_to_reg"
        icon="how_to_reg"
        :done="registerStep > 1"
      >
        <q-form ref="registerFormRef">
          <q-input
            placeholder="example@gmail.com"
            outlined
            type="email"
            v-model="registerForm.email"
            label="邮箱"
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
            type="password"
            v-model="registerForm.password"
            label="密码"
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
        :done="registerStep > 2"
      >
        <div>输入邮箱中收到的验证码</div>
        <UPinInput
          class="mt-4"
          autofocus
          size="xl"
          :length="pinLength"
          v-model="pin"
        />
      </q-step>

      <q-step :name="3" title="资料" active-icon="face" icon="face">
        <q-form ref="userInfoFormRef" class="q-gutter-md">
          <q-input label="头像" outlined v-model="userInfo.avatar"></q-input>
          <q-input
            label="昵称"
            outlined
            v-model="userInfo.nickname"
            lazy-rules
            :rules="[val => Boolean(val) || '昵称不能为空']"
          ></q-input>
          <q-select
            label="性别"
            outlined
            :options="genderOptions"
            v-model="userInfo.gender"
          ></q-select>
          <q-input
            label="出生日期"
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
          <q-input label="地区" outlined v-model="userInfo.region"></q-input>
        </q-form>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation :class="registerStep !== 3 ? '' : 'mt-6'">
          <q-btn
            v-if="registerStep !== 2"
            @click="onRegisterNext"
            color="primary"
            :label="registerStep === 3 ? '完成' : '注册'"
          />
          <q-btn
            v-if="registerStep === 1"
            class="!ml-4"
            @click="onCancelRegister"
            color="primary"
            label="返回登录"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <q-stepper
      v-if="isLogin"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="loginStep"
      ref="loginStepperRef"
      color="primary"
    >
      <q-step
        :name="1"
        title="登录"
        active-icon="how_to_reg"
        icon="how_to_reg"
        :done="loginStep > 1"
      >
        <q-form ref="loginFormRef">
          <q-input
            placeholder="example@gmail.com"
            outlined
            type="email"
            v-model="loginForm.email"
            label="邮箱"
            lazy-rules
            :rules="[
              val =>
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) ||
                '邮箱格式不正确'
            ]"
          />
          <q-input
            outlined
            type="password"
            v-model="loginForm.password"
            label="密码"
            lazy-rules
            :rules="[val => val.length >= 8 || '密码长度至少为 8 位']"
          />
          <div class="text-primary mb-4 flex justify-between">
            <div @click="onUpdatePassword" class="cursor-pointer underline">
              忘记密码
            </div>
            <div @click="onLoginWithVC" class="cursor-pointer">
              使用验证码登录
            </div>
          </div>
        </q-form>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn @click="onLogin" label="登录" color="primary" />
          <q-btn
            @click="onRegister"
            class="!ml-4"
            label="注册"
            color="primary"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <q-stepper
      v-if="isLoginWithVC"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="loginWithVCStep"
      ref="loginWithVCStepperRef"
      color="primary"
    >
      <q-step
        :name="1"
        title="邮箱"
        active-icon="email"
        icon="email"
        :done="loginWithVCStep > 1"
      >
        <q-form ref="loginWithVCFormRef">
          <q-input
            placeholder="example@gmail.com"
            outlined
            type="email"
            v-model="loginWithVCForm.email"
            label="邮箱"
            lazy-rules
            :rules="[
              val =>
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) ||
                '邮箱格式不正确'
            ]"
          />
        </q-form>
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
            class="my-4"
            autofocus
            size="xl"
            :length="pinLength"
            v-model="loginWithVCPin"
          />
        </div>
      </q-step>

      <template v-slot:navigation v-if="loginWithVCStep === 1">
        <q-stepper-navigation class="flex items-center justify-between">
          <q-btn
            @click="onLoginWithVCNext"
            label="发送验证码"
            color="primary"
          />
          <div @click="onCancleLoginWithVC" class="text-primary cursor-pointer">
            使用密码登录
          </div>
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <q-stepper
      v-if="isUpdatePassword"
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="updatePasswordStep"
      ref="updatePasswordStepperRef"
      color="primary"
    >
      <q-step
        :name="1"
        title="邮箱"
        active-icon="email"
        icon="email"
        :done="updatePasswordStep > 1"
      >
        <q-form ref="updatePasswordFormRef">
          <q-input
            placeholder="example@gmail.com"
            outlined
            type="email"
            v-model="updatePasswordForm.email"
            label="邮箱"
            lazy-rules
            :rules="[
              val =>
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) ||
                '邮箱格式不正确'
            ]"
          />
        </q-form>
      </q-step>

      <q-step
        :name="2"
        title="验证"
        active-icon="verified"
        icon="verified"
        :done="updatePasswordStep > 2"
      >
        <div>输入邮箱中收到的验证码</div>
        <UPinInput
          class="mt-4"
          autofocus
          size="xl"
          :length="pinLength"
          v-model="updatePasswordPin"
        />
      </q-step>

      <q-step :name="3" title="密码" active-icon="key" icon="key">
        <q-form ref="newPasswordFormRef">
          <q-input
            type="password"
            :rules="[val => val.length >= 8 || '密码长度至少为 8 位']"
            label="新密码"
            outlined
            v-model="newPasswordForm.newPassword"
          ></q-input>
          <q-input
            type="password"
            :rules="[val => val.length >= 8 || '密码长度至少为 8 位']"
            label="确认新密码"
            outlined
            v-model="newPasswordForm.confirmNewPassword"
          ></q-input>
        </q-form>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn
            v-if="updatePasswordStep !== 2"
            @click="onUpdatePasswordNext"
            color="primary"
            :label="updatePasswordStep === 3 ? '完成' : '发送验证码'"
          />
          <q-btn
            v-if="updatePasswordStep === 1"
            class="!ml-4"
            @click="onCancelUpadtePassword"
            color="primary"
            label="返回登录"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
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
  login,
  sendVerificationCodeToEmail,
  updatePassword
} from '@/apis'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'

let timer = null
let pause = false
const birthday = ref('未知')
const genderOptions = ['男', '女']
const pin = ref([])
const updatePasswordPin = ref([])
const loginWithVCPin = ref([])
const pinLength = 4
const registerStep = ref(1)
const loginStep = ref(1)
const loginWithVCStep = ref(1)
const updatePasswordStep = ref(1)
const registerFormRef = ref(null)
const registerStepperRef = ref(null)
const loginStepperRef = ref(null)
const loginWithVCStepperRef = ref(null)
const updatePasswordStepperRef = ref(null)
const userInfoFormRef = ref(null)
const loginWithVCFormRef = ref(null)
const loginFormRef = ref(null)
const updatePasswordFormRef = ref(null)
const newPasswordFormRef = ref(null)
const loginForm = reactive({
  email: '',
  password: ''
})
const registerForm = reactive({
  email: '',
  password: ''
})
const newPasswordForm = reactive({
  newPassword: '',
  confirmNewPassword: ''
})
const loginWithVCForm = reactive({
  email: '',
  code: ''
})
const updatePasswordForm = reactive({ email: '' })
const isLogin = ref(true)
const isRegister = ref(false)
const pemHeader = '-----BEGIN PUBLIC KEY-----'
const pemFooter = '-----END PUBLIC KEY-----'
const router = useRouter()
const { userInfo } = storeToRefs(useUserInfoStore())
const isUpdatePassword = ref(false)
const isLoginWithVC = ref(false)

const onLoginWithVCNext = async () => {
  const _step = loginWithVCStep.value

  if (_step === 1) {
    const success = await loginWithVCFormRef.value.validate()

    if (success) {
      try {
        const { email } = loginWithVCForm
        const { data: existed } = await isExistedUser(email)

        if (!existed) {
          throw new Error('邮箱不存在')
        }

        const { data: has } = await hasVerification(email, 'login')

        if (has) {
          useNotify('已经发送过验证码')
        } else {
          const { message } = await sendVerificationCodeToEmail(email, 'login')
          useNotify(message)
        }

        loginWithVCNext()
      } catch (error) {
        useNotify(error, 'negative')
      }
    }
  }
}

const onUpdatePassword = () => {
  isLogin.value = false
  isUpdatePassword.value = true
}

const onCancelUpadtePassword = () => {
  isUpdatePassword.value = false
  isLogin.value = true
}

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

const onUpdatePasswordNext = async () => {
  const _updatePasswordStep = updatePasswordStep.value

  if (_updatePasswordStep === 1) {
    const success = await updatePasswordFormRef.value.validate()

    if (success) {
      try {
        const { email } = updatePasswordForm
        const { data: existed } = await isExistedUser(email)

        if (!existed) {
          throw new Error('邮箱未注册')
        }

        const { data: has } = await hasVerification(email, 'update-password')

        if (has) {
          useNotify('已经发送过验证码')
        } else {
          const { message } = await sendVerificationCodeToEmail(
            email,
            'update-password'
          )
          useNotify(message)
        }

        updatePasswordNext()
      } catch (error) {
        useNotify(error, 'negative')
      }
    }
  } else if (_updatePasswordStep === 3) {
    const success = newPasswordFormRef.value.validate()

    if (success) {
      const { newPassword, confirmNewPassword } = newPasswordForm
      if (newPassword !== confirmNewPassword) {
        return useNotify('两次密码不一致')
      }

      try {
        const encryptedUserInfo = await getEncryptedUserInfo({
          email: updatePasswordForm.email,
          password: newPassword
        })
        const { message } = await updatePassword(encryptedUserInfo)
        isUpdatePassword.value = false
        isLogin.value = true
        updatePasswordStep.value = 1
        updatePasswordForm.email = ''
        newPasswordForm.newPassword = ''
        newPasswordForm.confirmNewPassword = ''
        updatePasswordPin.value = []
        useNotify(message)
      } catch (error) {
        useNotify(error, 'negative')
      }
    }
  }
}

const onRegisterNext = async () => {
  const _step = registerStep.value

  if (_step === 1) {
    const success = await registerFormRef.value.validate()

    if (success) {
      try {
        const { email } = registerForm
        // 先判断邮箱是否已经被注册
        const { data: existed } = await isExistedUser(email)

        if (existed) {
          throw new Error('邮箱已被注册')
        }

        // 如果邮箱没有被注册，再判断是不是给这个邮箱发送过验证码并且还没过期
        const { data: has } = await hasVerification(email, 'register')

        // 验证码存在且未过期
        if (has) {
          // 直接进行到下一步让用户输入验证码
          useNotify('已经发送过验证码')
        } else {
          const encryptedUserInfo = await getEncryptedUserInfo(registerForm)
          const { message } = await register(encryptedUserInfo)
          useNotify(message)
        }

        registerNext()
      } catch (error) {
        useNotify(error, 'negative')
      }
    }
  } else if (_step === 3) {
    const success = userInfoFormRef.value.validate()

    if (success) {
      try {
        const {
          data: { token, userInfo: _userInfo }
        } = await updateProfile(registerForm.email, userInfo.value)
        localStorage.setItem('token', token)
        userInfo.value = _userInfo
      } catch (error) {
        useNotify(error, 'negative')
      }
    }
  }
}

const onCancelRegister = () => {
  isRegister.value = false
  isLogin.value = true
}

const onRegister = () => {
  isLogin.value = false
  isRegister.value = true
}

const initTimeout = () =>
  setTimeout(() => {
    pause = false
    clearTimeout(timer)
  }, 5000)

const onLoginWithVC = () => {
  isLogin.value = false
  isLoginWithVC.value = true
}

const onCancleLoginWithVC = () => {
  isLoginWithVC.value = false
  isLogin.value = true
}

const onLogin = async () => {
  const success = await loginFormRef.value.validate()

  if (success) {
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
      const {
        data: { token, userInfo: _userInfo }
      } = await login(encryptedUserInfo)
      localStorage.setItem('token', token)
      userInfo.value = _userInfo
      router.push('/match')
      useNotify('登录成功')
    } catch (error) {
      useNotify(error, 'negative')
    }
  }
}

const loginWithVCNext = () => loginWithVCStepperRef.value.next()

const registerNext = () => registerStepperRef.value.next()

const updatePasswordNext = () => updatePasswordStepperRef.value.next()

watch(pin, async v => {
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
      const {
        data: { token, userInfo: _userInfo }
      } = await validateVerificationCode(
        'register',
        registerForm.email,
        v.join('')
      )
      localStorage.setItem('token', token)
      userInfo.value = _userInfo
      registerNext()
    } catch (error) {
      useNotify(error, 'negative')
      pin.value = []
    }
  }
})

watch(updatePasswordPin, async v => {
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
      await validateVerificationCode(
        'update-password',
        updatePasswordForm.email,
        v.join('')
      )
      updatePasswordNext()
    } catch (error) {
      useNotify(error, 'negative')
      updatePasswordPin.value = []
    }
  }
})

watch(loginWithVCPin, async v => {
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
      const {
        data: { token, userInfo: _userInfo }
      } = await validateVerificationCode(
        'login',
        loginWithVCForm.email,
        v.join('')
      )
      localStorage.setItem('token', token)
      userInfo.value = _userInfo
      router.push('/match')
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

.q-field--error .q-field__bottom {
  font-weight: 600;
}
</style>
