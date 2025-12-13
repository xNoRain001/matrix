<template>
  <div
    class="flex h-screen flex-col items-center justify-center gap-4 bg-[url('/images/bg.jpg')] bg-cover bg-center bg-no-repeat p-4 sm:gap-6 sm:p-6"
  >
    <h2
      class="text-highlighted text-center text-3xl font-bold sm:text-4xl lg:text-5xl"
    >
      即刻校园
    </h2>
    <div class="text-muted text-center text-base text-balance sm:text-lg">
      大学校园交友 | 二手交易 | 搭子 | 兼职 | 意见等一站式解决方案
    </div>
    <USelectMenu
      :disabled="disabled"
      placeholder="选择大学"
      virtualize
      v-model="college"
      :items="colleges"
      class="w-48"
    />
    <UButton
      :disabled="!college"
      loading-auto
      label="进入"
      trailing-icon="lucide:arrow-right"
      @click="onClick"
    />
  </div>
</template>
<script lang="ts" setup>
import { getCollegeAPI, loginWithFingerprint } from '@/apis/auth'
import { useEncryptUserInfo } from '@/hooks'
import fpPromise from '@fingerprintjs/fingerprintjs'
import { onMounted, ref } from 'vue'

const toast = useToast()
const college = ref('')
const colleges = await (await fetch('/json/filter/colleges.json')).json()
const fp = await fpPromise.load()
const visitorId = (await fp.get()).visitorId
// const visitorId = '632206f0f46de61b8d46f94bd4958039'
const disabled = ref(false)

const onClick = async () => {
  try {
    const encryptedUserInfo = await useEncryptUserInfo({
      visitorId,
      college: college.value
    })
    const { data: token } = await loginWithFingerprint(encryptedUserInfo)
    localStorage.setItem('token', token)
    toast.add({ title: '登录成功', icon: 'lucide:smile' })
    location.replace('/')
  } catch {
    toast.add({ title: '登录失败', color: 'error', icon: 'lucide:annoyed' })
  }
}

onMounted(async () => {
  const { data } = await getCollegeAPI(visitorId)

  if (data) {
    college.value = data
    disabled.value = true
  }
})
</script>
