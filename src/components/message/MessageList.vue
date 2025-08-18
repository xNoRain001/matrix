<template>
  <div class="divide-default divide-y overflow-y-auto">
    <div
      v-for="(mail, index) in mails"
      :key="index"
      :ref="
        el => {
          mailsRefs[mail.id] = el as Element
        }
      "
    >
      <div
        class="flex cursor-pointer items-center gap-4 border-l-2 p-4 text-sm transition-colors sm:px-6"
        :class="[
          mail.unread ? 'text-highlighted' : 'text-toned',
          selectedMail && selectedMail.id === mail.id
            ? 'border-primary bg-primary/10'
            : 'hover:border-primary hover:bg-primary/5 border-(--ui-bg)'
        ]"
        @click="selectedMail = mail"
      >
        <UChip inset color="error" :text="5" size="3xl">
          <UAvatar :text="mail.from.name[0]"></UAvatar>
        </UChip>
        <div>
          <div
            class="flex items-center justify-between"
            :class="[mail.unread && 'font-semibold']"
          >
            <div class="flex items-center gap-3">
              {{ mail.from.name }}

              <UChip :color="Math.random() > 0.5 ? 'primary' : 'error'" />
            </div>

            <span>17:20</span>
            <!-- <span>{{
            isToday(new Date(mail.date))
              ? format(new Date(mail.date), 'HH:mm')
              : format(new Date(mail.date), 'dd MMM')
          }}</span> -->
          </div>
          <!-- <p class="truncate" :class="[mail.unread && 'font-semibold']">
          {{ mail.subject }}
        </p> -->
          <p class="text-dimmed line-clamp-1">
            {{ mail.body }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// import { format, isToday } from 'date-fns'
// import type { Mail } from '../../types'

const props = defineProps<{
  mails: any
}>()

const mailsRefs = ref<Element[]>([])

const selectedMail = defineModel() as any

watch(selectedMail, () => {
  if (!selectedMail.value) {
    return
  }
  const ref = mailsRefs.value[selectedMail.value.id]
  if (ref) {
    ref.scrollIntoView({ block: 'nearest' })
  }
})

defineShortcuts({
  arrowdown: () => {
    const index = props.mails.findIndex(
      mail => mail.id === selectedMail.value?.id
    )

    if (index === -1) {
      selectedMail.value = props.mails[0]
    } else if (index < props.mails.length - 1) {
      selectedMail.value = props.mails[index + 1]
    }
  },
  arrowup: () => {
    const index = props.mails.findIndex(
      mail => mail.id === selectedMail.value?.id
    )

    if (index === -1) {
      selectedMail.value = props.mails[props.mails.length - 1]
    } else if (index > 0) {
      selectedMail.value = props.mails[index - 1]
    }
  }
})
</script>
