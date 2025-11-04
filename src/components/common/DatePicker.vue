<template>
  <UPopover>
    <UButton
      class="w-full"
      color="neutral"
      variant="outline"
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
        :weekStartsOn="0"
      >
      </UCalendar>
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
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
