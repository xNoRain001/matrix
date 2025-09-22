<template>
  <UPopover>
    <UButton
      class="w-full"
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
    >
      {{ date ? date.toString() : '选择日期' }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="date"
        :defaultPlaceholder="defaultPlaceholder"
        :min-value="minDate"
        :max-value="maxDate"
        class="p-2"
        :weekStartsOn="1"
        weekdayFormat="short"
      >
        <template #heading="{ value }">
          {{ value.split(' ')[1] }}年 {{ monthMap[value.split(' ')[0]] }}
        </template>
        <template #week-day="{ day }">
          {{ weekMap[day] }}
        </template>
      </UCalendar>
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import { monthMap, weekMap } from '@/const'
import { parseDate, CalendarDate } from '@internationalized/date'

const date = defineModel() as any
const defaultPlaceholder = date.value ? date.value : parseDate('2000-01-01')
const minDate = parseDate('1970-01-01')
const now = new Date()
const maxDate = new CalendarDate(
  now.getFullYear() - 16,
  now.getMonth() + 1,
  now.getDate()
)
</script>
