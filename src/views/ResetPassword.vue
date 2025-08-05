<template>
  <div class="flex h-[calc(100vh-2rem)] items-center justify-center">
    <q-stepper
      class="w-full max-w-[var(--room-width)] !rounded-[12px] !bg-[#0d1117]"
      v-model="step"
    >
      <q-step
        :name="1"
        title="重置密码"
        active-icon="key"
        icon="key"
        :done="step > 1"
      >
        <div class="grid gap-y-4">
          <q-input
            :type="isPwd ? 'password' : 'text'"
            dense
            v-model="passwordForm.password"
            label="新密码（长度至少为 8 位）"
            outlined
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            :type="isPwd ? 'password' : 'text'"
            dense
            v-model="passwordForm.confirmPassword"
            label="确认新密码"
            outlined
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              /> </template
          ></q-input>
          <q-btn
            @click="onUpdatePassword"
            label="重置密码"
            color="primary"
            rounded
            class="full-width"
          ></q-btn>
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<script lang="ts" setup>
import { resetPassword } from '@/apis/user'
import { useEncryptUserInfo, useNotify } from '@/hooks'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const {
  query: { token }
} = useRoute()
const router = useRouter()
const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})
const isPwd = ref(true)
const step = ref(1)

const onUpdatePassword = async () => {
  if (!token) {
    return useNotify('身份错误', 'negative')
  }

  const { password, confirmPassword } = passwordForm

  if (password !== confirmPassword) {
    return useNotify('两次密码不一致', 'negative')
  }

  if (password.length < 8) {
    return useNotify('密码长度至少为 8 位', 'negative')
  }

  try {
    const encryptedUserInfo = await useEncryptUserInfo({ password })
    const { message } = await resetPassword(token, encryptedUserInfo)
    useNotify(message)
    router.replace('/login')
  } catch (error) {
    useNotify(error, 'negative')
  }
}
</script>
