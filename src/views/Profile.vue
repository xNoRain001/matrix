<template>
  <div class="flex flex-col items-center">
    <div class="w-full max-w-[var(--room-width)]">
      <div v-if="!isDefaultPanel" class="flex items-center">
        <q-btn
          dense
          flat
          round
          @click="onBackFromProfile"
          icon="arrow_back_ios_new"
        ></q-btn>
        <div class="absolute left-1/2 -translate-x-1/2 text-base">
          {{ tip }}
        </div>
      </div>

      <q-tab-panels
        :class="isDefaultPanel ? '' : 'mt-4'"
        class="bg-x-card rounded-[12px]"
        v-model="panel"
        animated
      >
        <q-tab-panel name="default">
          <q-list>
            <q-item
              class="rounded-[12px]"
              @click="onUpdatePanel('profile')"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">个人资料</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              class="rounded-[12px]"
              @click="onUpdatePanel('updatePassword')"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">修改密码</q-item-section>
              <q-item-section side class="!text-gray-500">
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item class="rounded-[12px]" @click="onLogout" clickable v-ripple>
              <q-item-section class="text-base">退出登录</q-item-section>
              <q-item-section side class="!text-gray-500">
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="profile">
          <q-list>
            <!-- <q-item class="rounded-[12px]" clickable v-ripple>
              <q-item-section class="text-base">头像</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <img class="w-[32px] rounded-full" :src="userInfo.avatar" />
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator /> -->
            <q-item
              class="rounded-[12px]"
              @click="onEditNickname"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">昵称</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>{{ userInfo.nickname }}</div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              class="rounded-[12px]"
              @click="onEditGender"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">性别</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>
                  {{
                    userInfo.gender === 'other'
                      ? '未知'
                      : userInfo.gender === 'male'
                        ? '男'
                        : '女'
                  }}
                </div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              class="rounded-[12px]"
              @click="onEditBirthday"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">生日</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>
                  {{ !userInfo.birthday ? '未知' : userInfo.birthday }}
                </div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              @click="onEditRegion"
              class="rounded-[12px]"
              clickable
              v-ripple
            >
              <q-item-section class="text-base">地区</q-item-section>
              <q-item-section
                side
                class="flex !flex-row !items-center !text-gray-500"
              >
                <div>{{ userInfo.region }}</div>
                <q-icon name="arrow_forward_ios" class="ml-2"></q-icon>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="updatePassword" class="grid gap-y-4">
          <q-input
            :type="isPwd ? 'password' : 'text'"
            dense
            v-model="passwordForm.oldPassword"
            label="旧密码"
            outlined
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            :type="isPwd ? 'password' : 'text'"
            dense
            v-model="passwordForm.password"
            label="新密码（长度至少为 8 位）"
            outlined
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            :type="isPwd ? 'password' : 'text'"
            dense
            v-model="passwordForm.confirmPassword"
            label="确认新密码"
            outlined
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              /> </template
          ></q-input>
          <q-btn
            @click="onUpdatePassword"
            label="修改密码"
            color="primary"
            rounded
            class="full-width"
          ></q-btn>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <q-dialog v-model="showBirthdayDialog" :position="dialogPosition">
      <q-date v-model="userInfo.birthday" :locale="dateLocale">
        <div class="flex justify-end">
          <q-btn
            rounded
            class="!mr-4"
            v-close-popup
            label="取消"
            color="primary"
          />
          <q-btn rounded v-close-popup label="确认" color="primary" />
        </div>
      </q-date>
    </q-dialog>

    <q-dialog v-model="showRegionDialog" :position="dialogPosition">
      <div class="bg-x-card w-full">
        <q-select
          filled
          v-model="province"
          use-input
          input-debounce="0"
          label="省份"
          :options="provinceOptions"
          @filter="filterProvinceFn"
          behavior="menu"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">未找到结果</q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select
          :disable="!province"
          filled
          v-model="city"
          label="市区"
          :options="cityOptions"
          behavior="menu"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">未找到结果</q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { updatePassword, updateProfile } from '@/apis/user'
import { dateLocale } from '@/const'
import { useDialog, useEncryptUserInfo, useLogout, useNotify } from '@/hooks'
import { useDeviceInfoStore, useUserInfoStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const { isMobile } = useDeviceInfoStore()
const panel = ref('default')
const showBirthdayDialog = ref(false)
const showRegionDialog = ref(false)
const { userInfo } = storeToRefs(useUserInfoStore())
const _userInfo = userInfo.value
let oldUserInfo = JSON.parse(JSON.stringify(_userInfo))
const router = useRouter()
const passwordForm = reactive({
  oldPassword: '',
  password: '',
  confirmPassword: ''
})
const isPwd = ref(true)
const tip = ref('')
const tipMap = {
  profile: '个人资料',
  updatePassword: '修改密码'
}
const isDefaultPanel = computed(() => panel.value === 'default')
const { region } = _userInfo
const [_province, _city] = region === '未知' ? ['', ''] : region.split(' - ')
const province = ref(_province)
const city = ref(_city)
const provinceCityMap = {
  // 直辖市
  北京市: [
    '东城区',
    '西城区',
    '朝阳区',
    '丰台区',
    '石景山区',
    '海淀区',
    '顺义区',
    '通州区',
    '大兴区',
    '房山区',
    '门头沟区',
    '昌平区',
    '平谷区',
    '密云区',
    '延庆区'
  ],
  天津市: [
    '和平区',
    '河东区',
    '河西区',
    '南开区',
    '河北区',
    '红桥区',
    '滨海新区',
    '东丽区',
    '西青区',
    '津南区',
    '北辰区',
    '武清区',
    '宝坻区',
    '宁河区',
    '静海区',
    '蓟州区'
  ],
  上海市: [
    '黄浦区',
    '徐汇区',
    '长宁区',
    '静安区',
    '普陀区',
    '虹口区',
    '杨浦区',
    '浦东新区',
    '闵行区',
    '宝山区',
    '嘉定区',
    '金山区',
    '松江区',
    '青浦区',
    '奉贤区',
    '崇明区'
  ],
  重庆市: [
    '渝中区',
    '大渡口区',
    '江北区',
    '沙坪坝区',
    '九龙坡区',
    '南岸区',
    '北碚区',
    '渝北区',
    '巴南区',
    '涪陵区',
    '綦江区',
    '大足区',
    '长寿区',
    '江津区',
    '合川区',
    '永川区',
    '南川区',
    '璧山区',
    '铜梁区',
    '潼南区',
    '荣昌区',
    '开州区',
    '梁平区',
    '武隆区',
    '城口县',
    '丰都县',
    '垫江县',
    '忠县',
    '云阳县',
    '奉节县',
    '巫山县',
    '巫溪县',
    '石柱土家族自治县',
    '秀山土家族苗族自治县',
    '酉阳土家族苗族自治县',
    '彭水苗族土家族自治县'
  ],

  // 省份及自治区
  河北省: [
    '石家庄市',
    '唐山市',
    '秦皇岛市',
    '邯郸市',
    '邢台市',
    '保定市',
    '张家口市',
    '承德市',
    '沧州市',
    '廊坊市',
    '衡水市'
  ],
  山西省: [
    '太原市',
    '大同市',
    '阳泉市',
    '长治市',
    '晋城市',
    '朔州市',
    '晋中市',
    '运城市',
    '忻州市',
    '临汾市',
    '吕梁市'
  ],
  内蒙古自治区: [
    '呼和浩特市',
    '包头市',
    '乌海市',
    '赤峰市',
    '通辽市',
    '鄂尔多斯市',
    '呼伦贝尔市',
    '巴彦淖尔市',
    '乌兰察布市'
  ],
  辽宁省: [
    '沈阳市',
    '大连市',
    '鞍山市',
    '抚顺市',
    '本溪市',
    '丹东市',
    '锦州市',
    '营口市',
    '阜新市',
    '辽阳市',
    '盘锦市',
    '铁岭市',
    '朝阳市',
    '葫芦岛市'
  ],
  吉林省: [
    '长春市',
    '吉林市',
    '四平市',
    '辽源市',
    '通化市',
    '白山市',
    '松原市',
    '白城市'
  ],
  黑龙江省: [
    '哈尔滨市',
    '齐齐哈尔市',
    '鸡西市',
    '鹤岗市',
    '双鸭山市',
    '大庆市',
    '伊春市',
    '佳木斯市',
    '七台河市',
    '牡丹江市',
    '黑河市',
    '绥化市'
  ],
  江苏省: [
    '南京市',
    '无锡市',
    '徐州市',
    '常州市',
    '苏州市',
    '南通市',
    '连云港市',
    '淮安市',
    '盐城市',
    '扬州市',
    '镇江市',
    '泰州市',
    '宿迁市'
  ],
  浙江省: [
    '杭州市',
    '宁波市',
    '温州市',
    '嘉兴市',
    '湖州市',
    '绍兴市',
    '金华市',
    '衢州市',
    '舟山市',
    '台州市',
    '丽水市'
  ],
  安徽省: [
    '合肥市',
    '芜湖市',
    '蚌埠市',
    '淮南市',
    '马鞍山市',
    '淮北市',
    '铜陵市',
    '安庆市',
    '黄山市',
    '阜阳市',
    '宿州市',
    '滁州市',
    '六安市',
    '宣城市',
    '池州市',
    '亳州市'
  ],
  福建省: [
    '福州市',
    '厦门市',
    '莆田市',
    '三明市',
    '泉州市',
    '漳州市',
    '南平市',
    '龙岩市',
    '宁德市'
  ],
  江西省: [
    '南昌市',
    '景德镇市',
    '萍乡市',
    '九江市',
    '抚州市',
    '鹰潭市',
    '赣州市',
    '吉安市',
    '宜春市',
    '新余市',
    '上饶市'
  ],
  山东省: [
    '济南市',
    '青岛市',
    '淄博市',
    '枣庄市',
    '东营市',
    '烟台市',
    '潍坊市',
    '济宁市',
    '泰安市',
    '威海市',
    '日照市',
    '临沂市',
    '德州市',
    '聊城市',
    '滨州市',
    '菏泽市'
  ],
  河南省: [
    '郑州市',
    '开封市',
    '洛阳市',
    '平顶山市',
    '安阳市',
    '鹤壁市',
    '新乡市',
    '焦作市',
    '濮阳市',
    '许昌市',
    '漯河市',
    '三门峡市',
    '南阳市',
    '商丘市',
    '信阳市',
    '周口市',
    '驻马店市'
  ],
  湖北省: [
    '武汉市',
    '黄石市',
    '十堰市',
    '宜昌市',
    '襄阳市',
    '鄂州市',
    '荆门市',
    '孝感市',
    '荆州市',
    '黄冈市',
    '咸宁市',
    '随州市'
  ],
  湖南省: [
    '长沙市',
    '株洲市',
    '湘潭市',
    '衡阳市',
    '邵阳市',
    '岳阳市',
    '常德市',
    '张家界市',
    '益阳市',
    '郴州市',
    '永州市',
    '怀化市',
    '娄底市'
  ],
  广东省: [
    '广州市',
    '韶关市',
    '深圳市',
    '珠海市',
    '汕头市',
    '佛山市',
    '江门市',
    '湛江市',
    '茂名市',
    '肇庆市',
    '惠州市',
    '梅州市',
    '汕尾市',
    '河源市',
    '阳江市',
    '清远市',
    '东莞市',
    '中山市',
    '潮州市',
    '揭阳市',
    '云浮市'
  ],
  广西壮族自治区: [
    '南宁市',
    '柳州市',
    '桂林市',
    '梧州市',
    '北海市',
    '防城港市',
    '钦州市',
    '贵港市',
    '玉林市',
    '百色市',
    '贺州市',
    '河池市',
    '来宾市',
    '崇左市'
  ],
  海南省: ['海口市', '三亚市', '三沙市', '儋州市'],
  四川省: [
    '成都市',
    '自贡市',
    '攀枝花市',
    '泸州市',
    '德阳市',
    '绵阳市',
    '广元市',
    '遂宁市',
    '内江市',
    '乐山市',
    '南充市',
    '眉山市',
    '宜宾市',
    '广安市',
    '达州市',
    '雅安市',
    '巴中市',
    '资阳市'
  ],
  贵州省: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市'],
  云南省: [
    '昆明市',
    '曲靖市',
    '玉溪市',
    '保山市',
    '昭通市',
    '丽江市',
    '普洱市',
    '临沧市'
  ],
  西藏自治区: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市'],
  陕西省: [
    '西安市',
    '铜川市',
    '宝鸡市',
    '咸阳市',
    '渭南市',
    '延安市',
    '汉中市',
    '榆林市',
    '安康市',
    '商洛市'
  ],
  甘肃省: [
    '兰州市',
    '嘉峪关市',
    '金昌市',
    '白银市',
    '天水市',
    '武威市',
    '张掖市',
    '平凉市',
    '酒泉市',
    '庆阳市',
    '定西市',
    '陇南市'
  ],
  青海省: ['西宁市', '海东市'],
  宁夏回族自治区: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  新疆维吾尔自治区: [
    '乌鲁木齐市',
    '克拉玛依市',
    '吐鲁番市',
    '哈密市',
    '昌吉回族自治州',
    '博尔塔拉蒙古自治州',
    '巴音郭楞蒙古自治州',
    '阿克苏地区',
    '克孜勒苏柯尔克孜自治州',
    '喀什地区',
    '和田地区',
    '伊犁哈萨克自治州',
    '塔城地区',
    '阿勒泰地区'
  ],

  // 特别行政区
  香港特别行政区: [
    '中西区',
    '湾仔区',
    '东区',
    '南区',
    '油尖旺区',
    '深水埗区',
    '九龙城区',
    '黄大仙区',
    '观塘区',
    '北区',
    '大埔区',
    '沙田区',
    '西贡区',
    '荃湾区',
    '屯门区',
    '元朗区',
    '葵青区',
    '离岛区'
  ],
  澳门特别行政区: [
    '花地玛堂区',
    '圣安多尼堂区',
    '大堂区',
    '望德堂区',
    '风顺堂区',
    '嘉模堂区',
    '圣方济各堂区'
  ],

  // 台湾省(地级市数据参考大陆行政区划标准)
  台湾省: [
    '台北市',
    '新北市',
    '桃园市',
    '台中市',
    '台南市',
    '高雄市',
    '基隆市',
    '新竹市',
    '嘉义市'
  ]
}
const sourceProvinceOptions = Object.keys(provinceCityMap)
const provinceOptions = ref(sourceProvinceOptions)
const cityOptions = ref(provinceCityMap[_province] || [])
const dialogPosition = isMobile ? 'bottom' : 'standard'

watch(province, v => {
  cityOptions.value = provinceCityMap[v]
  // 切换省份时清空市区
  city.value = ''
  _userInfo.region = v
})

watch(city, v => {
  // 切换省份时清空市区，此时值是空字符串
  if (v) {
    _userInfo.region = `${province.value} - ${v}`
  }
})

const filterProvinceFn = (val, update) => {
  if (val === '') {
    return update(() => (provinceOptions.value = sourceProvinceOptions))
  }

  update(() => {
    provinceOptions.value = sourceProvinceOptions.filter(v => v.includes(val))
  })
}

const onUpdatePassword = async () => {
  const { oldPassword, password, confirmPassword } = passwordForm

  if (oldPassword.length < 8) {
    return useNotify('旧密码长度至少为 8 位', 'negative')
  }

  if (password !== confirmPassword) {
    return useNotify('两次密码不一致', 'negative')
  }

  if (password.length < 8) {
    return useNotify('新密码长度至少为 8 位', 'negative')
  }

  try {
    const encryptedUserInfo = await useEncryptUserInfo({
      oldPassword,
      password
    })
    const { message } = await updatePassword(encryptedUserInfo)
    useNotify(message)
    useLogout()
    router.replace('/login')
  } catch (error) {
    useNotify(error, 'negative')
  }
}

const onUpdatePanel = v => {
  panel.value = v
  tip.value = tipMap[v]
}

const onBackFromProfile = async () => {
  panel.value = 'default'
  const keys = Object.keys(oldUserInfo)

  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]

    if (oldUserInfo[key] !== _userInfo[key]) {
      const s = JSON.stringify(_userInfo)
      const data = JSON.parse(s)
      delete data.id
      delete data.tokenVersion
      try {
        const {
          data: { token }
        } = await updateProfile(data)
        localStorage.setItem('token', token)
        oldUserInfo = JSON.parse(s)
        useNotify('修改资料成功')
      } catch (error) {
        useNotify(error, 'negative')
      }
      break
    }
  }
}

const onLogout = () => {
  useDialog({
    title: '离开',
    message: '你确定要退出账号吗？'
  }).onOk(() => {
    useLogout()
    router.replace('/login')
  })
}

const onEditRegion = () => (showRegionDialog.value = true)

const onEditBirthday = () => (showBirthdayDialog.value = true)

const onEditGender = () => {
  useDialog({
    title: '修改性别',
    position: dialogPosition,
    options: {
      type: 'radio',
      model: _userInfo.gender,
      items: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    }
  }).onOk(data => (_userInfo.gender = data))
}

const onEditNickname = () => {
  useDialog({
    title: '修改昵称',
    position: dialogPosition,
    prompt: {
      model: _userInfo.nickname,
      type: 'text',
      hint: `最大长度为 30 个字符`
    }
  }).onOk(data => {
    if (!data.length) {
      _userInfo.nickname = oldUserInfo.value.nickname
      useNotify('昵称不能为空', 'warning')
    } else {
      _userInfo.nickname = data
    }
  })
}
</script>
