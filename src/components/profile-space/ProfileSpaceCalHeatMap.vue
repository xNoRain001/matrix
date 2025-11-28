<template>
  <div
    ref="calHeatmapRef"
    class="bg-elevated/50 overflow-x-auto p-4 sm:p-6"
    style="scrollbar-width: none"
  ></div>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue'
import CalHeatmap from 'cal-heatmap'
import CalendarLabel from 'cal-heatmap/plugins/CalendarLabel'
import 'cal-heatmap/cal-heatmap.css'
import type { userInfo } from '@/types'

const props = defineProps<{ targetProfile: userInfo['profile'] }>()
const cal = new CalHeatmap()
const date = new Date()
const year = date.getFullYear()
const month = date.getMonth() + 1
const _month = month - 5
const t = _month < 1
const __month = t ? 12 + _month : _month
const _year = t ? year - 1 : year
const start = new Date(`${_year}-${String(__month).padStart(2, '0')}-01`)
const calHeatmapRef = useTemplateRef('calHeatmapRef')

const paintCalendar = () => {
  cal.paint(
    {
      theme: 'dark',
      data: {
        source: props.targetProfile.loginDates.map(date => ({
          date,
          value: 1
        })),
        type: 'json',
        x: 'date',
        y: 'value'
      },
      date: { start },
      range: 6,
      scale: {
        // 颜色映射
        color: {
          type: 'ordinal',
          domain: [0, 1],
          range: ['#2d333b', '#00b050']
        }
      },
      domain: {
        type: 'month',
        sort: 'desc',
        gutter: 4,
        label: {
          text: v => `${new Date(v).getMonth() + 1}月`,
          textAlign: 'start',
          position: 'top'
        }
      },
      subDomain: {
        type: 'day',
        radius: 2,
        width: 12,
        height: 12,
        gutter: 4
      },
      itemSelector: calHeatmapRef.value
    },
    [
      [
        CalendarLabel,
        {
          width: 30,
          textAlign: 'start',
          text: () => ['日', '', '二', '', '四', '', '六'],
          padding: [25, 0, 0, 0]
        }
      ]
    ]
  )
}

onMounted(() => paintCalendar())
</script>
