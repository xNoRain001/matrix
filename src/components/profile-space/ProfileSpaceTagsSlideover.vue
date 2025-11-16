<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isTagSlideoverOpen"
    title="标签"
    description=" "
    :ui="{ body: 'space-y-4 sm:space-y-6', description: 'hidden' }"
  >
    <template #body>
      <UPageCard
        title="新标签"
        description="创建你的新标签"
        variant="naked"
        orientation="horizontal"
        :class="isMobile ? '' : 'mb-4'"
      />
      <UInput
        :maxlength="12"
        placeholder="输入标签"
        v-model="tag"
        class="w-full"
        enterkeyhint="done"
        @keydown.enter="onCreateTag"
        :ui="{ trailing: 'pe-1' }"
      >
        <template v-if="tag.length" #trailing>
          <div class="text-muted text-xs tabular-nums">{{ tag.length }}/12</div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="tag = ''"
          />
          <UButton size="xs" label="确认" @click="onCreateTag" />
        </template>
      </UInput>
      <UPageCard
        :title="`我的标签（${tags.length} / 10）`"
        description="通过拖拽修改标签位置"
        variant="naked"
        orientation="horizontal"
        :class="isMobile ? '' : 'mb-4'"
      />
      <div ref="tagRef" class="flex flex-wrap gap-2">
        <UButton
          trailing-icon="lucide:circle-x"
          v-for="(tag, index) in tags"
          :label="tag"
          :key="tag"
          @click="onDeleteTag(tag, index)"
        />
      </div>
      <UTabs
        v-model="activeTab"
        variant="pill"
        :items="items"
        class="mt-4 w-full gap-4 sm:mt-6 sm:gap-6"
      >
        <template #content>
          <div class="grid grid-cols-3 gap-4">
            <UButton
              v-for="tag in categoryMap[activeTab]"
              :variant="tagsSet.has(tag) ? 'solid' : 'subtle'"
              :label="tag"
              class="flex justify-center"
              :ui="{
                label: 'overflow-visible whitespace-normal'
              }"
              @click="onAddTag(tag)"
            />
          </div>
        </template>
      </UTabs>
    </template>
    <template #footer>
      <UButton
        class="w-full justify-center"
        label="保存"
        @click="onUpdateTag"
      />
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef, watch } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { updateProfile } from '@/apis/profile'
import type { userInfo } from '@/types'

const isTagSlideoverOpen = defineModel<boolean>()
const props = defineProps<{
  targetId: string
  targetProfile: userInfo['profile']
}>()
const { isMobile, globalSocket, userInfo } = storeToRefs(useUserStore())
const toast = useToast()
const tag = ref('')
const tags = ref([...props.targetProfile.tags])
const tagsSet = ref(new Set([...props.targetProfile.tags]))
const tagRef = useTemplateRef('tagRef')
const activeTab = ref('self')
const items = [
  {
    label: '本体',
    value: 'self'
  },
  {
    label: '兴趣',
    value: 'interesting'
  }
]
const categoryMap = {
  self: [
    '学生党',
    '社恐',
    '社畜',
    '少年',
    '萌妹',
    '社交牛逼症',
    '上班族',
    '大龄二次元',
    '互联网民工',
    '职场菜鸟',
    '留学生',
    '创业者',
    '硬汉',
    '美术生',
    '热血青年',
    '学霸',
    '大叔',
    '学渣',
    '姐姐',
    '同人女',
    '打开正确即话痨',
    '宅女',
    '深藏不露',
    '起床气',
    '暴躁老哥',
    '夜行生物',
    '懒癌',
    '天然呆',
    '慢半拍',
    '吃瓜群众',
    '中二',
    '杠精',
    '吃货',
    'I人',
    'E人',
    '拂晓使者',
    '见多识广',
    '买买买属性大爆发',
    '先赚亿个 小目标',
    '我就看看不说话'
  ],
  interesting: [
    '游戏宅',
    'ACG通吃',
    'Steam',
    '作业积压中',
    '人菜瘾大',
    'Cos',
    'Lolita',
    '家中摆满手办',
    '绘画',
    '攻略',
    '动漫 控',
    '桌游小天才',
    '猫控',
    '烹饪',
    '轻小说',
    '偶像宅',
    '音游踩点',
    '嗑CP',
    '鬼畜',
    '汪星人',
    '汉服同袍',
    'JK制服',
    '考试预备中',
    '运动达人',
    '旧物收藏家',
    '旅行',
    '摄影',
    '游戏宅',
    'ACG通吃',
    'Steam',
    '作业积压中',
    '人菜瘾大',
    'Cos',
    'Lolita',
    '家中摆满手办',
    '绘画',
    '攻略',
    '动漫控',
    '桌游小天才',
    '猫控',
    '烹饪',
    '轻小说',
    '偶像宅',
    '音游踩点',
    '嗑CP',
    '鬼畜',
    '汪星人',
    '汉服同袍',
    'JK制服',
    '考试预备中',
    '运动达人',
    '旧物收藏家',
    '旅行',
    '摄影'
  ]
}

const onUpdateTag = async () => {
  const _tags = JSON.parse(JSON.stringify(tags.value))
  const stringifyTags = _tags.join('__separator__')
  const { profile } = userInfo.value
  const { tags: __tags } = profile
  const sameTags = stringifyTags === __tags.join('__separator__')

  if (sameTags) {
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })
    isTagSlideoverOpen.value = false
    return
  }

  const payload = {
    // 值为 __separator__ 表示清空所有标签
    ...(!sameTags && { tags: stringifyTags || '__separator__' })
  }

  try {
    const { data: token } = await updateProfile(payload)
    localStorage.setItem('token', token)
    globalSocket.value.emit('refresh-profile', token)
    profile.tags = _tags
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })
    isTagSlideoverOpen.value = false
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onDeleteTag = (tag, index) => {
  tags.value.splice(index, 1)
  tagsSet.value.delete(tag)
}

const onCreateTag = () => {
  const res = onAddTag(tag.value, true)

  if (res) {
    tag.value = ''
  }
}

const onAddTag = (tag, isCreate = false) => {
  const _tags = tags.value

  if (_tags.length >= 10) {
    toast.add({
      title: '标签数量达到上限',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return false
  }

  if (isCreate) {
    // 创建标签时需要判断标签是否已经存在
    if (tagsSet.value.has(tag)) {
      toast.add({
        title: '标签已经存在',
        color: 'error',
        icon: 'lucide:annoyed'
      })
      return false
    }
  } else {
    // 选择标签时，如果标签已经存在，取消选择该标签
    if (tagsSet.value.has(tag)) {
      const index = _tags.findIndex(item => item === tag)
      onDeleteTag(tag, index)
      return
    }
  }

  tags.value.unshift(tag)
  tagsSet.value.add(tag)
  return true
}

watch(isTagSlideoverOpen, v => {
  if (v) {
    setTimeout(() => {
      useSortable(tagRef.value, tags, { animation: 150 })
    })
  }
})
</script>
