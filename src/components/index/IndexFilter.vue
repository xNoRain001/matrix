<template>
  <DefineFilterBodyTemplate>
    <UTabs
      :items="tabItems"
      v-model="activeTab"
      :ui="{
        root: 'gap-4',
        list: 'overflow-x-auto',
        trigger: 'shrink-0'
      }"
    >
      <template #region>
        <UForm :state="filter.regionForm" class="space-y-4">
          <UFormField label="地区" :ui="{ container: 'flex gap-2' }">
            <USelect
              :color="filter.regionForm.province ? 'primary' : 'neutral'"
              :variant="filter.regionForm.province ? 'subtle' : 'outline'"
              class="flex-1"
              :class="filter.regionForm.province ? 'bg-elevated/50' : ''"
              v-model="filter.regionForm.province"
              :items="provinceOptions"
            />
            <USelect
              :color="filter.regionForm.city ? 'primary' : 'neutral'"
              :variant="filter.regionForm.city ? 'subtle' : 'outline'"
              class="flex-1"
              :class="filter.regionForm.city ? 'bg-elevated/50' : ''"
              v-model="filter.regionForm.city"
              :items="cityOptions"
            />
            <UButton
              @click="onSelectUndefRegion"
              :color="isUndefRegion ? 'primary' : 'neutral'"
              :variant="isUndefRegion ? 'solid' : 'outline'"
              label="不限"
            />
          </UFormField>
          <UFormField label="性别">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.regionForm.gender"
              :items="genderItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.regionForm.gender
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField>
          <!-- <UFormField label="年龄">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.regionForm.age"
              value-key="value"
              :items="ageItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.regionForm.age
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField> -->
        </UForm>
      </template>
      <template #college>
        <UForm :state="filter.collegeForm" class="space-y-4">
          <UFormField label="高校" :ui="{ container: 'flex gap-2' }">
            <UInput
              class="w-48"
              :color="filter.collegeForm.college ? 'primary' : 'neutral'"
              :variant="filter.collegeForm.college ? 'subtle' : 'outline'"
              :class="filter.collegeForm.college ? 'bg-elevated/50' : ''"
              v-model="filter.collegeForm.college"
              maxlength="19"
            >
              <template v-if="filter.collegeForm.college" #trailing>
                <div class="text-muted text-xs tabular-nums">
                  {{ filter.collegeForm.college.length }}/19
                </div>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="lucide:circle-x"
                  @click="filter.collegeForm.college = ''"
                />
              </template>
            </UInput>
            <!-- <UButton
              @click="onSelectUndefCollege"
              :color="isUndefCollege ? 'primary' : 'neutral'"
              :variant="isUndefCollege ? 'solid' : 'outline'"
              label="不限"
            /> -->
          </UFormField>
          <!-- <UFormField label="年级">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.collegeForm.grade"
              :items="gradeItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.collegeForm.grade
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField> -->
          <UFormField label="性别">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.collegeForm.gender"
              :items="genderItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.collegeForm.gender
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField>
        </UForm>
      </template>
      <template #game>
        <UForm :state="filter.gameForm" class="space-y-4">
          <UFormField label="游戏" :ui="{ container: 'flex gap-2' }">
            <USelectMenu
              :color="filter.gameForm.game ? 'primary' : 'neutral'"
              :variant="filter.gameForm.game ? 'subtle' : 'outline'"
              class="w-48"
              :class="filter.gameForm.game ? 'bg-elevated/50' : ''"
              v-model="filter.gameForm.game"
              :items="gameItems"
            />
          </UFormField>
          <UFormField label="性别">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.gameForm.gender"
              :items="genderItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.gameForm.gender
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField>
          <!-- <UFormField label="年龄">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.gameForm.age"
              value-key="value"
              :items="ageItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.gameForm.age
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField>
          <UFormField label="地区" :ui="{ container: 'flex gap-2' }">
            <USelect
              :color="filter.regionForm.province ? 'primary' : 'neutral'"
              :variant="filter.regionForm.province ? 'subtle' : 'outline'"
              class="flex-1"
              :class="filter.regionForm.province ? 'bg-elevated/50' : ''"
              v-model="filter.regionForm.province"
              :items="provinceOptions"
            />
            <USelect
              :color="filter.regionForm.city ? 'primary' : 'neutral'"
              :variant="filter.regionForm.city ? 'subtle' : 'outline'"
              class="flex-1"
              :class="filter.regionForm.city ? 'bg-elevated/50' : ''"
              v-model="filter.regionForm.city"
              :items="cityOptions"
            />
            <UButton
              @click="onSelectUndefRegion"
              :color="isUndefRegion ? 'primary' : 'neutral'"
              :variant="isUndefRegion ? 'solid' : 'outline'"
              label="不限"
            />
          </UFormField> -->
        </UForm>
      </template>
      <template #movie>
        <UForm :state="filter.movieForm" class="space-y-4">
          <UFormField label="电影" :ui="{ container: 'flex gap-2' }">
            <USelectMenu
              :color="filter.movieForm.movie ? 'primary' : 'neutral'"
              :variant="filter.movieForm.movie ? 'subtle' : 'outline'"
              class="w-48"
              :class="filter.movieForm.movie ? 'bg-elevated/50' : ''"
              v-model="filter.movieForm.movie"
              :items="movieItems"
            />
          </UFormField>
          <UFormField label="性别">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.movieForm.gender"
              :items="genderItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.movieForm.gender
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField>
        </UForm>
      </template>
      <template #zodiacSign>
        <UForm :state="filter.zodiacSignForm" class="space-y-4">
          <UFormField label="星座" :ui="{ container: 'flex gap-2' }">
            <USelect
              :color="filter.zodiacSignForm.zodiacSign ? 'primary' : 'neutral'"
              :variant="filter.zodiacSignForm.zodiacSign ? 'subtle' : 'outline'"
              class="w-48"
              :class="filter.zodiacSignForm.zodiacSign ? 'bg-elevated/50' : ''"
              v-model="filter.zodiacSignForm.zodiacSign"
              :items="zodiacSignItems"
            />
          </UFormField>
          <UFormField label="性别">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.zodiacSignForm.gender"
              :items="genderItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.zodiacSignForm.gender
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField>
        </UForm>
      </template>
    </UTabs>
    <UButton
      loading-auto
      @click="onUpdateFilter"
      class="mt-4"
      label="确定"
    ></UButton>
  </DefineFilterBodyTemplate>
  <UDrawer
    v-if="isMobile"
    title="筛选"
    description=" "
    :ui="{
      description: 'hidden'
    }"
    v-model:open="isFilterOverlayOpen"
  >
    <template #body>
      <ReuseFilterBodyTemplate></ReuseFilterBodyTemplate>
    </template>
  </UDrawer>
  <UModal
    v-else
    title="筛选"
    description=" "
    :ui="{
      description: 'hidden'
    }"
    v-model:open="isFilterOverlayOpen"
  >
    <template #body>
      <ReuseFilterBodyTemplate></ReuseFilterBodyTemplate>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useMatchStore, useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { provinceCityMap } from '@/const'

const toast = useToast()
const isFilterOverlayOpen = defineModel<boolean>()
const { isMobile, userInfo } = storeToRefs(useUserStore())
const { filter } = storeToRefs(useMatchStore())
const [DefineFilterBodyTemplate, ReuseFilterBodyTemplate] =
  createReusableTemplate()
const isUndefRegion = computed(() => filter.value.regionForm.province === '')
const activeTab = ref(filter.value.activeTab)
const tabItems = [
  {
    label: '地区',
    slot: 'region' as const,
    value: 'region'
  },
  {
    label: '高校',
    slot: 'college' as const,
    value: 'college'
  },
  {
    label: '游戏',
    slot: 'game' as const,
    value: 'game'
  },
  {
    label: '电影',
    slot: 'movie' as const,
    value: 'movie'
  },
  {
    label: '星座',
    slot: 'zodiacSign' as const,
    value: 'zodiacSign'
  }
]
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[filter.value.regionForm.province] || [])
const genderItems = [
  {
    label: '男',
    value: 'male'
  },
  {
    label: '女',
    value: 'female'
  },
  {
    label: '不限',
    value: ''
  }
]
// const ageItems = [
//   {
//     label: '18-24',
//     value: '18-24'
//   },
//   {
//     label: '24-30',
//     value: '24-30'
//   },
//   {
//     label: '30+',
//     value: '30-9007199254740991'
//   },
//   {
//     label: '不限',
//     value: ''
//   }
// ]
// const gradeItems = [
//   {
//     label: '大一',
//     value: 'Freshman'
//   },
//   {
//     label: '大二',
//     value: 'Sophomore'
//   },
//   {
//     label: '大三',
//     value: 'Junior'
//   },
//   {
//     label: '大四',
//     value: 'Senior'
//   },
//   {
//     label: '不限',
//     value: ''
//   }
// ]
const gameItems = [
  '原神',
  '英雄联盟',
  '绝地求生',
  'Apex英雄',
  '堡垒之夜',
  'Valorant',
  '魔兽世界',
  '最终幻想14',
  'CS:GO 2',
  '失落方舟',
  '守望先锋2',
  '命运2',
  '彩虹六号：围攻',
  'Dota 2',
  'Roblox',
  '我的世界',
  'GTA在线模式',
  '使命召唤：战区',
  '永劫无间',
  '黑色沙漠',
  '星际战甲',
  '上古卷轴Online',
  '暗黑破坏神4',
  '艾尔登法环Online',
  '赛博朋克2077在线版',
  '天涯明月刀',
  '逆水寒',
  '剑网3',
  '完美世界',
  '龙之谷2',
  '仙境传说',
  '冒险岛',
  '地下城与勇士',
  '穿越火线',
  '反恐精英Online',
  '坦克世界',
  '战舰世界',
  '战争雷霆',
  '星际公民',
  'EVE Online',
  '激战2',
  '神界：原罪2',
  '博德之门3',
  '幻塔',
  '鸣潮',
  '崩坏：星穹铁道',
  '绝区零',
  '阴阳师',
  '明日方舟',
  '碧蓝航线',
  '少女前线',
  'Fate/Grand Order',
  '王者荣耀',
  '和平精英',
  '荒野行动',
  '第五人格',
  '光遇',
  '蛋仔派对',
  'Among Us',
  '糖豆人',
  '动物森友会',
  '星露谷物语',
  '泰拉瑞亚',
  '饥荒',
  '方舟：生存进化',
  '腐蚀',
  '七日杀',
  '森林之子',
  '消逝的光芒2',
  '古墓丽影Online',
  '刺客信条：无限',
  '看门狗：军团在线',
  '全境封锁2',
  '幽灵行动：断点',
  '战地2042',
  '使命召唤19',
  '光环：无限',
  '战争机器6',
  '极限竞速：地平线6',
  '模拟人生5',
  '城市：天际线2',
  '过山车之星2',
  '动物园之星2',
  '足球经理2025',
  'FIFA 25'
]
const movieItems = [
  '肖申克的救赎',
  '霸王别姬',
  '阿甘正传',
  '这个杀手不太冷',
  '泰坦尼克号',
  '美丽人生',
  '千与千寻',
  '辛德勒的名单',
  '盗梦空间',
  '忠犬八公的故事',
  '海上钢琴师',
  '三傻大闹宝莱坞',
  '放牛班的春天',
  '星际穿越',
  '楚门的世界',
  '大话西游之大圣娶亲',
  '教父',
  '龙猫',
  '熔炉',
  '无间道',
  '疯狂动物城',
  '当幸福来敲门',
  '怦然心动',
  '触不可及',
  '蝙蝠侠：黑暗骑士',
  '乱世佳人',
  '活着',
  '少年派的奇幻漂流',
  '控方证人',
  '天堂电影院',
  '指环王3：王者无敌',
  '鬼子来了',
  '十二怒汉',
  '天空之城',
  '摔跤吧！爸爸',
  '飞屋环游记',
  '大闹天宫',
  '搏击俱乐部',
  '哈利·波特与魔法石',
  '素媛',
  '寻梦环游记',
  '何以为家',
  '七武士',
  '情书',
  '音乐之声',
  '美丽心灵',
  '海蒂和爷爷',
  '小偷家族',
  '阿凡达',
  '狮子王',
  '辩护人',
  '小鞋子',
  '沉默的羔羊',
  '本杰明·巴顿奇事',
  '幽灵公主',
  '看不见的客人',
  '饮食男女',
  '美国往事',
  '西西里的美丽传说',
  '低俗小说',
  '让子弹飞',
  '拯救大兵瑞恩',
  '蝴蝶效应',
  '穿条纹睡衣的男孩',
  '布达佩斯大饭店',
  '禁闭岛',
  '心灵捕手',
  '海豚湾',
  '玛丽和马克思',
  '上帝之城',
  '猫鼠游戏',
  '钢琴家',
  '致命魔术',
  '断背山',
  '摩登时代',
  '喜剧之王',
  '告白',
  '被嫌弃的松子的一生',
  '入殓师',
  '一一',
  '阳光灿烂的日子',
  '第六感',
  '重庆森林',
  '爱在黎明破晓前',
  '天使爱美丽',
  '7号房的礼物',
  '小森林 夏秋篇',
  '狩猎',
  '请以你的名字呼唤我',
  '萤火之森',
  '超脱',
  '完美的世界',
  '无人知晓',
  '杀人回忆',
  '借东西的小人阿莉埃蒂',
  '幸福终点站',
  '东邪西毒',
  '花样年华',
  '贫民窟的百万富翁',
  '喜宴',
  '千年女优',
  '哪吒闹海',
  '头号玩家',
  '黑天鹅',
  '你的名字。',
  '战争之王',
  '心灵奇旅',
  '地球上的星星',
  '人生果实',
  '末代皇帝',
  '源代码',
  '末路狂花',
  '初恋这件小事',
  '红辣椒',
  '波西米亚狂想曲',
  '疯狂的石头',
  '遗愿清单',
  '新世界',
  '英雄本色',
  '天书奇谭',
  '恐怖直播',
  '色，戒',
  '谍影重重3',
  '卢旺达饭店',
  '彗星来的那一夜',
  '东京物语',
  '再次出发之纽约遇见你',
  '追随',
  '驴得水',
  '寄生虫',
  '小丑',
  '绿皮书',
  '燃烧',
  '罗马',
  '婚姻故事',
  '1917',
  '乔乔的异想世界',
  '爱尔兰人',
  '阳光普照',
  '一秒钟',
  '送你一朵小红花',
  '你好，李焕英',
  '雄狮少年',
  '爱情神话',
  '瞬息全宇宙',
  '隐入尘烟',
  '流浪地球2',
  '满江红',
  '消失的她',
  '封神第一部：朝歌风云',
  '热烈',
  '八角笼中',
  '长安三万里',
  '孤注一掷',
  '涉过愤怒的海',
  '年会不能停！',
  '第二十条',
  '飞驰人生2',
  '周处除三害',
  '你想活出怎样的人生',
  '志愿军：雄兵出击',
  '三大队',
  '一闪一闪亮星星',
  '金手指',
  '潜行',
  '非诚勿扰3',
  '动物园里有什么？',
  '花千骨',
  '熊出没·逆转时空',
  '热辣滚烫',
  '目中无人2',
  '陌路狂刀',
  '来自汪星的你',
  '红毯先生',
  '我们一起摇太阳',
  '八戒之天蓬下界',
  '黄貔：天降财神猫',
  '破战',
  '戏杀',
  '银河写手',
  '大反派',
  '草木人间',
  '雪豹',
  '十月围城',
  '朝云暮雨',
  '穿过月亮的旅行',
  '没有一顿火锅解决不了的事',
  '走走停停',
  '谈判专家',
  '我才不要和你做朋友呢',
  '扫黑·决不放弃',
  '三叉戟',
  '来福大酒店'
]
const zodiacSignItems = [
  '水瓶座',
  '双鱼座',
  '白羊座',
  '金牛座',
  '双子座',
  '巨蟹座',
  '狮子座',
  '处女座',
  '天秤座',
  '天蝎座',
  '射手座',
  '摩羯座'
]

const onUpdateFilter = async () => {
  const _activeTab = activeTab.value

  if (_activeTab === 'college') {
    if (!filter.value.collegeForm.college) {
      toast.add({
        title: '保存失败，学校名不能为空',
        color: 'error',
        icon: 'lucide:annoyed'
      })
      return
    }
  } else if (_activeTab === 'game') {
    if (!filter.value.gameForm.game) {
      toast.add({
        title: '保存失败，游戏名不能为空',
        color: 'error',
        icon: 'lucide:annoyed'
      })
      return
    }
  } else if (_activeTab === 'movie') {
    if (!filter.value.movieForm.movie) {
      toast.add({
        title: '保存失败，电影名不能为空',
        color: 'error',
        icon: 'lucide:annoyed'
      })
      return
    }
  } else if (_activeTab === 'zodiacSign') {
    if (!filter.value.zodiacSignForm.zodiacSign) {
      toast.add({
        title: '保存失败，星座不能为空',
        color: 'error',
        icon: 'lucide:annoyed'
      })
      return
    }
  }

  isFilterOverlayOpen.value = false
  filter.value.activeTab = activeTab.value
  localStorage.setItem(
    `filter-${userInfo.value.id}`,
    JSON.stringify(filter.value)
  )
  toast.add({
    title: '修改成功',
    icon: 'lucide:smile'
  })
}

const onSelectUndefRegion = () => {
  filter.value.regionForm.province = ''
  filter.value.regionForm.city = ''
}

watch(
  () => filter.value.regionForm.province,
  v => {
    if (v) {
      cityOptions.value = provinceCityMap[v]
      // 切换省份时清空市区
      filter.value.regionForm.city = ''
    }
  }
)
</script>
