<template>
  <div
    class="absolute top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center bg-[url(/images/bg.jpg)] bg-cover bg-center bg-no-repeat p-4"
  >
    <UButton
      icon="lucide:fingerprint"
      variant="ghost"
      :ui="{
        leadingIcon: 'size-16'
      }"
      @click="onLoginWithFingerprint"
    ></UButton>
  </div>
</template>

<script lang="ts" setup>
import { loginWithFingerprint } from '@/apis/auth'
import { useEncryptUserInfo, useRequestFullscreen } from '@/hooks'
import fpPromise from '@fingerprintjs/fingerprintjs'

const toast = useToast()

const onLoginWithFingerprint = async () => {
  try {
    const fp = await fpPromise.load()
    const visitorId = (await fp.get()).visitorId
    // const visitorId = '632206f0f46de61b8d46f94bd4958039'
    const encryptedUserInfo = await useEncryptUserInfo({ visitorId })
    const { data: token } = await loginWithFingerprint(encryptedUserInfo)
    localStorage.setItem('token', token)
    toast.add({ title: '登录成功', icon: 'lucide:smile' })
    location.replace('/')
  } catch {
    toast.add({ title: '登录失败', color: 'error', icon: 'lucide:annoyed' })
  }
}
</script>
