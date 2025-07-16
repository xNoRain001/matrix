<template>
  <q-layout class="bg-[#010409]">
    <q-page-container>
      <q-page>
        <router-view></router-view>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const dark = ref(true)

watch(
  dark,
  v => {
    $q.dark.set(v ? false : true)
    $q.dark.toggle()
  },
  { immediate: true }
)
</script>
