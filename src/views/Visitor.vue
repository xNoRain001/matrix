<template>
  <UPageSection
    title="矩阵"
    description="欢迎进入 Z 世代的多元宇宙：你的灵魂，由你定义。"
    :features="features"
    :links="links"
  />
</template>
<script lang="ts" setup>
import { loginWithFingerprint } from '@/apis/auth'
import { useEncryptUserInfo } from '@/hooks'
import fpPromise from '@fingerprintjs/fingerprintjs'

const toast = useToast()
const features = [
  {
    title: '全国互联',
    description: '打破时空边界，发现共振频率。山海皆无距，知交在眼前',
    icon: 'lucide:map-pin'
  },
  {
    title: '高校匹配',
    description:
      '精准校友雷达，解锁你的校园「平行宇宙」。没有朋友？或许 TA 就在隔壁教学楼。',
    icon: 'lucide:graduation-cap'
  },
  {
    title: '兴趣匹配',
    description:
      '从「游戏」到「电影」，精准捕捉你的同好。拒绝尬聊，从共享热爱开始。',
    icon: 'lucide:heart'
  },
  {
    title: '情绪切片',
    description:
      '记录每一个转瞬即逝的情绪坐标，总有同频共振在此刻回应。在这里，你的所有情绪都值得被看见。',
    icon: 'lucide:activity'
  },
  {
    title: 'OC',
    description:
      '不当现实副本，只做原创主角。亲手捏一个「我」，从此人设不撞车。',
    icon: 'lucide:pencil-line'
  },
  {
    title: 'OOC',
    description: '跳出设定框，体验「灵魂出窍」的快乐。今天的你，由你自己定义。',
    icon: 'lucide:palette'
  }
]
const links = [
  {
    label: '进入',
    trailingIcon: 'lucide:arrow-right',
    onclick: async () => {
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
  }
]
</script>
