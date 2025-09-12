<template>
  <UDropdownMenu :items="dropdownItems">
    <UButton icon="lucide:ellipsis" color="neutral" variant="ghost" />
  </UDropdownMenu>
</template>

<script lang="ts" setup>
import { addCandidate, deleteCandidate } from '@/apis/contact'
import { useRecentContactsStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{ targetId: string }>()
const toast = useToast()
const { contactList, contactProfileMap } = storeToRefs(useRecentContactsStore())
const { globalSocket, userInfo } = storeToRefs(useUserStore())
const isFriend = computed(() =>
  Boolean(contactProfileMap.value[props.targetId])
)
const dropdownItems = computed(() =>
  isFriend.value
    ? [
        [
          {
            label: '清空聊天列表',
            icon: 'i-lucide-star'
          },
          {
            label: '清空聊天记录',
            icon: 'i-lucide-star'
          }
        ],
        [
          {
            label: '备注',
            icon: 'i-lucide-check-circle',
            onSelect: () => {}
          },
          {
            label: '顶置聊天',
            icon: 'i-lucide-check-circle',
            onSelect: () => {}
          },
          {
            label: '删除好友',
            icon: 'i-lucide-triangle-alert',
            onSelect: async () => {
              try {
                const { targetId } = props
                await deleteCandidate(targetId)
                toast.add({ title: '删除好友成功' })
                const { id, nickname } = userInfo.value
                const notification = {
                  id,
                  content: '将你从好友列表中移除了',
                  createdAt: Date.now(),
                  profile: {
                    nickname
                  }
                }
                const _contactList = contactList.value
                const _contactProfileMap = contactProfileMap.value
                const index = _contactList.findIndex(
                  item => item.id === targetId
                )

                if (index >= 0) {
                  _contactList.splice(index, 1)
                  delete _contactProfileMap[targetId]
                  localStorage.setItem(
                    `contactList-${id}`,
                    JSON.stringify(_contactList)
                  )
                  localStorage.setItem(
                    `contactProfileMap-${id}`,
                    JSON.stringify(_contactProfileMap)
                  )
                }

                // TODO: 删除聊天记录和 lastMsg

                globalSocket.value.emit(
                  'delete-contact',
                  targetId,
                  notification
                )
              } catch (error) {
                toast.add({
                  title: error.message,
                  color: 'error',
                  icon: 'lucide:annoyed'
                })
              }
            }
          }
        ]
      ]
    : [
        [
          {
            label: '清空聊天列表',
            icon: 'i-lucide-star'
          },
          {
            label: '清空聊天记录',
            icon: 'i-lucide-star'
          }
        ],
        [
          {
            label: '添加好友',
            icon: 'i-lucide-check-circle',
            onSelect: async () => {
              try {
                await addCandidate(props.targetId)
                toast.add({ title: '已向对方发送好友申请' })
                const { id, nickname, region, birthday, gender } =
                  userInfo.value
                const notification = {
                  id,
                  content: '请求添加你为好友',
                  type: 'add-contact',
                  createdAt: Date.now(),
                  profile: {
                    nickname,
                    region,
                    birthday,
                    gender
                  }
                }
                globalSocket.value.emit(
                  'add-contact',
                  props.targetId,
                  notification
                )
              } catch (error) {
                toast.add({
                  title: error.message,
                  color: 'error',
                  icon: 'lucide:annoyed'
                })
              }
            }
          }
        ]
      ]
)
</script>
