<template>
  <UDashboardPanel
    id="message-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <UDashboardNavbar title="消息">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
      <template #trailing>
        <UBadge :label="filteredMessages.length" variant="outline" />
      </template>

      <template #right>
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          :content="false"
          size="xs"
        />
      </template>
    </UDashboardNavbar>

    <MessageList v-model="selectedMessage" :mails="filteredMessages" />
  </UDashboardPanel>

  <MessageChat
    v-if="selectedMessage"
    :mail="selectedMessage"
    @close="selectedMessage = null"
  />
  <div v-else class="hidden flex-1 items-center justify-center lg:flex">
    <UIcon name="i-lucide-inbox" class="text-dimmed size-32" />
  </div>

  <USlideover
    v-if="!isDesktop"
    v-model:open="isMessagePanelOpen"
    title=" "
    description=" "
  >
    <template #content>
      <MessageChat
        v-if="selectedMessage"
        :mail="selectedMessage"
        @close="selectedMessage = null"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

const isDesktop = useMediaQuery('(min-width: 768px)')
const tabItems = [
  {
    label: '所有',
    value: 'all'
  },
  {
    label: '未读',
    value: 'unread'
  }
]
const activeTab = ref('all')
const messages = ref([
  {
    id: 1,
    from: {
      name: 'Alex Smith',
      email: 'alex.smith@example.com',
      avatar: { src: 'https://i.pravatar.cc/128?u=1' }
    },
    subject: 'Meeting Schedule: Q1 Marketing Strategy Review',
    body: "Dear Team,\n\nI hope this email finds you well. Just a quick reminder about our Q1 Marketing Strategy meeting scheduled for tomorrow at 10 AM EST in Conference Room A.\n\nAgenda:\n- Q4 Performance Review\n- New Campaign Proposals\n- Budget Allocation for Q2\n- Team Resource Planning\n\nPlease come prepared with your department updates. I've attached the preliminary deck for your review.\n\nBest regards,\nAlex Smith\nSenior Marketing Director\nTel: (555) 123-4567",
    date: '1970-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    unread: true,
    from: {
      name: 'Jordan Brown',
      email: 'jordan.brown@example.com',
      avatar: { src: 'https://i.pravatar.cc/128?u=2' }
    },
    subject: 'RE: Project Phoenix - Sprint 3 Update',
    body: "Hi team,\n\nQuick update on Sprint 3 deliverables:\n\n✅ User authentication module completed\n🏗️ Payment integration at 80%\n⏳ API documentation pending review\n\nKey metrics:\n- Code coverage: 94%\n- Sprint velocity: 45 points\n- Bug resolution rate: 98%\n\nPlease review the attached report for detailed analysis. Let's discuss any blockers in tomorrow's stand-up.\n\nRegards,\nJordan\n\n--\nJordan Brown\nLead Developer | Tech Solutions\nMobile: +1 (555) 234-5678",
    date: '1969-12-31T23:53:00.000Z'
  },
  {
    id: 3,
    unread: true,
    from: {
      name: 'Taylor Green',
      email: 'taylor.green@example.com',
      avatar: { src: 'https://i.pravatar.cc/128?u=3' }
    },
    subject: 'Lunch Plans',
    body: "Hi there!\n\nI was wondering if you'd like to grab lunch this Friday? There's this amazing new Mexican restaurant downtown called \"La Casa\" that I've been wanting to try. They're known for their authentic tacos and house-made guacamole.\n\nWould 12:30 PM work for you? It would be great to catch up and discuss the upcoming team building event while we're there.\n\nLet me know what you think!\n\nBest,\nTaylor",
    date: '1969-12-31T21:00:00.000Z'
  },
  {
    id: 4,
    from: {
      name: 'Morgan White',
      email: 'morgan.white@example.com',
      avatar: { src: 'https://i.pravatar.cc/128?u=4' }
    },
    subject: 'New Proposal: Project Horizon',
    body: "Hi team,\n\nI've just uploaded the comprehensive proposal for Project Horizon to our shared drive. The document includes:\n\n• Detailed project objectives and success metrics\n• Resource allocation and team structure\n• Timeline with key milestones\n• Budget breakdown\n• Risk assessment and mitigation strategies\n\nI'm particularly excited about our innovative approach to the user engagement component, which could set a new standard for our industry.\n\nCould you please review and provide feedback by EOD Friday? I'd like to present this to the steering committee next week.\n\nThanks in advance,\n\nMorgan White\nSenior Project Manager\nTel: (555) 234-5678",
    date: '1969-12-31T00:00:00.000Z'
  }
])
const filteredMessages = computed(() => {
  if (activeTab.value === 'unread') {
    return messages.value.filter(message => message.unread)
  }

  return messages.value
})
const selectedMessage = ref(null)
const isMessagePanelOpen = computed({
  get() {
    return Boolean(selectedMessage.value)
  },
  set(value: boolean) {
    if (!value) {
      selectedMessage.value = null
    }
  }
})

// 切换消息类型时，如果当前访问的消息类型不符合该类型，取消选中该消息
watch(filteredMessages, () => {
  if (
    !filteredMessages.value.find(
      message => message.id === selectedMessage.value?.id
    )
  ) {
    selectedMessage.value = null
  }
})
</script>
