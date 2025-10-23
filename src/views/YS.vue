<template>
  <UDashboardPanel id="ys">
    <template #header>
      <UDashboardNavbar title="支援" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #trailing
          ><UBadge v-if="onlineCount" :label="onlineCount"></UBadge>
        </template>
        <template #right>
          <UButton
            icon="lucide:refresh-ccw"
            variant="ghost"
            @click="onRefresh"
          ></UButton>
          <UButton
            icon="lucide:bell"
            variant="ghost"
            @click="onClick"
          ></UButton>
          <UButton
            icon="lucide:pencil-line"
            variant="ghost"
            @click="isPublishSlideoverOpen = true"
          ></UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UForm class="flex space-x-2 sm:block">
        <USelectMenu
          icon="lucide:sword"
          placeholder="选择指定角色"
          v-model="filterState.avatar"
          value-key="value"
          :items="selectMenuItems"
          class="flex-1 sm:w-48"
        >
        </USelectMenu>
        <USelect
          icon="lucide:clock"
          placeholder="时间排序"
          v-model="filterState.createdAt"
          :items="orderItems"
          class="flex-1 sm:w-48"
        >
        </USelect>
      </UForm>
      <UPageList v-if="helpItems.length">
        <UPageCard
          v-for="(
            {
              user,
              avatar,
              count,
              _id,
              level,
              nickname,
              signature,
              worldLevel,
              finishAchievementNum,
              towerFloorIndex,
              towerLevelIndex,
              fetterCount,
              towerStarIndex,
              avatarLevel,
              // energyType,
              stygianIndex,
              stygianSeconds,
              createdAt
            },
            index
          ) in helpItems"
          :key="_id"
          variant="soft"
          class="cursor-pointer not-last:mb-2"
          :ui="{
            header: 'mb-2'
          }"
          @click="onConfirm(_id, user, index)"
        >
          <template #header>
            <UUser
              size="xl"
              :avatar="{
                src: `${VITE_OSS_BASE_URL}avatar/${user}`,
                alt: nickname[0]
              }"
              :description="signature"
              :ui="{
                root: 'items-start',
                wrapper: 'flex-1',
                name: 'flex items-start gap-2 break-all'
              }"
            >
              <template #name>
                <span>{{ nickname }}</span>
                <UBadge v-if="userInfo.id === user" label="我"></UBadge>
              </template>
            </UUser>
          </template>
          <template #body>
            <div class="flex items-start gap-2">
              <div class="relative min-w-28">
                <img
                  :src="`/images/gi-avatars/${avatar}.png`"
                  class="size-28 rounded-lg"
                />
                <UBadge
                  color="error"
                  class="absolute top-28 left-1/2 -translate-x-1/2 -translate-y-full"
                  :label="` Lv.${avatarLevel} | 库存：${count}`"
                ></UBadge>
              </div>
              <div class="flex flex-wrap items-start gap-2">
                <UBadge
                  v-if="record[user]"
                  label="已请求过支援"
                  color="warning"
                ></UBadge>
                <UBadge :label="`Lv.${level}`"></UBadge>
                <UBadge :label="`世界等级 ${worldLevel}`"></UBadge>
                <UBadge :label="`成就数 ${finishAchievementNum}`"></UBadge>
                <UBadge
                  :label="`深渊 ${towerFloorIndex}-${towerLevelIndex} | ${towerStarIndex}⭐`"
                ></UBadge>
                <UBadge
                  :label="`幽境危战 ${stygianIndex} | ${stygianSeconds}秒`"
                ></UBadge>
                <UBadge :label="`满好感度角色数量 ${fetterCount}`"></UBadge>
              </div>
            </div>
            <p class="text-muted mt-2 text-sm">
              {{ useFormatTimeAgo(createdAt) }}
            </p>
          </template>
        </UPageCard>
      </UPageList>
      <USeparator v-else class="p-4 sm:p-6" label="暂时没有人提供支援" />
      <USeparator
        v-if="helpItems.length && allPostLoaded"
        class="px-4 pt-4 sm:px-6 sm:pt-6"
        label="已经到底了"
      />
    </template>

    <template v-if="isMobile" #footer>
      <div class="h-16"></div>
    </template>
  </UDashboardPanel>

  <!-- 我的 -->
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="我的"
    description=" "
    :ui="{
      description: 'hidden'
    }"
  >
    <template #body>
      <UPageCard
        v-for="({ _id, avatar, createdAt, count }, index) in my"
        :key="_id"
        variant="soft"
        class="not-last:mb-2"
        :ui="{ body: 'w-full' }"
      >
        <template #body>
          <UUser
            :avatar="{ alt: avatarMap[avatar][0] }"
            size="xl"
            :ui="{
              root: 'items-start',
              wrapper: 'flex-1',
              name: 'flex justify-between items-start',
              description: 'flex justify-between'
            }"
          >
            <template #name>
              <span>{{ avatarMap[avatar] }}</span>
              <UButton
                label="取消支援"
                size="xs"
                color="error"
                @click="onCancelAssist(index, _id)"
                loading-auto
              ></UButton>
            </template>
            <template #description>
              <span>剩余次数：{{ count }}</span>
              <time>{{ useFormatTimeAgo(createdAt) }}</time>
            </template>
          </UUser>
        </template>
      </UPageCard>
    </template>
  </USlideover>
  <!-- 发布 -->
  <USlideover
    v-model:open="isPublishSlideoverOpen"
    :title="`支援（${assistCount + 1} / 3）`"
    description=" "
    :ui="{ body: 'space-y-4 sm:space-y-6', description: 'hidden' }"
  >
    <template #body>
      <UPageCard
        title="支援"
        description="选择你要支援的角色"
        variant="naked"
        orientation="horizontal"
        :class="isMobile ? '' : 'mb-4'"
      >
      </UPageCard>
      <USelectMenu
        v-model="assistState.avatar"
        value-key="value"
        :items="publishMenuItems"
        class="w-full"
      >
      </USelectMenu>
      <UPageCard
        title="UID"
        description="填写你的 UID"
        variant="naked"
        orientation="horizontal"
        :class="isMobile ? '' : 'mb-4'"
      ></UPageCard>
      <UInput :maxlength="9" v-model="assistState.uid" class="w-full">
        <template v-if="assistState.uid.length" #trailing>
          <div class="text-muted text-xs tabular-nums">
            {{ assistState.uid.length }}/9
          </div>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="lucide:circle-x"
            @click="assistState.uid = ''"
          />
        </template>
      </UInput>
      <UPageCard
        title="好友位"
        description="填写你能够提供的好友数量（1-50）"
        variant="naked"
        orientation="horizontal"
        :class="isMobile ? '' : 'mb-4'"
        :ui="{
          container: 'lg:grid-cols-1'
        }"
      ></UPageCard>
      <UInputNumber
        class="w-full"
        v-model="assistState.count"
        :min="1"
        :max="50"
      />
      <UButton
        class="w-full justify-center"
        label="支援"
        icon="lucide:sword"
        type="submit"
        @click="onAssist"
        loading-auto
      ></UButton>
    </template>
  </USlideover>
  <!-- 确认求助 -->
  <UModal
    v-model:open="isConfirmOverlayOpen"
    title="确认"
    :description="`确定向该用户请求支援吗，你当日还剩下 ${3 - helpCount} 次求助机会`"
  >
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        class="justify-center"
        @click="isConfirmOverlayOpen = false"
      />
      <UButton label="确认" class="justify-center" @click="onHelp" />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import {
  assistAPI,
  cancelAssistAPI,
  getAssistCountAPI,
  getAssistsAPI,
  getHelpCountAPI,
  getMyAssistsAPI,
  helpAPI
} from '@/apis/ys'
import { useFormatTimeAgo } from '@/hooks'
import { useUserStore } from '@/store'
import { useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref, watch } from 'vue'
import * as z from 'zod'

let assistId = null
let assistIndex = null
let assistUserId = null
const { VITE_OSS_BASE_URL } = import.meta.env
const assistSchema = z.object({
  avatar: z.string().min(1, '未选择角色'),
  uid: z.string().length(9, 'UID 格式不正确'),
  count: z.number().min(1).max(50, '值必须在 1 - 50 之间')
})
const { isMobile } = storeToRefs(useUserStore())
const assistState = reactive({
  avatar: '',
  uid: '',
  count: 10
})
const assistCount = ref(0)
const filterState = reactive({
  avatar: 'undef',
  createdAt: -1
})
const helpCount = ref(0)
const avatarMap = {
  undef: '',
  Albedo: '阿贝多',
  Alhaitham: '艾尔海森',
  'Arataki Itto': '荒泷一斗',
  Arlecchino: '阿蕾奇诺',
  Baizhu: '白术',
  Chasca: '恰斯卡',
  Tartaglia: '达达利亚',
  Chiori: '千织',
  Citlali: '茜特菈莉',
  Clorinde: '克洛琳德',
  Cyno: '赛诺',
  Dehya: '迪希雅',
  Diluc: '迪卢克',
  Emilie: '艾梅莉埃',
  Eula: '优菈',
  Furina: '芙宁娜',
  Ganyu: '甘雨',
  'Hu Tao': '胡桃',
  Jean: '琴',
  'Kaedehara Kazuha': '枫原万叶',
  'Kamisato Ayaka': '神里绫华',
  'Kamisato Ayato': '神里绫人',
  Keqing: '刻晴',
  Kinich: '基尼奇',
  Klee: '可莉',
  Lyney: '林尼',
  Mavuika: '玛薇卡',
  Mona: '莫娜',
  Mualani: '玛拉妮',
  Nahida: '纳西妲',
  Navia: '娜维娅',
  Neuvillette: '那维莱特',
  Nilou: '妮露',
  Qiqi: '七七',
  'Raiden Shogun': '雷电将军',
  'Sangonomiya Kokomi': '珊瑚宫心海',
  Shenhe: '申鹤',
  Sigewinne: '希格雯',
  Skirk: '丝柯克',
  Tighnari: '提纳里',
  Venti: '温迪',
  Wanderer: '流浪者',
  Wriothesley: '莱欧斯利',
  Xianyun: '闲云',
  Xiao: '魈',
  Xilonen: '希诺宁',
  'Yae Miko': '八重神子',
  Yelan: '夜兰',
  Zhongli: '钟离',
  Varesa: '瓦蕾莎',
  Yoimiya: '宵宫',
  'Yumemizuki Mizuki': '梦见月瑞希',
  Ineffa: '伊涅芙',
  Lauma: '菈乌玛',
  Flins: '菲林斯',
  Escofier: '爱可菲'
}
const publishMenuItems = [
  { label: '阿贝多', value: 'Albedo' },
  { label: '艾尔海森', value: 'Alhaitham' },
  { label: '荒泷一斗', value: 'Arataki Itto' },
  { label: '阿蕾奇诺', value: 'Arlecchino' },
  { label: '白术', value: 'Baizhu' },
  { label: '恰斯卡', value: 'Chasca' },
  { label: '达达利亚', value: 'Tartaglia' },
  { label: '千织', value: 'Chiori' },
  { label: '茜特菈莉', value: 'Citlali' },
  { label: '克洛琳德', value: 'Clorinde' },
  { label: '赛诺', value: 'Cyno' },
  { label: '迪希雅', value: 'Dehya' },
  { label: '迪卢克', value: 'Diluc' },
  { label: '艾梅莉埃', value: 'Emilie' },
  { label: '优菈', value: 'Eula' },
  { label: '芙宁娜', value: 'Furina' },
  { label: '甘雨', value: 'Ganyu' },
  { label: '胡桃', value: 'Hu Tao' },
  { label: '琴', value: 'Jean' },
  { label: '枫原万叶', value: 'Kaedehara Kazuha' },
  { label: '神里绫华', value: 'Kamisato Ayaka' },
  { label: '神里绫人', value: 'Kamisato Ayato' },
  { label: '刻晴', value: 'Keqing' },
  { label: '基尼奇', value: 'Kinich' },
  { label: '可莉', value: 'Klee' },
  { label: '林尼', value: 'Lyney' },
  { label: '玛薇卡', value: 'Mavuika' },
  { label: '莫娜', value: 'Mona' },
  { label: '玛拉妮', value: 'Mualani' },
  { label: '纳西妲', value: 'Nahida' },
  { label: '娜维娅', value: 'Navia' },
  { label: '那维莱特', value: 'Neuvillette' },
  { label: '妮露', value: 'Nilou' },
  { label: '七七', value: 'Qiqi' },
  { label: '雷电将军', value: 'Raiden Shogun' },
  { label: '珊瑚宫心海', value: 'Sangonomiya Kokomi' },
  { label: '申鹤', value: 'Shenhe' },
  { label: '希格雯', value: 'Sigewinne' },
  { label: '丝柯克', value: 'Skirk' },
  { label: '提纳里', value: 'Tighnari' },
  { label: '温迪', value: 'Venti' },
  { label: '流浪者', value: 'Wanderer' },
  { label: '莱欧斯利', value: 'Wriothesley' },
  { label: '闲云', value: 'Xianyun' },
  { label: '魈', value: 'Xiao' },
  { label: '希诺宁', value: 'Xilonen' },
  { label: '八重神子', value: 'Yae Miko' },
  { label: '夜兰', value: 'Yelan' },
  { label: '钟离', value: 'Zhongli' },
  { label: '瓦蕾莎', value: 'Varesa' },
  { label: '宵宫', value: 'Yoimiya' },
  { label: '梦见月瑞希', value: 'Yumemizuki Mizuki' },
  { label: '伊涅芙', value: 'Ineffa' },
  { label: '菈乌玛', value: 'Lauma' },
  { label: '菲林斯', value: 'Flins' },
  { label: '爱可菲', value: 'Escofier' }
]
const selectMenuItems = [{ label: '不限', value: 'undef' }, ...publishMenuItems]
const orderItems = [
  {
    label: '从新到旧',
    value: -1
  },
  {
    label: '从旧到新',
    value: 1
  }
]
const helpItems = ref([])
const toast = useToast()
const isNotificationsSlideoverOpen = ref(false)
const isPublishSlideoverOpen = ref(false)
const my = ref([])
const { userInfo, onlineCount } = storeToRefs(useUserStore())
const allPostLoaded = ref(false)
const record = ref(
  JSON.parse(localStorage.getItem(`helpRecord-${userInfo.value.id}`)) || {}
)
const isConfirmOverlayOpen = ref(false)

const onRefresh = async () => {
  if (filterState.createdAt === 1) {
    // 切换时间排序，watch 回调中发送请求
    filterState.createdAt = -1
  } else {
    const { data } = await getAssistsAPI(
      filterState,
      '',
      helpItems.value[0]?._id
    )
    const { length } = data

    if (length) {
      if (length < 10) {
        helpItems.value.unshift(...data)
      } else {
        helpItems.value = data
        allPostLoaded.value = false
      }
    } else {
      toast.add({
        title: '暂时没有新内容',
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  }
}

const onClick = async () => {
  isNotificationsSlideoverOpen.value = true
  my.value = (await getMyAssistsAPI()).data
}

const onAssist = async () => {
  if (assistCount.value >= 3) {
    toast.add({
      title: '今日支援数量已达到上限',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  if (!assistSchema.safeParse(assistState).success) {
    toast.add({
      title: '表单格式不正确',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  try {
    const { data: res } = await assistAPI(assistState)
    assistCount.value++
    toast.add({
      title: `发布成功，今日还可以支援 ${3 - assistCount.value} 次`,
      icon: 'lucide:smile'
    })
    helpItems.value.unshift(res)
    assistState.avatar = ''
    isPublishSlideoverOpen.value = false
  } catch (error) {
    toast.add({ title: error.message, color: 'error', icon: 'lucide:annoyed' })
  }
}

const onConfirm = async (id, userId, index) => {
  if (userId === userInfo.value.id) {
    toast.add({
      title: '不允许自己支援自己',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  if (helpCount.value >= 3) {
    toast.add({
      title: '次数以达到上限，请明日再试',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  assistId = id
  assistIndex = index
  assistUserId = userId
  isConfirmOverlayOpen.value = true
}

const onHelp = async () => {
  try {
    const { data: uid } = await helpAPI(assistId)
    helpCount.value++

    try {
      await navigator.clipboard.writeText(uid)
      toast.add({
        title: `复制 UID（${uid}） 成功，今日还剩 ${3 - helpCount.value} 次求助机会`,
        icon: 'lucide:smile'
      })
    } catch {
      alert(
        `复制 UID 失败，请截图记录，对方的 UID 为：${uid}，今日还剩 ${3 - helpCount.value} 次求助机会`
      )
    }
    helpItems.value[assistIndex].count--
    if (helpItems.value[assistIndex].count === 0) {
      helpItems.value.splice(helpItems.value[assistIndex], 1)
    }
    record.value[assistUserId] = true
    localStorage.setItem(
      `helpRecord-${userInfo.value.id}`,
      JSON.stringify(record.value)
    )
    isConfirmOverlayOpen.value = false
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

const onScroll = useThrottleFn(
  async e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target

    // if (!isMobile.value) {
    //   isFloatingBtnShow.value = scrollTop > 400
    // }

    if (allPostLoaded.value) {
      return
    }

    if (scrollHeight - (scrollTop + clientHeight) < 64) {
      const lastId = helpItems.value[helpItems.value.length - 1]._id
      const { data } = await getAssistsAPI(filterState, lastId)
      const { length } = data

      if (length) {
        helpItems.value.push(...data)
      }

      allPostLoaded.value = length < 10 || helpItems.value.length > 100
    }
  },
  200,
  true,
  false
)

const onCancelAssist = async (index, id) => {
  try {
    await cancelAssistAPI(id)
    my.value.splice(index, 1)
    toast.add({
      title: '成功取消',
      icon: 'lucide:smile'
    })
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

watch(filterState, async v => {
  const { data } = await getAssistsAPI(v)
  helpItems.value = data
  allPostLoaded.value = data.length < 10
})

onMounted(async () => {
  const { data } = await getAssistsAPI({ avatar: 'undef', createdAt: -1 })
  helpItems.value = data
  allPostLoaded.value = data.length < 10

  assistCount.value = (await getAssistCountAPI()).data
  helpCount.value = (await getHelpCountAPI()).data

  document
    .querySelector('#dashboard-panel-ys')
    .children[1].addEventListener('scroll', onScroll)
})
</script>
