<template>
  <DefineSlideoverBodyTemplate>
    <UPageCard variant="subtle">
      <UForm
        :schema="schema"
        :state="passwordForm"
        class="space-y-4"
        @submit="onUpdatePassword"
      >
        <UFormField name="oldPassword">
          <UInput
            class="w-full"
            v-model="passwordForm.oldPassword"
            placeholder=""
            :type="isPwd ? 'password' : 'text'"
            :ui="{ base: 'peer' }"
          >
            <label
              class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-2.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-medium"
            >
              <span class="bg-default inline-flex px-1">旧密码</span>
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
        <UFormField name="password">
          <UInput
            class="w-full"
            v-model="passwordForm.password"
            placeholder=""
            :type="isPwd ? 'password' : 'text'"
            :ui="{ base: ' peer' }"
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
            <!-- class="text-highlighted peer-focus:text-highlighted peer-placeholder-shown:text-dimmed pointer-events-none absolute -top-1.5 left-0 px-1.5 text-xs font-medium transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-focus:-top-1.5 peer-focus:text-xs peer-focus:font-medium" -->
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
        <UButton loading-auto type="submit">修改密码</UButton>
      </UForm>
    </UPageCard>
  </DefineSlideoverBodyTemplate>
  <USlideover
    v-if="isMobile"
    v-model:open="isUpdatePasswordSlideoverOpen"
    title="修改密码"
    description=" "
  >
    <template #body>
      <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
    </template>
  </USlideover>
  <template v-else>
    <ReuseSlideoverBodyTemplate></ReuseSlideoverBodyTemplate>
    <UPageCard
      title="账号"
      description="不再想使用我们的服务？您可以在此处删除您的帐户。此操作不可逆，与此帐户相关的所有信息都将被永久删除。"
      class="from-error/10 to-default bg-gradient-to-tl from-5%"
    >
      <template #footer>
        <UButton label="注销账号" color="error" />
      </template>
    </UPageCard>
  </template>
</template>

<script setup lang="ts">
import { updatePassword } from '@/apis/user'
import { useEncryptUserInfo } from '@/hooks'
import { useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as z from 'zod'

const isUpdatePasswordSlideoverOpen = defineModel<boolean>({ required: false })
const [DefineSlideoverBodyTemplate, ReuseSlideoverBodyTemplate] =
  createReusableTemplate()
const schema = z.object({
  oldPassword: z.string().min(8, '密码长度至少为 8 位'),
  password: z.string().min(8, '密码长度至少为 8 位'),
  confirmPassword: z
    .string()
    .refine(
      () => passwordForm.password === passwordForm.confirmPassword,
      '新密码不一致'
    )
})
const passwordForm = reactive({
  oldPassword: '',
  password: '',
  confirmPassword: ''
})
const isPwd = ref(true)
const toast = useToast()
const router = useRouter()
const { isMobile } = storeToRefs(useUserStore())

const onUpdatePassword = async () => {
  const { oldPassword, password } = passwordForm

  try {
    const encryptedUserInfo = await useEncryptUserInfo({
      oldPassword,
      password
    })
    const { message } = await updatePassword(encryptedUserInfo)
    toast.add({
      title: message,
      icon: 'lucide:smile'
    })
    localStorage.removeItem('token')
    router.replace('/login')
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}
</script>
