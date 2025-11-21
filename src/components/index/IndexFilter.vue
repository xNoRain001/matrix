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
              class="flex-1"
              v-model="filter.regionForm.province"
              :items="provinceOptions"
            />
            <USelect
              :disabled="!filter.regionForm.province"
              class="flex-1"
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
                item: 'py-1.5 has-data-[state=checked]:bg-primary'
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
            <USelectMenu
              virtualize
              v-model="filter.collegeForm.college"
              :items="colleges"
              class="w-48"
            />
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
                item: 'py-1.5 has-data-[state=checked]:bg-primary'
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
              virtualize
              class="w-48"
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
                item: 'py-1.5 has-data-[state=checked]:bg-primary'
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
              virtualize
              class="w-48"
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
                item: 'py-1.5 has-data-[state=checked]:bg-primary'
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
              class="w-48"
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
                item: 'py-1.5 has-data-[state=checked]:bg-primary'
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
    <UButton loading-auto @click="onUpdateFilter" class="mt-4" label="确定" />
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
      <ReuseFilterBodyTemplate />
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
      <ReuseFilterBodyTemplate />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useMatchStore, useUserStore } from '@/store'
import { createReusableTemplate } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

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
const colleges = await (await fetch('/json/filter/colleges.json')).json()
const provinceCityMap = await (
  await fetch('/json/filter/province-city-map.json')
).json()
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
const gameItems = await (await fetch('/json/filter/games.json')).json()
const movieItems = await (await fetch('/json/filter/movies.json')).json()
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
