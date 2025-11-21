<template>
  <template v-if="isMobile">
    <!-- 需要放在下面这些模态框之前才不会被覆盖 -->
    <USlideover
      :class="isMobile ? 'max-w-none' : ''"
      v-model:open="isUserInfoSlideoverOpen"
      title="个人资料"
      description=" "
      :ui="{ body: 'flex flex-col gap-4 sm:gap-6', description: 'hidden' }"
    >
      <template #body>
        <UPageCard
          title="注册资料"
          description="这些信息仅你可见"
          variant="naked"
          orientation="horizontal"
        />
        <UPageCard variant="subtle">
          <UFormField
            label="邮箱"
            class="flex items-center gap-2 not-last:pb-4"
            :ui="{ container: 'flex-1 flex items-center gap-2 justify-end' }"
          >
            <div class="text-dimmed w-50 truncate">
              {{ userInfo.email }}
            </div>
          </UFormField>
        </UPageCard>
        <UPageCard
          title="编辑角色资料"
          description="这些信息将公开展示"
          variant="naked"
          orientation="horizontal"
        />
        <UPageCard
          variant="subtle"
          :ui="{ container: 'divide-y divide-default' }"
        >
          <UFormField
            label="头像"
            class="flex items-center gap-2 pb-4"
            @click="isAvatarSlideoverOpen = true"
            :ui="{ container: 'flex-1 flex items-center gap-2 justify-end' }"
          >
            <UAvatar
              size="2xs"
              :src="avatarURL"
              :alt="profileForm.nickname[0]"
            />
            <UIcon name="lucide:chevron-right" class="text-dimmed size-5" />
          </UFormField>
          <UFormField
            v-for="{ label, click, key } in profileItems.slice(0, 7)"
            :key="key"
            :label="label"
            class="flex items-center gap-2 not-last:pb-4"
            @click="click"
            :ui="{
              container: 'flex items-center justify-end gap-2 flex-1 '
            }"
          >
            <span class="text-dimmed w-50 truncate text-end">
              {{ profileForm[key] }}
            </span>
            <UIcon name="lucide:chevron-right" class="text-dimmed size-5" />
          </UFormField>
        </UPageCard>
        <UPageCard
          title="编辑个人资料"
          description="这些信息将用于匹配"
          variant="naked"
          orientation="horizontal"
        />
        <UPageCard
          variant="subtle"
          :ui="{ container: 'divide-y divide-default' }"
        >
          <UFormField
            v-for="{ label, click, key } in profileItems.slice(7)"
            :key="key"
            :label="label"
            class="flex items-center gap-2 not-last:pb-4"
            @click="click"
            :ui="{
              container: 'flex items-center justify-end gap-2 flex-1 '
            }"
          >
            <span class="text-dimmed w-50 truncate text-end">
              {{
                key === 'gender'
                  ? useTransformGender(profileForm[key])
                  : key === 'birthday'
                    ? date
                      ? date.toString()
                      : ''
                    : key === 'region'
                      ? profileForm.province +
                        `${profileForm.city ? ` - ${profileForm.city}` : ''}`
                      : profileForm[key]
              }}
            </span>
            <UIcon name="lucide:chevron-right" class="text-dimmed size-5" />
          </UFormField>
        </UPageCard>
      </template>
      <template #footer>
        <UButton
          label="修改资料"
          class="w-full justify-center"
          @click="onUpdateProfile()"
          loading-auto
        />
      </template>
    </USlideover>

    <UDrawer
      v-model:open="isNicknameDrawerOpen"
      description=" "
      :ui="{
        title: 'justify-between flex items-center',
        description: 'hidden'
      }"
    >
      <template #title>
        <span>修改角色</span>
        <UButton
          @click="avatarOverlay.open({ profileForm })"
          label="选择角色"
          size="xs"
        />
      </template>
      <template #body>
        <UInput class="w-full" v-model="profileForm.nickname" maxlength="16">
          <template v-if="profileForm.nickname" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ profileForm.nickname.length }}/16
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.nickname = ''"
            />
          </template>
        </UInput>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isGenderDrawerOpen"
      title="修改性别"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <USelect
          class="w-full"
          v-model="profileForm.gender"
          :items="genderOptions"
        />
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isBirthdayDrawerOpen"
      title="修改生日"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <DatePicker v-model="date" />
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isCollegeDrawerOpen"
      title="修改学校"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <USelectMenu
          virtualize
          v-model="profileForm.college"
          :items="colleges"
          class="w-full"
        />
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isRegionDrawerOpen"
      title="修改地区"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <div class="flex gap-2">
          <USelect
            class="flex-1"
            v-model="profileForm.province"
            :items="provinceOptions"
          />
          <USelect
            :disabled="!profileForm.province"
            class="flex-1"
            v-model="profileForm.city"
            :items="cityOptions"
          />
        </div>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isBioDrawerOpen"
      title="修改角色背景故事"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <UTextarea
          v-model="profileForm.bio"
          :rows="5"
          autoresize
          class="w-full"
          maxlength="30"
          :ui="{ trailing: 'flex items-end' }"
        >
          <template v-if="profileForm.bio" #trailing>
            <div class="text-muted py-1.5 text-xs tabular-nums">
              {{ profileForm.bio.length }}/30
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.bio = ''"
            />
          </template>
        </UTextarea>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOCGenderDrawerOpen"
      title="修改角色性别"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <UInput class="w-full" v-model="profileForm.ocGender" maxlength="5">
          <template v-if="profileForm.ocGender" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ profileForm.ocGender.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.ocGender = ''"
            />
          </template>
        </UInput>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOCAgeDrawerOpen"
      title="修改角色年龄"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <UInput class="w-full" v-model="profileForm.ocAge" maxlength="5">
          <template v-if="profileForm.ocAge" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ profileForm.ocAge.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.ocAge = ''"
            />
          </template>
        </UInput>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOCHeightDrawerOpen"
      title="修改角色身高"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <UInput class="w-full" v-model="profileForm.ocHeight" maxlength="5">
          <template v-if="profileForm.ocHeight" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ profileForm.ocHeight.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.ocHeight = ''"
            />
          </template>
        </UInput>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOCWeightDrawerOpen"
      title="修改角色体重"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <UInput class="w-full" v-model="profileForm.ocWeight" maxlength="5">
          <template v-if="profileForm.ocWeight" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ profileForm.ocWeight.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.ocWeight = ''"
            />
          </template>
        </UInput>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isHeightDrawerOpen"
      title="修改身高"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <UInput class="w-full" v-model="profileForm.height" maxlength="5">
          <template v-if="profileForm.height" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ profileForm.height.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.height = ''"
            />
          </template>
        </UInput>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isWeightDrawerOpen"
      title="修改体重"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <UInput class="w-full" v-model="profileForm.weight" maxlength="5">
          <template v-if="profileForm.weight" #trailing>
            <div class="text-muted text-xs tabular-nums">
              {{ profileForm.weight.length }}/5
            </div>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="lucide:circle-x"
              @click="profileForm.weight = ''"
            />
          </template>
        </UInput>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isOCMBTIDrawerOpen"
      title="修改 MBTI"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <USelect
          class="w-full"
          v-model="profileForm.ocMBTI"
          :items="mbtiItems"
        />
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="isMBTIDrawerOpen"
      title="修改 MBTI"
      description=" "
      :ui="{
        description: 'hidden'
      }"
    >
      <template #body>
        <USelect class="w-full" v-model="profileForm.mbti" :items="mbtiItems" />
      </template>
    </UDrawer>
  </template>
  <template v-else>
    <UForm>
      <UPageCard
        title="注册资料"
        description="这些信息仅你可见"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      />
      <UPageCard variant="subtle">
        <UFormField
          label="邮箱"
          description="注册时的邮箱"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput disabled class="w-full" v-model="userInfo.email" />
        </UFormField>
      </UPageCard>
    </UForm>

    <UForm :state="profileForm">
      <UPageCard
        title="角色资料"
        description="这些信息将公开展示"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      >
        <UButton
          form="settings"
          label="保存"
          type="submit"
          class="w-fit lg:ms-auto"
          @click="onUpdateProfile"
        />
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField
          label="头像"
          description="修改头像，图片最大尺寸为 10 MB"
          class="flex items-start justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <UAvatar
              @click="viewerOverlay.open({ urls: [{ url: avatarURL }] })"
              class="cursor-pointer"
              :src="avatarURL"
              :alt="profileForm.nickname[0]"
              size="lg"
            />
            <UButton label="选择" @click="isAvatarSlideoverOpen = true" />
          </div>
        </UFormField>
        <USeparator />
        <UFormField
          label="角色"
          description="选择你的角色"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <div class="flex items-center gap-3">
            <UInput class="flex-1" v-model="profileForm.nickname">
              <template v-if="profileForm.nickname" #trailing>
                <div class="text-muted text-xs tabular-nums">
                  {{ profileForm.nickname.length }}/16
                </div>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="lucide:circle-x"
                  @click="profileForm.nickname = ''"
                />
              </template>
            </UInput>
            <UButton
              label="选择"
              @click="avatarOverlay.open({ profileForm })"
            />
          </div>
        </UFormField>
        <USeparator />
        <UFormField
          label="性别"
          description="选择你的性别"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput class="w-full" v-model="profileForm.ocGender">
            <template v-if="profileForm.ocGender" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ profileForm.ocGender.length }}/5
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.ocGender = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <USeparator />
        <UFormField
          label="年龄"
          description="选择你的年龄"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput class="w-full" v-model="profileForm.ocAge">
            <template v-if="profileForm.ocAge" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ profileForm.ocAge.length }}/5
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.ocAge = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <USeparator />
        <UFormField
          label="身高"
          description="选择你的身高"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput class="w-full" v-model="profileForm.ocHeight">
            <template v-if="profileForm.ocHeight" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ profileForm.ocHeight.length }}/5
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.ocHeight = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <USeparator />
        <UFormField
          label="体重"
          description="选择你的体重"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput class="w-full" v-model="profileForm.ocWeight">
            <template v-if="profileForm.ocWeight" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ profileForm.ocWeight.length }}/5
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.ocWeight = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <USeparator />
        <UFormField
          label="MBTI"
          description="选择你的 MBTI"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <USelect
            class="w-full"
            v-model="profileForm.ocMBTI"
            :items="mbtiItems"
          />
        </UFormField>
        <USeparator />
        <UFormField
          label="背景故事"
          description="修改背景故事"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UTextarea
            v-model="profileForm.bio"
            :rows="5"
            autoresize
            class="w-full"
            maxlength="30"
            :ui="{ trailing: 'flex items-end' }"
          >
            <template v-if="profileForm.bio" #trailing>
              <div class="text-muted py-1.5 text-xs tabular-nums">
                {{ profileForm.bio.length }}/30
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.bio = ''"
              />
            </template>
          </UTextarea>
        </UFormField>
      </UPageCard>
    </UForm>

    <UForm :state="profileForm">
      <UPageCard
        title="个人资料"
        description="这些信息将用于匹配"
        variant="naked"
        orientation="horizontal"
        class="mb-4"
      >
        <UButton
          form="settings"
          label="保存"
          type="submit"
          class="w-fit lg:ms-auto"
          @click="onUpdateProfile"
        />
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField
          label="性别"
          description="填写你的性别"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <USelect
            class="w-full"
            v-model="profileForm.gender"
            :items="genderOptions"
          />
        </UFormField>
        <USeparator />
        <UFormField
          label="生日"
          description="填写你的生日"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <DatePicker v-model="date" />
        </UFormField>
        <USeparator />
        <UFormField
          label="身高"
          description="填写你的身高"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput class="w-full" v-model="profileForm.height">
            <template v-if="profileForm.height" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ profileForm.height.length }}/5
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.height = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <USeparator />
        <UFormField
          label="体重"
          description="填写你的体重"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <UInput class="w-full" v-model="profileForm.weight">
            <template v-if="profileForm.weight" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ profileForm.weight.length }}/5
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="profileForm.weight = ''"
              />
            </template>
          </UInput>
        </UFormField>
        <USeparator />
        <UFormField
          label="MBTI"
          description="选择你的 MBTI"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <USelect
            class="w-full"
            v-model="profileForm.mbti"
            :items="mbtiItems"
          />
        </UFormField>
        <USeparator />
        <UFormField
          label="大学"
          description="填写你的大学"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <USelectMenu
            virtualize
            v-model="profileForm.college"
            :items="colleges"
            class="w-full"
          />
        </UFormField>
        <USeparator />
        <UFormField
          label="地区"
          description="填写你的地区"
          class="flex items-start justify-between gap-4"
          :ui="{ container: 'w-3/5' }"
        >
          <div class="flex gap-4">
            <USelect
              class="flex-1"
              v-model="profileForm.province"
              :items="provinceOptions"
            />
            <USelect
              :disabled="!profileForm.province"
              class="flex-1"
              v-model="profileForm.city"
              :items="cityOptions"
            />
          </div>
        </UFormField>
      </UPageCard>
    </UForm>
  </template>
  <ProfileUserInfoSlideover v-model="isAvatarSlideoverOpen" />
</template>

<script lang="ts" setup>
import { updateProfile } from '@/apis/profile'
import { mbtiItems } from '@/const'
import { useTransformGender } from '@/hooks'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { parseDate } from '@internationalized/date'
import OverlayViewer from '@/components/overlay/OverlayViewer.vue'
import OverlayAvatar from '@/components/overlay/OverlayAvatar.vue'

const isUserInfoSlideoverOpen = defineModel<boolean>({ required: false })
const toast = useToast()
const isNicknameDrawerOpen = ref(false)
const isGenderDrawerOpen = ref(false)
const isBirthdayDrawerOpen = ref(false)
const isRegionDrawerOpen = ref(false)
const isCollegeDrawerOpen = ref(false)
const isHeightDrawerOpen = ref(false)
const isWeightDrawerOpen = ref(false)
const isMBTIDrawerOpen = ref(false)
const isBioDrawerOpen = ref(false)
const isOCGenderDrawerOpen = ref(false)
const isOCAgeDrawerOpen = ref(false)
const isOCHeightDrawerOpen = ref(false)
const isOCWeightDrawerOpen = ref(false)
const isOCMBTIDrawerOpen = ref(false)
const isAvatarSlideoverOpen = ref(false)
const { isMobile, userInfo, avatarURL, globalSocket } =
  storeToRefs(useUserStore())
const profileForm = ref({ ...userInfo.value.profile })
const colleges = await (await fetch('/json/filter/colleges.json')).json()
const provinceCityMap = await (
  await fetch('/json/filter/province-city-map.json')
).json()
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[profileForm.value.province] || [])
const genderOptions = [
  {
    label: '男',
    value: 'male'
  },
  {
    label: '女',
    value: 'female'
  },
  {
    label: '保密',
    value: 'other'
  }
]
const profileItems = [
  {
    label: '角色',
    key: 'nickname',
    click: () => (isNicknameDrawerOpen.value = true)
  },
  {
    label: '性别',
    key: 'ocGender',
    click: () => (isOCGenderDrawerOpen.value = true)
  },
  {
    label: '年龄',
    key: 'ocAge',
    click: () => (isOCAgeDrawerOpen.value = true)
  },
  {
    label: '身高',
    key: 'ocHeight',
    click: () => (isOCHeightDrawerOpen.value = true)
  },
  {
    label: '体重',
    key: 'ocWeight',
    click: () => (isOCWeightDrawerOpen.value = true)
  },
  {
    label: 'MBTI',
    key: 'ocMBTI',
    click: () => (isOCMBTIDrawerOpen.value = true)
  },
  {
    label: '背景故事',
    key: 'bio',
    click: () => (isBioDrawerOpen.value = true)
  },
  {
    label: '性别',
    key: 'gender',
    click: () => (isGenderDrawerOpen.value = true)
  },
  {
    label: '生日',
    key: 'birthday',
    click: () => (isBirthdayDrawerOpen.value = true)
  },
  {
    label: '身高',
    key: 'height',
    click: () => (isHeightDrawerOpen.value = true)
  },
  {
    label: '体重',
    key: 'weight',
    click: () => (isWeightDrawerOpen.value = true)
  },
  {
    label: 'MBTI',
    key: 'mbti',
    click: () => (isMBTIDrawerOpen.value = true)
  },
  {
    label: '大学',
    key: 'college',
    click: () => (isCollegeDrawerOpen.value = true)
  },
  {
    label: '地区',
    key: 'region',
    click: () => (isRegionDrawerOpen.value = true)
  }
]
const date = shallowRef(
  profileForm.value.birthday ? parseDate(profileForm.value.birthday) : null
)
const overlay = useOverlay()
const viewerOverlay = overlay.create(OverlayViewer)
const avatarOverlay = overlay.create(OverlayAvatar)

const getUserInfoDiff = (userInfo, _profileForm) => {
  const { profile } = userInfo.value
  const keys = Object.keys(_profileForm)
  const res: any = {}

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    const value = _profileForm[key]

    if (value !== profile[key]) {
      res[key] = value
    }
  }

  // 如果修改市区，需要携带上省份
  if (res.city) {
    res.province = _profileForm.province
  }

  return res
}

const onUpdateProfile = async () => {
  const _profileForm = profileForm.value
  const _date = date.value

  if (!_profileForm.nickname) {
    toast.add({
      title: '角色名不能为空',
      color: 'error',
      icon: 'lucide:annoyed'
    })
    return
  }

  if (_date) {
    const __date = _date.toString()

    if (__date !== _profileForm.birthday) {
      _profileForm.birthday = __date
    }
  } else if (_profileForm.birthday) {
    // 在原本有日期的情况下取消选择了当前日期，那就将日期值设为 ''
    _profileForm.birthday = ''
  }

  const diff = getUserInfoDiff(userInfo, _profileForm)
  const _isMobile = isMobile.value

  if (!Object.keys(diff).length) {
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })

    if (_isMobile) {
      isUserInfoSlideoverOpen.value = false
    }

    return
  }

  try {
    const { data: token } = await updateProfile(diff)
    localStorage.setItem('token', token)
    globalSocket.value.emit('refresh-profile', token)
    userInfo.value.profile = {
      ...userInfo.value.profile,
      ...diff
    }
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })

    if (isMobile.value) {
      isUserInfoSlideoverOpen.value = false
    }
  } catch (error) {
    toast.add({
      title: error.message,
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }
}

watch(
  () => profileForm.value.province,
  v => {
    if (v) {
      cityOptions.value = provinceCityMap[v]
      profileForm.value.city = ''
    }
  }
)
</script>
