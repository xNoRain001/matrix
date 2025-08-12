<template>
  <div
    class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center p-4"
  >
    <div class="bg-elevated w-full max-w-[30rem] rounded-xl p-4">
      <div class="relative flex items-center justify-center">
        <UButton
          @click="backToLogin"
          v-if="!isLogin"
          class="absolute left-0"
          variant="soft"
          color="neutral"
          icon="lucide:chevron-left"
        ></UButton>
        <div class="text-center font-semibold">
          {{
            isLogin
              ? '登录'
              : isRegister
                ? '注册'
                : isLoginWithVC
                  ? '验证码登录'
                  : '重置密码'
          }}
        </div>
      </div>

      <div v-if="isLogin">
        <UForm :schema="loginSchema" :state="loginForm" class="mt-4 space-y-4">
          <UFormField name="email">
            <UInput
              class="w-full"
              v-model="loginForm.email"
              placeholder=""
              :ui="{ base: 'peer' }"
            >
              <label
                class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
              >
                <span class="bg-default inline-flex px-1">邮箱</span>
              </label>
            </UInput>
          </UFormField>
          <UFormField name="password">
            <UInput
              class="w-full"
              v-model="loginForm.password"
              placeholder=""
              :type="isPwd ? 'password' : 'text'"
              :ui="{ base: 'peer' }"
            >
              <label
                class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
              >
                <span class="bg-default inline-flex px-1">密码</span>
              </label>
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="isPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="isPwd ? 'Hide password' : 'Show password'"
                  :aria-pressed="isPwd"
                  aria-controls="password"
                  @click="isPwd = !isPwd"
                />
              </template>
            </UInput>
          </UFormField>
          <div class="text-primary flex justify-between text-sm">
            <div @click="goLoginWithVC" class="cursor-pointer">验证码登录</div>
            <div @click="goResetPassword" class="cursor-pointer">忘记密码</div>
          </div>
          <div class="space-x-2">
            <UButton @click="onLogin" label="登录" />
            <UButton @click="goRegister" label="注册" />
          </div>
        </UForm>
      </div>

      <div v-if="isRegister">
        <UForm
          :schema="registerSchema"
          :state="registerForm"
          class="mt-4 space-y-4"
        >
          <UFormField name="email">
            <UInput
              class="w-full"
              v-model="registerForm.email"
              placeholder=""
              :ui="{ base: 'peer' }"
            >
              <label
                class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
              >
                <span class="bg-default inline-flex px-1">邮箱</span>
              </label>
            </UInput>
          </UFormField>
          <UFormField name="password">
            <UInput
              class="w-full"
              v-model="registerForm.password"
              placeholder=""
              :type="isPwd ? 'password' : 'text'"
              :ui="{ base: 'peer' }"
            >
              <label
                class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
              >
                <span class="bg-default inline-flex px-1">密码</span>
              </label>
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="isPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="isPwd ? 'Hide password' : 'Show password'"
                  :aria-pressed="isPwd"
                  aria-controls="password"
                  @click="isPwd = !isPwd"
                />
              </template>
            </UInput>
          </UFormField>
          <UFormField name="confirmPassword">
            <UInput
              class="w-full"
              v-model="registerForm.confirmPassword"
              placeholder=""
              :type="isPwd ? 'password' : 'text'"
              :ui="{ base: 'peer' }"
            >
              <label
                class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
              >
                <span class="bg-default inline-flex px-1">确认密码</span>
              </label>
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="isPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="isPwd ? 'Hide password' : 'Show password'"
                  :aria-pressed="isPwd"
                  aria-controls="password"
                  @click="isPwd = !isPwd"
                />
              </template>
            </UInput>
          </UFormField>
          <UPinInput
            autofocus
            v-if="hasRegisterPin"
            :length="pinLength"
            v-model="registerPin"
          />
          <div>
            <UButton
              @click="sendRegisterPin"
              :label="`发送验证码${registerReamingTime ? `（${registerReamingTime} s）` : ''}`"
            />
          </div>
        </UForm>
      </div>

      <div v-if="isResetPassword">
        <UForm
          :schema="emailSchema"
          :state="resetPasswordForm"
          class="mt-4 space-y-4"
        >
          <UFormField name="email">
            <UInput
              class="w-full"
              v-model="resetPasswordForm.email"
              placeholder=""
              :ui="{ base: 'peer' }"
            >
              <label
                class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
              >
                <span class="bg-default inline-flex px-1">邮箱</span>
              </label>
            </UInput>
          </UFormField>
          <UButton @click="onResetPassword" label="发送链接" />
        </UForm>
      </div>

      <div v-if="isLoginWithVC">
        <UForm
          :schema="emailSchema"
          :state="loginWithVCForm"
          class="mt-4 space-y-4"
        >
          <UFormField name="email">
            <UInput
              class="w-full"
              v-model="loginWithVCForm.email"
              placeholder=""
              :ui="{ base: 'peer' }"
            >
              <label
                class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
              >
                <span class="bg-default inline-flex px-1">邮箱</span>
              </label>
            </UInput>
          </UFormField>
          <UPinInput
            autofocus
            v-if="hasLoginWithVCPin"
            :length="pinLength"
            v-model="loginWithVCPin"
          />
          <div>
            <UButton
              @click="sendLoginPin"
              :label="`发送验证码${loginWithPinReamingTime ? `（${loginWithPinReamingTime} s）` : ''}`"
            />
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, reactive, ref } from 'vue'
import { useEncryptUserInfo } from '@/hooks'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import {
  hasPin,
  hasResetPasswordURL,
  isExistedUser,
  login,
  loginWithPin,
  register,
  sendPin,
  sendResetPasswordURL
} from '@/apis/auth'
import * as z from 'zod'

const emailSchema = z.object({
  email: z.string().email('邮箱格式不正确')
})

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码长度至少为 8 位')
})

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码长度至少为 8 位'),
  confirmPassword: z
    .string()
    .refine(v => v === registerForm.password, '两次密码不一致')
})

// @ts-ignore
let loginWithPinTimer = null
// @ts-ignore
let registerTimer = null
const loginWithPinReamingTime = ref(0)
const registerReamingTime = ref(0)
const toast = useToast()
const pinLength = 4
const registerPin = ref([])
const loginWithVCPin = ref([])
const loginForm = reactive({
  email: '',
  password: ''
})
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})
const loginWithVCForm = reactive({
  email: ''
})
const resetPasswordForm = reactive({ email: '' })
const isLogin = ref(true)
const isRegister = ref(false)
const router = useRouter()
const { userInfo } = storeToRefs(useUserInfoStore())
const isResetPassword = ref(false)
const isLoginWithVC = ref(false)
const isPwd = ref(true)
const hasRegisterPin = ref(false)
const hasLoginWithVCPin = ref(false)

const backToLogin = () => {
  isResetPassword.value = false
  isLoginWithVC.value = false
  isRegister.value = false
  hasRegisterPin.value = false
  hasLoginWithVCPin.value = false
  isLogin.value = true
}

const sendLoginPin = async () => {
  if (
    loginWithPinReamingTime.value ||
    !emailSchema.safeParse(loginWithVCForm).success
  ) {
    return
  }

  const { email } = loginWithVCForm

  try {
    const { data: existed } = await isExistedUser(email)

    if (!existed) {
      throw new Error('邮箱不存在')
    }

    const time = (await hasPin(email, 'login')).data

    if (time > 0) {
      toast.add({
        title: '已经发送过验证码',
        color: 'info'
      })
      loginWithPinReamingTime.value = time
      loginWithPinTimer = setInterval(() => {
        loginWithPinReamingTime.value = loginWithPinReamingTime.value - 1
      }, 1000)
    } else {
      const { message } = await sendPin(email, 'login')
      toast.add({
        title: message,
        color: 'success'
      })
      loginWithPinReamingTime.value = 300
      loginWithPinTimer = setInterval(() => {
        loginWithPinReamingTime.value = loginWithPinReamingTime.value - 1
      }, 1000)
    }

    hasLoginWithVCPin.value = true
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error'
    })
  }
}

const goResetPassword = () => {
  isLogin.value = false
  isResetPassword.value = true
}

const onResetPassword = async () => {
  if (!emailSchema.safeParse(resetPasswordForm).success) {
    return
  }

  const { email } = resetPasswordForm

  try {
    const { data: existed } = await isExistedUser(email)

    if (!existed) {
      throw new Error('邮箱未注册')
    }

    const { data: has } = await hasResetPasswordURL(email)

    if (has) {
      toast.add({
        title: '已经发送过链接',
        color: 'info'
      })
    } else {
      const { message } = await sendResetPasswordURL(email)
      toast.add({
        title: message,
        color: 'success'
      })
    }

    backToLogin()
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error'
    })
  }
}

const sendRegisterPin = async () => {
  if (
    registerReamingTime.value ||
    !registerSchema.safeParse(registerForm).success
  ) {
    return
  }

  const { email } = registerForm

  try {
    // 先判断邮箱是否已经被注册
    const { data: existed } = await isExistedUser(email)

    if (existed) {
      throw new Error('邮箱已被注册')
    }

    // 如果邮箱没有被注册，再判断是不是给这个邮箱发送过验证码并且还没过期
    const time = (await hasPin(email, 'register')).data

    // 验证码存在且未过期
    if (time > 0) {
      toast.add({ title: '已经发送过验证码', color: 'info' })
      registerReamingTime.value = time
      // 直接进行到下一步让用户输入验证码
      registerTimer = setInterval(() => {
        registerReamingTime.value = registerReamingTime.value - 1
      }, 1000)
    } else {
      const { message } = await sendPin(email, 'register')
      toast.add({ title: message, color: 'success' })
      registerReamingTime.value = 300
      registerTimer = setInterval(() => {
        registerReamingTime.value = registerReamingTime.value - 1
      }, 1000)
    }

    hasRegisterPin.value = true
  } catch (error) {
    toast.add({ title: error.message, color: 'error' })
  }
}

const goRegister = () => {
  isLogin.value = false
  isRegister.value = true
}

const goLoginWithVC = () => {
  isLogin.value = false
  isLoginWithVC.value = true
}

const onLogin = async () => {
  if (!loginSchema.safeParse(loginForm).success) {
    return
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
    router.replace('/hall')
    toast.add({
      title: '登录成功',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: '登录失败',
      description: error.message,
      color: 'error'
    })
  }
}

watch(registerPin, async v => {
  const s = v.join('')

  if (s.length === pinLength) {
    if (!registerSchema.safeParse(registerForm).success) {
      registerPin.value.length = 0
      return toast.add({
        title: '注册表单格式不正确',
        color: 'error'
      })
    }

    const { email, password } = registerForm

    try {
      const encryptedUserInfo = await useEncryptUserInfo({
        email,
        password,
        code: s
      })
      const {
        data: { token, userInfo: _userInfo }
      } = await register(encryptedUserInfo)
      localStorage.setItem('token', token)
      userInfo.value = _userInfo
      router.replace('/hall')
      toast.add({
        title: '登录成功',
        color: 'success'
      })
    } catch (error) {
      toast.add({
        title: '注册失败',
        description: error.message,
        color: 'error'
      })
      registerPin.value.length = 0
    }
  }
})

watch(loginWithVCPin, async v => {
  const s = v.join('')

  if (s.length === pinLength) {
    if (!emailSchema.safeParse(loginWithVCForm).success) {
      loginWithVCPin.value.length = 0
      return toast.add({
        title: '登录表单格式不正确',
        color: 'error'
      })
    }

    try {
      const {
        data: { token, userInfo: _userInfo }
      } = await loginWithPin(loginWithVCForm.email, s)
      localStorage.setItem('token', token)
      userInfo.value = _userInfo
      router.replace('/hall')
      toast.add({
        title: '登录成功',
        color: 'success'
      })
    } catch (error) {
      toast.add({
        title: error.message,
        color: 'error'
      })
      loginWithVCPin.value.length = 0
    }
  }
})
</script>
