<template>
  <q-stepper
    v-if="register"
    class="w-full max-w-[var(--room-width)] !bg-[#0d1117]"
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
      <q-form ref="formRef">
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
        v-model="pin"
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

const userInfo = ref({
  nickname: '',
  avatar: '',
  gender: '',
  birthday: '',
  region: ''
})
const birthday = ref('未知')
const genderOptions = ['男', '女']
const pin = ref([])
const pinLength = 4
const step = ref(1)
const formRef = ref(null)
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
const register = ref(false)

const onNext = () => {
  const _step = step.value

  if (_step === 1) {
    formRef.value.validate().then(success => {
      if (success) {
        next()
      }
    })
  } else if (_step === 3) {
    userInfoFormRef.value.validate().then(success => {
      if (success) {
      }
    })
  }
}

const onCancelRegister = () => (register.value = false)

const onRegister = () => (register.value = true)

const onLogin = () => {
  loginFormRef.value.validate().then(success => {
    if (success) {
    }
  })
}

const next = () => stepperRef.value.next()

watch(pin, v => {
  if (v.length === pinLength) {
    if (true) {
      // 从服务器获取用户信息
      userInfo.value = {
        nickname: '用户1234',
        avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
        gender: '未知',
        birthday: '2000/01/01',
        region: '未知'
      }
      next()
    }
  }
})
</script>

<style>
.q-stepper--horizontal .q-stepper__step-inner {
  padding-bottom: 0;
}
</style>
