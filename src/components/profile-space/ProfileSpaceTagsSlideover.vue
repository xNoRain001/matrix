<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    v-model:open="isTagSlideoverOpen"
    title="标签"
    description=" "
    :ui="{
      body: 'space-y-4 sm:space-y-6',
      description: 'hidden'
    }"
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
        ref="inputRef"
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
          v-for="(tag, index) in tags"
          :label="tag"
          :key="tag"
          @click="onDeleteTag(tag, index)"
        />
      </div>
      <UTabs
        v-model="activeTab"
        orientation="vertical"
        :items="items"
        class="items-start gap-4 sm:gap-6"
        :ui="{
          list: 'sticky top-0'
        }"
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
const tags = ref([])
const tagsSet = ref(new Set())
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
  },
  {
    label: '生活方式',
    value: 'lifestyle'
  },
  {
    label: '娱乐消遣',
    value: 'entertainment'
  },
  {
    label: '技能特长',
    value: 'skills'
  },
  {
    label: '精神状态',
    value: 'mentality'
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
    '摄影'
  ],
  lifestyle: [
    '早睡早起',
    '夜猫子',
    '咖啡续命',
    '养生达人',
    '极简主义',
    '断舍离',
    '精致生活',
    '户外爱好者',
    '城市探索',
    '宅家万岁',
    '美食探店',
    '健身狂魔',
    '瑜伽修行',
    '阅读爱好者',
    '电影迷',
    '追剧达人',
    '音乐发烧友',
    'KTV麦霸',
    '酒吧常客',
    '茶道爱好者',
    '手工DIY',
    '绿植养护',
    '宠物家长',
    '数码控',
    '时尚潮人',
    '复古情怀',
    '环保先锋',
    '可持续生活'
  ],
  entertainment: [
    '追番狂魔',
    '综艺爱好者',
    '纪录片迷',
    '脱口秀粉丝',
    '播客听众',
    'Livehouse常客',
    '音乐节狂人',
    '漫展达人',
    '密室逃脱',
    '剧本杀高手',
    '桌游爱好者',
    '电竞观众',
    '云玩家',
    '二创作者',
    '弹幕互动',
    '评论区战神',
    '打卡达人',
    '网红店探索',
    '主题乐园',
    '电影院常客',
    '游戏直播',
    '虚拟主播',
    '明星应援',
    '饭圈女孩'
  ],
  skills: [
    '编程大神',
    '设计达人',
    '文案高手',
    '摄影大师',
    '视频剪辑',
    '后期特效',
    '音乐制作',
    '乐器演奏',
    '舞蹈专业',
    '绘画大师',
    '书法爱好者',
    '外语达人',
    '翻译专家',
    '数据分析',
    '数学天才',
    '物理大神',
    '化学实验',
    '生物研究',
    '历史通晓',
    '地理专家',
    '心理学爱好者',
    '经济学分析',
    '法律知识',
    '医学常识',
    '急救技能',
    '驾驶高手',
    '维修能手',
    '手工制作'
  ],
  mentality: [
    '乐观向上',
    '积极进取',
    '佛系青年',
    '躺平主义',
    '内卷达人',
    '焦虑患者',
    '抑郁情绪',
    '压力山大',
    '情绪稳定',
    '心态平和',
    '容易emo',
    '玻璃心',
    '钢铁意志',
    '敏感细腻',
    '理性分析',
    '感性思考',
    '理想主义',
    '现实主义',
    '浪漫情怀',
    '务实作风',
    '冒险精神',
    '谨慎小心',
    '自信满满',
    '自卑情绪',
    '自我怀疑',
    '坚定信念',
    '迷茫困惑',
    '目标明确'
  ]
}

const onUpdateTag = async () => {
  const _tags = JSON.parse(JSON.stringify(tags.value))
  const stringifyTags = _tags.join('__separator__')
  const { profile } = userInfo.value
  const __tags = profile.ocTags
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
    ...(!sameTags && {
      ocTags: stringifyTags || '__separator__'
    })
  }

  try {
    const { data: token } = await updateProfile(payload)
    localStorage.setItem('token', token)
    globalSocket.value.emit('refresh-profile', token)
    profile.ocTags = _tags
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

watch(activeTab, () => {
  ;(tagRef.value.parentNode as HTMLElement).scrollTo({
    top: 0,
    behavior: 'smooth'
  })
})

watch(isTagSlideoverOpen, v => {
  if (v) {
    const __tags = [...props.targetProfile.ocTags]
    tags.value = __tags
    tagsSet.value = new Set([...__tags])
    setTimeout(() => {
      useSortable(tagRef.value, tags, { animation: 150 })
    })
  }
})
</script>
