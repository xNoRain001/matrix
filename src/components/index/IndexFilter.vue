<template>
  <DefineFilterBodyTemplate>
    <UTabs :items="tabItems" v-model="activeTab" :ui="{ root: 'gap-4' }">
      <template #common>
        <UForm :state="filter.commonForm" class="space-y-4">
          <UFormField label="性别">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.commonForm.gender"
              :items="genderItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.commonForm.gender
                      ? 'text-inverted'
                      : 'text-highlighted'
                  "
                >
                  {{ label }}
                </div>
              </template>
            </URadioGroup>
          </UFormField>
          <UFormField label="年龄">
            <URadioGroup
              orientation="horizontal"
              variant="table"
              indicator="hidden"
              v-model="filter.commonForm.age"
              :items="ageItems"
              :ui="{
                item: 'bg-elevated/50 py-1.5 has-data-[state=checked]:bg-primary'
              }"
            >
              <template #label="{ item: { label, value } }">
                <div
                  :class="
                    value === filter.commonForm.age
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
              :color="province ? 'primary' : 'neutral'"
              :variant="province ? 'subtle' : 'outline'"
              class="flex-1"
              :class="province ? 'bg-elevated/50' : ''"
              v-model="province"
              :items="provinceOptions"
            />
            <USelect
              :color="city ? 'primary' : 'neutral'"
              :variant="city ? 'subtle' : 'outline'"
              class="flex-1"
              :class="city ? 'bg-elevated/50' : ''"
              v-model="city"
              :items="cityOptions"
            />
            <UButton
              @click="onSelectUndefRegion"
              :color="isUndefRegion ? 'primary' : 'neutral'"
              :variant="isUndefRegion ? 'solid' : 'outline'"
              label="不限"
            />
          </UFormField>
        </UForm>
      </template>
      <template #college>
        <UForm :state="filter.collegeForm" class="space-y-4">
          <UFormField label="高校" :ui="{ container: 'flex gap-2' }">
            <USelectMenu
              :color="filter.collegeForm.college ? 'primary' : 'neutral'"
              :variant="filter.collegeForm.college ? 'subtle' : 'outline'"
              class="w-48"
              :class="filter.collegeForm.college ? 'bg-elevated/50' : ''"
              v-model="filter.collegeForm.college"
              :items="collegeItems"
            />
            <UButton
              @click="onSelectUndefCollege"
              :color="isUndefCollege ? 'primary' : 'neutral'"
              :variant="isUndefCollege ? 'solid' : 'outline'"
              label="不限"
            />
          </UFormField>
          <UFormField label="年级">
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
          </UFormField>
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
const isUndefRegion = computed(() => filter.value.commonForm.region === '')
const isUndefCollege = computed(() => filter.value.collegeForm.college === '')
const activeTab = ref(filter.value.activeTab)
const tabItems = [
  {
    label: '常规',
    slot: 'common' as const,
    value: 'common'
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
    label: '书籍',
    slot: 'book' as const,
    value: 'book'
  },
  {
    label: '星座',
    slot: 'zodiacSign' as const,
    value: 'zodiacSign'
  }
]
const [_province, _city] = isUndefRegion.value
  ? [null, null]
  : filter.value.commonForm.region.split(' - ')
const province = ref(_province)
const city = ref(_city)
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[province.value] || [])
const genderItems = ref([
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
])
const ageItems = ref([
  {
    label: '18-24',
    value: '18-24'
  },
  {
    label: '24-30',
    value: '24-30'
  },
  {
    label: '30+',
    value: '30+'
  },
  {
    label: '不限',
    value: ''
  }
])
const collegeItems = [
  '北京大学',
  '清华大学',
  '复旦大学',
  '浙江大学',
  '南京大学',
  '上海交通大学',
  '中国科学技术大学',
  '华中科技大学',
  '武汉大学',
  '中山大学',
  '西安交通大学',
  '哈尔滨工业大学',
  '同济大学',
  '北京师范大学',
  '中国人民大学',
  '南开大学',
  '山东大学',
  '四川大学',
  '吉林大学',
  '厦门大学',
  '兰州大学',
  '西北工业大学',
  '华东师范大学',
  '北京航空航天大学',
  '天津大学',
  '东南大学',
  '中南大学',
  '大连理工大学',
  '华南理工大学'
]
const gradeItems = [
  {
    label: '大一',
    value: 'Freshman'
  },
  {
    label: '大二',
    value: 'Sophomore'
  },
  {
    label: '大三',
    value: 'Junior'
  },
  {
    label: '大四',
    value: 'Senior'
  },
  {
    label: '不限',
    value: ''
  }
]

const onUpdateFilter = async () => {
  try {
    isFilterOverlayOpen.value = false

    if (province.value && !city.value) {
      province.value = null
    }

    filter.value.activeTab = activeTab.value
    localStorage.setItem(
      `filter-${userInfo.value.id}`,
      JSON.stringify(filter.value)
    )
    toast.add({
      title: '修改成功',
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

const onSelectUndefCollege = () => {
  filter.value.collegeForm.college = ''
}

const onSelectUndefRegion = () => {
  filter.value.commonForm.region = ''
  province.value = null
  city.value = null
}

watch(province, v => {
  if (v) {
    cityOptions.value = provinceCityMap[v]
    // 切换省份时清空市区
    city.value = null
  }
})

watch(city, v => {
  // 切换省份时清空市区，此时值是空字符串
  if (v) {
    filter.value.commonForm.region = `${province.value} - ${v}`
  }
})
</script>
