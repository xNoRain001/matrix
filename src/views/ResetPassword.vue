<template>
  <div class="flex h-[calc(100vh-2rem)] w-full items-center justify-center">
    <div class="bg-elevated w-full max-w-[30rem] rounded-xl p-4">
      <div class="text-center font-bold">重置密码</div>

      <UForm
        :schema="resetPasswordSchema"
        :state="passwordForm"
        class="mt-4 space-y-4"
      >
        <UFormField name="password">
          <UInput
            class="w-full"
            v-model="passwordForm.password"
            placeholder=""
            :type="isPwd ? 'password' : 'text'"
            :ui="{ base: 'peer' }"
          >
            <label
              class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
            >
              <span class="bg-default inline-flex px-1">新密码</span>
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
            v-model="passwordForm.confirmPassword"
            placeholder=""
            :type="isPwd ? 'password' : 'text'"
            :ui="{ base: 'peer' }"
          >
            <label
              class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
            >
              <span class="bg-default inline-flex px-1">确认新密码</span>
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
        <UButton @click="onResetPassword" label="重置密码"></UButton>
      </UForm>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { resetPassword } from '@/apis/user'
import { useEncryptUserInfo } from '@/hooks'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as z from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(8, '密码长度至少为 8 位'),
  confirmPassword: z.string().min(8, '密码长度至少为 8 位')
})

const {
  query: { token }
} = useRoute()
const router = useRouter()
const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})
const isPwd = ref(true)
const toast = useToast()

const onResetPassword = async () => {
  if (!token) {
    toast.add({
      title: '身份错误',
      color: 'error'
    })
    return
  }

  if (!resetPasswordSchema.safeParse(passwordForm).success) {
    return
  }

  const { password } = passwordForm

  try {
    const encryptedUserInfo = await useEncryptUserInfo({ password })
    const { message } = await resetPassword(token, encryptedUserInfo)
    toast.add({
      title: message,
      color: 'success'
    })
    router.replace('/login')
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error'
    })
  }
}
</script>
