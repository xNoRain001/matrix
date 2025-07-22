<template>
  <div
    class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-end"
  >
    <UPinInput size="xl" :length="pinLength" v-model="pin" />
    <q-breadcrumbs class="text-primary mt-4 cursor-pointer">
      <q-breadcrumbs-el
        label="去匹配"
        icon="near_me"
        @click="router.push(`/match/${type}`)"
      >
      </q-breadcrumbs-el>
    </q-breadcrumbs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const { type, watchPinCb } = defineProps<{
  type: 'chat' | 'audio-chat' | 'file-transfer'
  watchPinCb: Function
}>()
const pinLength = 4
const pin = ref([])
const router = useRouter()

watch(pin, v => {
  if (v.length === pinLength) {
    watchPinCb(v.join(''))
  }
})
</script>
