<template>
  <div class="flex flex-col items-center justify-center">
    <div class="w-full max-w-[var(--room-width)]">
      <q-input
        :type="isPwd ? 'password' : 'text'"
        dense
        v-model="passwordForm.password"
        label="密码（长度至少为 8 位）"
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
        label="确认密码"
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
        label="修改密码"
        color="primary"
        rounded
        class="full-width"
      ></q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { updatePassword } from '@/apis/user'
import { useEncryptUserInfo, useNotify } from '@/hooks'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const passwordForm = reactive({ password: '', confirmPassword: '' })
const isPwd = ref(true)

const onUpdatePassword = async () => {
  const { password, confirmPassword } = passwordForm

  if (password !== confirmPassword) {
    return useNotify('两次密码不一致', 'negative')
  }

  if (password.length < 8) {
    return useNotify('密码长度至少为 8 位', 'negative')
  }

  try {
    const encryptedUserInfo = await useEncryptUserInfo({ password })
    const { message } = await updatePassword(encryptedUserInfo)
    useNotify(message)
    router.push('/login')
  } catch (error) {
    useNotify(error, 'negative')
  }
}
</script>
