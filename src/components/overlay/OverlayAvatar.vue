<template>
  <USlideover
    :class="isMobile ? 'max-w-none' : ''"
    :close="{ onClick: () => emit('close', false) }"
    title="创建角色"
    description=" "
    :ui="{ description: 'hidden' }"
  >
    <template #body>
      <UInput
        v-model="keyword"
        class="w-full"
        icon="lucide:search"
        placeholder="搜索..."
      />
      <UTabs
        v-model="activeTab"
        variant="pill"
        :items="items"
        class="mt-4 w-full gap-4 sm:mt-6 sm:gap-6"
      >
        <template #content>
          <div class="grid grid-cols-2 gap-4">
            <UButton
              v-for="name in categoryMap[activeTab]"
              @click="onSelectItem(name)"
              :label="name"
            ></UButton>
          </div>
        </template>
      </UTabs>
      <USlideover
        v-model:open="isSlideoverOpen"
        :class="isMobile ? 'max-w-none' : ''"
        title="选择角色"
        description=" "
        :ui="{ description: 'hidden' }"
      >
        <template #body>
          <div class="grid grid-cols-3 gap-4">
            <UButton
              v-for="name in avatarMap[activeItem]"
              @click="onSelectAvatar(name)"
              :label="name"
            ></UButton>
          </div>
        </template>
      </USlideover>
      <USlideover
        title="确认"
        description=" "
        :class="isMobile ? 'max-w-none' : ''"
        v-model:open="isConfirmSlideoverOpen"
        @after:leave="onAfterLeave"
        :ui="{
          body: 'space-y-4 sm:space-y-6',
          description: 'hidden'
        }"
      >
        <template #body>
          <UPageCard
            :description="
              isRandom
                ? `该角色来自于「${randomCategory === 'game' ? '游戏' : randomCategory === 'anime' ? '动漫' : '小说'}」-「${randomItem}」`
                : '输入你的角色名'
            "
            variant="naked"
            orientation="horizontal"
            class="mb-4"
            :ui="{
              container: 'lg:grid-cols-none'
            }"
          >
            <template #title>
              角色
              <UButton
                v-if="isRandom"
                icon="lucide:dices"
                variant="ghost"
                @click="activeAvatar = getRandomAvatar()"
              ></UButton>
            </template>
          </UPageCard>
          <UInput
            v-if="activeAvatar"
            class="w-full"
            v-model="activeAvatar"
            disabled
          >
          </UInput>
          <UInput v-else class="w-full" v-model="name">
            <template v-if="name" #trailing>
              <div class="text-muted text-xs tabular-nums">
                {{ name.length }}/16
              </div>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="lucide:circle-x"
                @click="name = ''"
              />
            </template>
          </UInput>
          <UPageCard
            description="选择你的头像"
            variant="naked"
            orientation="horizontal"
            class="mb-4"
            :ui="{
              title: 'flex items-center gap-2'
            }"
          >
            <template #title>
              头像
              <UButton
                icon="lucide:dices"
                variant="ghost"
                @click="onGenRandomAvatar"
              ></UButton>
            </template>
          </UPageCard>
          <div class="flex items-center justify-center">
            <UAvatar class="size-32" :src="src"></UAvatar>
          </div>
        </template>
        <template #footer>
          <UButton
            :disabled="!activeAvatar && !name"
            label="确认"
            @click="onUpdateAvatar"
          ></UButton>
        </template>
      </USlideover>
      <input
        @change="onFileChange"
        ref="avatarRef"
        hidden
        type="file"
        accept="image/png, image/jpeg, image/gif"
      />
    </template>
    <template #footer>
      <UButton label="随机角色" @click="onSelectRandomAvatar"></UButton>
      <UButton label="自定义角色" @click="onOpenConfirmSlideover"></UButton>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref, useTemplateRef, watch } from 'vue'
import { createAvatar } from '@dicebear/core'
import {
  adventurer,
  adventurerNeutral,
  avataaars,
  avataaarsNeutral,
  bigEars,
  bigEarsNeutral,
  bigSmile,
  bottts,
  botttsNeutral,
  croodles,
  croodlesNeutral,
  dylan,
  funEmoji,
  // glass,
  // icons,
  // identicon,
  // initials,
  lorelei,
  loreleiNeutral,
  micah,
  miniavs,
  notionists,
  notionistsNeutral,
  openPeeps,
  personas,
  pixelArt,
  pixelArtNeutral,
  // rings,
  // shapes,
  thumbs
} from '@dicebear/collection'
import { toPng } from '@dicebear/converter'
import { updateProfile } from '@/apis/profile'
import { useUpdateStaticNameFile } from '@/hooks'

const emit = defineEmits<{ close: [boolean] }>()
const { isMobile, globalSocket, userInfo, avatarURL } =
  storeToRefs(useUserStore())
const toast = useToast()
const src = ref(avatarURL.value)
const styles = [
  adventurer,
  adventurerNeutral,
  avataaars,
  avataaarsNeutral,
  bigEars,
  bigEarsNeutral,
  bigSmile,
  bottts,
  botttsNeutral,
  croodles,
  croodlesNeutral,
  dylan,
  funEmoji,
  lorelei,
  loreleiNeutral,
  micah,
  thumbs,
  miniavs,
  notionists,
  notionistsNeutral,
  openPeeps,
  personas,
  pixelArt,
  pixelArtNeutral
]
const isSlideoverOpen = ref(false)
const isConfirmSlideoverOpen = ref(false)
const activeTab = ref('game')
const activeItem = ref('')
const activeAvatar = ref('')
const isRandom = ref(false)
const randomCategory = ref('')
const randomItem = ref('')
const keyword = ref('')
const avatarRef = useTemplateRef('avatarRef')
const name = ref('')
const items = [
  {
    label: '游戏',
    value: 'game'
  },
  {
    label: '动漫',
    value: 'anime'
  },
  {
    label: '小说',
    value: 'novel'
  }
]
const categoryMap = {
  game: [
    '原神',
    '崩坏：星穹铁道',
    '绝区零',
    '明日方舟',
    '鸣潮',
    '碧蓝航线',
    '战双帕弥什',
    '重返未来：1999',
    '光与夜之恋',
    '恋与制作人',
    '未定事件簿',
    '时空中的绘旅人',
    '偶像梦幻祭',
    'A3!',
    '食物语',
    '掌门太忙',
    '黑猫奇闻社',
    '少女前线',
    '崩坏3',
    '阴阳师'
  ],
  anime: [
    '进击的巨人',
    '火影忍者',
    '海贼王',
    '鬼灭之刃',
    '咒术回战',
    '间谍过家家',
    '葬送的芙莉莲',
    '死神',
    '名侦探柯南',
    '龙珠',
    '钢之炼金术师',
    '命运/冠位指定',
    '我的英雄学院',
    'JOJO的奇妙冒险',
    '关于我转生变成史莱姆这档事',
    '无职转生',
    '孤独摇滚',
    '蓝色监狱',
    '电锯人',
    '国王排名',
    '夏日重现',
    '辉夜大小姐想让我告白',
    '间谍过家家',
    '更衣人偶坠入爱河',
    '莉可丽丝',
    '赛博朋克：边缘行者',
    '链锯人',
    '灵能百分百',
    '一拳超人',
    '东京喰种',
    '约定的梦幻岛',
    '石纪元',
    '黑色四叶草',
    '妖精的尾巴',
    '家庭教师',
    '银魂',
    '犬夜叉',
    '全职猎人',
    '浪客剑心',
    '死亡笔记',
    '反叛的鲁路修',
    'Code Geass',
    '命运之夜',
    '空之境界',
    '魔法少女小圆',
    '物语系列',
    '凉宫春日的忧郁',
    '轻音少女',
    'Angel Beats!',
    'Clannad',
    'AIR',
    'Kanon',
    '夏目友人帐',
    '虫师',
    '星际牛仔',
    '攻壳机动队',
    '新世纪福音战士',
    '天元突破',
    '化物语',
    '伪恋',
    '青春猪头少年不会梦到兔女郎学姐',
    '樱花庄的宠物女孩',
    '冰菓',
    '四月是你的谎言',
    '未闻花名',
    '可塑性记忆',
    'Charlotte',
    'Re:从零开始的异世界生活',
    '为美好的世界献上祝福',
    'Overlord',
    '关于我转生变成史莱姆这档事',
    '盾之勇者成名录',
    '转生成为了只有乙女游戏破灭Flag的邪恶大小姐',
    '堀与宫村',
    '总之就是非常可爱',
    '水果篮子',
    'NANA',
    '蜂蜜与四叶草',
    '交响情人梦',
    '白箱',
    '少女与战车',
    'Love Live!',
    '偶像大师',
    'Bang Dream!',
    '偶像荣耀',
    '赛马娘',
    '碧蓝之海',
    '男高日常',
    '日常',
    '幸运星',
    '轻音少女',
    '摇曳露营',
    '飞翔的魔女',
    '请问您今天要来点兔子吗',
    'NEW GAME!',
    '工作细胞',
    '动物狂想曲',
    '别对映像研出手',
    '隐瞒之事',
    '阿松',
    '齐木楠雄的灾难',
    '在下坂本，有何贵干',
    '黑执事',
    '吸血鬼骑士',
    '樱兰高校男公关部',
    '会长是女仆大人',
    'S.A特优生',
    '好想告诉你',
    '月色真美',
    '徒然喜欢你',
    '辉夜大小姐想让我告白',
    '高分少女',
    '棋魂',
    '花牌情缘',
    '黑子的篮球',
    '排球少年',
    '钻石王牌',
    '网球王子',
    'Free!',
    '冰上的尤里',
    '飙速宅男',
    '黑塔利亚',
    '银魂',
    '迷糊餐厅',
    '月刊少女野崎君',
    '元气少女缘结神',
    '妖狐×仆SS',
    '野良神',
    '双星之阴阳师',
    '青之驱魔师',
    '驱魔少年',
    '魔法禁书目录',
    '某科学的超电磁炮',
    '刀剑神域',
    '加速世界',
    '记录的地平线',
    '问题儿童都来自异世界',
    '游戏人生',
    'No Game No Life',
    '异世界魔王与召唤少女的奴隶魔术',
    '平凡职业造就世界最强',
    '这个勇者明明超强却过分慎重',
    '因为太怕痛就全点防御力了',
    '熊熊勇闯异世界',
    '打了300年史莱姆，不知不觉就练到了满级',
    '圣女魔力无所不能',
    '现实主义勇者的王国再建记',
    '世界顶尖的暗杀者转生为异世界贵族',
    '无职转生',
    '回复术士的重启人生',
    '异世界食堂',
    '异世界居酒屋',
    '异世界四重奏',
    '为美好的世界献上祝福',
    '素晴',
    'Konosuba'
  ],
  novel: [
    '诡秘之主',
    '全职高手',
    '魔道祖师',
    '天官赐福',
    '死亡万花筒',
    '全球高考',
    '破云',
    '默读',
    '撒野',
    '伪装学渣',
    'AWM[绝地求生]',
    'FOG[电竞]',
    '某某',
    '这题超纲了',
    '营业悖论',
    '我只喜欢你的人设',
    '我喜欢你的信息素',
    '二哈和他的白猫师尊',
    '将进酒',
    '杀破狼',
    '残次品',
    '小蘑菇',
    '不要在垃圾桶里捡男朋友',
    '快穿之打脸狂魔',
    '地球上线',
    '惊悚乐园',
    '惊悚练习生',
    '我在惊悚游戏里封神',
    '万人嫌阴郁受重生了',
    '人渣反派自救系统',
    '穿成万人迷的炮灰竹马',
    '穿成校草前男友',
    '我喜欢你男朋友很久了',
    '和死对头结婚之后',
    '被前任看见一个人吃火锅',
    '和豪门大佬网恋后我红了',
    '和巨星离婚以后我嫁给了',
    '和顶流隐婚后我失忆了'
  ]
}
const avatarMap = {
  // game
  原神: [
    '奈芙尔',
    '芙宁娜',
    '菲林斯',
    '菈乌玛',
    '纳西妲',
    '爱诺',
    '妮露',
    '艾尔海森',
    '赛诺',
    '流浪者',
    '提纳里',
    '迪希雅',
    '恰斯卡',
    '玛拉妮',
    '班尼特',
    '欧洛伦',
    '伊法',
    '伊涅芙',
    '茜特菈莉',
    '赛索斯',
    '菲谢尔',
    '行秋',
    '玛薇卡',
    '艾梅莉埃',
    '伊安珊',
    '瑶瑶',
    '香菱',
    '丝柯克',
    '申鹤',
    '塔利雅',
    '坎蒂丝',
    '迪奥娜',
    '基尼奇',
    '雷电将军',
    '神里绫华',
    '神里绫人',
    '珐露珊',
    '千织',
    '八重神子',
    '荒泷一斗',
    '宵宫',
    '琳妮特',
    '九条裟罗',
    '爱可菲',
    '托马',
    '娜维娅',
    '莱依拉',
    '希诺宁',
    '温迪',
    '烟绯',
    '闲云',
    '北斗',
    '瓦雷莎',
    '夏沃蕾',
    '嘉明',
    '希格雯',
    '莱欧斯利',
    '蓝砚',
    '梦见月瑞希',
    '阿蕾奇诺',
    '克洛琳德',
    '白术',
    '刻晴',
    '甘雨',
    '七七',
    '魈',
    '达达利亚',
    '钟离',
    '那维莱特',
    '胡桃',
    '卡齐娜',
    '枫原万叶',
    '琴',
    '迪卢克',
    '莫娜',
    '夜兰',
    '林尼',
    '优菈',
    '阿贝多',
    '珊瑚宫心海',
    '可莉',
    '诺艾尔',
    '夏洛蒂',
    '菲米尼',
    '罗莎莉亚',
    '绮良良',
    '卡维',
    '米卡',
    '多莉',
    '柯莱',
    '鹿野院平藏',
    '云堇',
    '凝光',
    '久岐忍',
    '早柚',
    '五郎',
    '重云',
    '丽莎',
    '辛焱',
    '雷泽',
    '凯亚',
    '芭芭拉',
    '砂糖',
    '安柏',
    '埃洛伊',
    '荧',
    '空'
  ],
  '崩坏：星穹铁道': [
    '昔涟',
    '风堇',
    '遐蝶',
    '缇宝',
    '大丽花',
    '丹恒•腾荒',
    '那刻夏',
    '长夜月',
    '大黑塔',
    '刻律德菈',
    '海瑟音',
    '银狼',
    '卡芙卡',
    '镜流',
    '刃',
    '白厄',
    'Saber',
    '流萤',
    'Archer',
    '星期日',
    '赛飞儿',
    '花火',
    '阿格莱雅',
    '真理医生',
    '忘归人',
    '椒丘',
    '黄泉',
    '万敌',
    '藿藿',
    '云璃',
    '波提欧',
    '知更鸟',
    '灵砂',
    '飞霄',
    '翡翠',
    '景元',
    '砂金',
    '乱破',
    '黑天鹅',
    '丹恒•饮月',
    '阮•梅',
    '银枝',
    '白露',
    '彦卿',
    '符玄',
    '罗刹',
    '托帕&账账',
    '克拉拉',
    '杰帕德',
    '希儿',
    '布洛妮娅',
    '瓦尔特',
    '姬子',
    '开拓者',
    '米沙',
    '加拉赫',
    '貊泽',
    '寒鸦',
    '雪衣',
    '桂乃芬',
    '驭空',
    '素裳',
    '停云',
    '青雀',
    '卢卡',
    '玲可',
    '虎克',
    '桑博',
    '佩拉',
    '娜塔莎',
    '希露瓦',
    '黑塔',
    '艾丝妲',
    '阿兰',
    '丹恒',
    '三月七'
  ],
  绝区零: [
    '伊德海莉·墨菲',
    '橘福福',
    '卢西娅·艾洛温',
    '狛野 真斗',
    '零号·安比',
    '般岳',
    '琉音',
    '奥菲丝·马格努森&「鬼 火」',
    '「席德」',
    '爱丽丝·泰姆菲尔德',
    '浮波 柚叶',
    '仪玄',
    '薇薇安·班希',
    '雨果·维拉德',
    '「扳机」',
    '伊芙琳·舒瓦利耶',
    '耀嘉音',
    '浅羽 悠真',
    '星见 雅',
    '莱特',
    '月城 柳',
    '柏妮思·怀特',
    '凯撒·金',
    '简·杜',
    '青衣',
    '朱 鸢',
    '艾莲·乔',
    '冯·莱卡恩',
    '猫宫 又奈',
    '「11号」',
    '亚历山德丽娜·莎芭丝缇安',
    '珂蕾妲·贝洛伯格',
    '格莉丝· 霍华德',
    '潘引壶',
    '波可娜·费雷尼',
    '赛斯·洛威尔',
    '露西亚娜·德·蒙特夫',
    '派派·韦尔',
    '妮可·德玛拉',
    '比利·奇德',
    '本·比格',
    '苍角',
    '安比·德玛拉',
    '可琳·威克斯',
    '安东·伊万诺夫'
  ],
  明日方舟: [
    '阿米娅',
    '博士',
    '陈',
    '能天使',
    '银灰',
    '星熊',
    '闪灵',
    '夜莺',
    '塞雷娅',
    '伊芙利特',
    '艾雅法拉',
    '安洁莉娜',
    '推进之王',
    '德克萨斯',
    '拉普兰德',
    '幽灵鲨',
    '斯卡蒂',
    '红',
    '临光',
    '白金',
    '蓝毒',
    '陨星',
    '白雪',
    '真理',
    '初雪',
    '崖心',
    '守林人',
    '普罗旺斯',
    '火神',
    '雷蛇',
    '芙兰卡',
    '凛冬',
    '古米',
    '猎蜂',
    '慕斯',
    '霜叶',
    '缠丸',
    '杜宾',
    '玫兰莎',
    '翎羽',
    '香草',
    '芬',
    '月见夜',
    '空爆',
    '梓兰',
    '史都华德',
    '安德切尔',
    '炎熔',
    '远山',
    '夜烟',
    '末药',
    '嘉维尔',
    '调香师',
    '白面鸮',
    '赫默',
    '华法琳',
    'FF0',
    '梅尔',
    '麦哲伦',
    '深海色',
    '食铁兽',
    '槐琥',
    '吽',
    '阿',
    '年',
    '夕',
    '令',
    '嵯峨',
    '灰喉',
    '苇草',
    '布洛卡',
    '贾维',
    '芳汀',
    '絮雨',
    '铃兰',
    '棘刺',
    '森蚺',
    '刻俄柏',
    '早露',
    'W',
    '温蒂',
    '极境',
    '傀影',
    '山',
    '卡夫卡',
    '爱丽丝',
    '薄绿',
    '迷迭香',
    '泥岩',
    '异客',
    '凯尔希',
    '浊心斯卡蒂',
    '歌蕾蒂娅',
    '假日威龙陈',
    '水月',
    '琴柳',
    '远牙',
    '焰尾',
    '耀骑士临光',
    '灵知',
    '老鲤',
    '澄闪',
    '菲亚梅塔',
    '见行者',
    '归溟幽灵鲨',
    '艾丽妮',
    '黑键',
    '多萝西',
    '鸿雪',
    '玛恩纳',
    '斥罪',
    '缄默德克萨斯',
    '淬羽赫默',
    '林',
    '重岳',
    '仇白',
    '麒麟X夜刀',
    '淬羽赫默',
    '圣约送葬人',
    '霍尔海雅',
    '涤火杰西卡',
    '薇薇安娜',
    '止颂',
    '图耶',
    '蜜莓',
    '桑葚',
    '罗比菈塔',
    '瑕光',
    '鞭刃',
    '铸铁',
    '帕拉斯',
    '卡涅利安',
    '水月',
    '龙舌兰',
    '贝娜',
    '乌有',
    '暴雨',
    '灰毫',
    '焰尾',
    '野鬃',
    '艾沃娜',
    '蚀清',
    '洛洛',
    '子月',
    '明椒',
    '但书',
    '至简',
    '石英',
    '承曦格雷伊',
    '雪雉',
    '断崖',
    '惊蛰',
    '莫斯提马',
    '夜魔',
    '苦艾',
    '四月',
    '奥斯塔',
    '石棉',
    '莱恩哈特',
    '送葬人',
    '星极',
    '格劳克斯',
    '波登可',
    '桃金娘',
    '苏苏洛',
    '格拉尼',
    '红豆',
    '清流',
    '锡兰',
    '黑',
    '赫拉格',
    '煌',
    '灰喉',
    '苇草',
    '布洛卡',
    '贾维',
    '芳汀',
    '絮雨'
  ],
  鸣潮: [
    '漂泊者',
    '秧秧',
    '今汐',
    '白芷',
    '维里奈',
    '鉴心',
    '桃祈',
    '炽霞',
    '莫特斐',
    '散华',
    '凌阳',
    '吟霖',
    '安可',
    '卡卡罗',
    '丹瑾',
    '维奥娜',
    '忌炎',
    '长离',
    '折枝',
    '守岸人',
    '相里要',
    '秋笙',
    '酒保'
  ],
  碧蓝航线: ['企业', '俾斯麦', '赤城', '加贺'],
  战双帕弥什: ['露西亚', '里', '丽芙', '库洛姆'],
  '重返未来：1999': ['维尔汀', '十四行诗', '星锑'],
  光与夜之恋: ['萧逸', '陆沉', '齐司礼', '查理苏', '夏鸣星'],
  恋与制作人: ['李泽言', '白起', '许墨', '周棋洛', '凌肖'],
  未定事件簿: ['左然', '莫弈', '陆景和', '夏彦'],
  时空中的绘旅人: ['艾因', '罗夏', '路辰', '司岚', '叶瑄'],
  偶像梦幻祭: ['朔间零', '日日树涉', '斋宫宗', '影片美伽'],
  'A3!': ['摄津万里', '兵头十座', '七尾太一', '伏见臣'],
  食物语: ['佛跳墙', '锅包肉', '龙井虾仁', '德州扒鸡'],
  掌门太忙: ['任天涯', '唐瑭', '苏慈'],
  黑猫奇闻社: ['陆林深', '秦艽', '温祈'],
  少女前线: ['M4A1', 'AR-15', 'M16A1', 'AK-47'],
  崩坏3: ['琪亚娜', '雷电芽衣', '布洛妮娅', '符华'],
  阴阳师: ['晴明', '神乐', '源博雅', '八百比丘尼'],
  // anime
  进击的巨人: ['艾伦·耶格尔', '三笠·阿克曼', '利威尔'],
  火影忍者: ['漩涡鸣人', '宇智波佐助', '春野樱'],
  海贼王: ['蒙奇·D·路飞', '罗罗诺亚·索隆', '娜美'],
  鬼灭之刃: ['灶门炭治郎', '灶门祢豆子', '我妻善逸'],
  咒术回战: ['虎杖悠仁', '伏黑惠', '五条悟'],
  间谍过家家: ['劳埃德·福杰', '约尔·福杰', '阿尼亚·福杰'],
  葬送的芙莉莲: ['芙莉莲', '菲伦', '修塔尔克', '辛美尔'],
  死神: ['黑崎一护', '朽木露琪亚', '井上织姬'],
  名侦探柯南: ['江户川柯南', '工藤新一', '毛利兰'],
  龙珠: ['孙悟空', '贝吉塔', '布尔玛'],
  钢之炼金术师: ['爱德华·艾尔利克', '阿尔冯斯·艾尔利克', '温莉·洛克贝尔'],
  '命运/冠位指定': ['藤丸立香', '玛修·基列莱特', '阿尔托莉雅·潘德拉贡'],
  我的英雄学院: ['绿谷出久', '爆豪胜己', '丽日御茶子'],
  JOJO的奇妙冒险: ['空条承太郎', '乔瑟夫·乔斯达', '迪奥·布兰度'],
  关于我转生变成史莱姆这档事: ['利姆鲁·特恩佩斯特', '维鲁多拉', '紫苑'],
  无职转生: ['鲁迪乌斯·格雷拉特', '希露菲叶特', '艾莉丝'],
  孤独摇滚: ['后藤一里', '伊地知虹夏', '山田凉'],
  蓝色监狱: ['洁世一', '蜂乐回', '千切豹马'],
  电锯人: ['电次', '玛奇玛', '早川秋'],
  国王排名: ['波吉', '卡克', '戴达'],
  夏日重现: ['网代慎平', '小舟潮', '小舟澪'],
  辉夜大小姐想让我告白: ['四宫辉夜', '白银御行', '藤原千花'],
  更衣人偶坠入爱河: ['喜多川海梦', '五条新菜', '乾纱寿叶'],
  莉可丽丝: ['锦木千束', '井上泷奈', '胡桃'],
  '赛博朋克：边缘行者': ['大卫·马丁内斯', '露西', '丽贝卡'],
  链锯人: ['电次', '帕瓦', '早川秋'],
  灵能百分百: ['影山茂夫', '灵幻新隆', '影山律'],
  一拳超人: ['埼玉', '杰诺斯', '龙卷'],
  东京喰种: ['金木研', '雾岛董香', '芳村功善'],
  约定的梦幻岛: ['艾玛', '诺曼', '雷'],
  石纪元: ['石神千空', '狮子王司', '琥珀'],
  黑色四叶草: ['亚斯塔', '尤诺', '诺艾儿'],
  妖精的尾巴: ['纳兹', '露西', '格雷'],
  家庭教师: ['沢田纲吉', '狱寺隼人', '山本武'],
  银魂: ['坂田银时', '志村新八', '神乐'],
  犬夜叉: ['犬夜叉', '日暮戈薇', '弥勒'],
  全职猎人: ['小杰', '奇犽', '酷拉皮卡'],
  浪客剑心: ['绯村剑心', '神谷薰', '相乐左之助'],
  死亡笔记: ['夜神月', 'L', '弥海砂'],
  反叛的鲁路修: ['鲁路修', 'C.C.', '枢木朱雀'],
  命运之夜: ['卫宫士郎', 'Saber', '远坂凛'],
  空之境界: ['两仪式', '黑桐干也', '苍崎橙子'],
  魔法少女小圆: ['鹿目圆', '晓美焰', '美树沙耶香'],
  物语系列: ['阿良良木历', '战场原黑仪', '羽川翼'],
  凉宫春日的忧郁: ['凉宫春日', '阿虚', '长门有希'],
  轻音少女: ['平泽唯', '秋山澪', '田井中律'],
  'Angel Beats!': ['音无结弦', '仲村由理', '立华奏'],
  Clannad: ['冈崎朋也', '古河渚', '藤林杏'],
  AIR: ['国崎往人', '神尾观铃', '雾岛佳乃'],
  Kanon: ['相泽佑一', '月宫亚由', '水濑名雪'],
  夏目友人帐: ['夏目贵志', '猫咪老师', '田沼要'],
  虫师: ['银古', '化野', '奴伊'],
  星际牛仔: ['斯派克', '菲', '杰特'],
  攻壳机动队: ['草薙素子', '巴特', '陀古萨'],
  新世纪福音战士: ['碇真嗣', '绫波丽', '明日香'],
  天元突破: ['西蒙', '卡米那', '妮娅'],
  化物语: ['阿良良木历', '战场原黑仪', '羽川翼'],
  伪恋: ['一条乐', '桐崎千棘', '小野寺小咲'],
  青春猪头少年不会梦到兔女郎学姐: ['梓川咲太', '樱岛麻衣', '古贺朋绘'],
  樱花庄的宠物女孩: ['神田空太', '椎名真白', '青山七海'],
  冰菓: ['折木奉太郎', '千反田爱瑠', '福部里志'],
  四月是你的谎言: ['有马公生', '宫园薰', '泽部椿'],
  未闻花名: ['宿海仁太', '本间芽衣子', '安城鸣子'],
  可塑性记忆: ['水柿司', '艾拉', '绢岛满'],
  Charlotte: ['乙坂有宇', '友利奈绪', '高城丈士朗'],
  'Re:从零开始的异世界生活': ['菜月昴', '爱蜜莉雅', '雷姆'],
  为美好的世界献上祝福: ['佐藤和真', '阿克娅', '惠惠'],
  Overlord: ['安兹', '雅儿贝德', '夏提雅'],
  盾之勇者成名录: ['岩谷尚文', '拉芙塔莉雅', '菲洛'],
  转生成为了只有乙女游戏破灭Flag的邪恶大小姐: [
    '卡塔莉娜',
    '吉奥路德',
    '玛丽亚'
  ],
  堀与宫村: ['堀京子', '宫村伊澄', '石川透'],
  总之就是非常可爱: ['由崎星空', '由崎司', '有栖川要'],
  水果篮子: ['本田透', '草摩由希', '草摩夹'],
  NANA: ['大崎娜娜', '小松奈奈', '本城莲'],
  蜂蜜与四叶草: ['竹本祐太', '花本叶久美', '森田忍'],
  交响情人梦: ['野田惠', '千秋真一', '黑木泰则'],
  白箱: ['宫森葵', '安原绘麻', '坂木静香'],
  少女与战车: ['西住美穗', '武部沙织', '五十铃华'],
  'Love Live!': ['高坂穗乃果', '南小鸟', '园田海未'],
  偶像大师: ['天海春香', '如月千早', '星井美希'],
  'Bang Dream!': ['户山香澄', '美竹兰', '市谷有咲'],
  偶像荣耀: ['长濑麻奈', '川咲樱', '一之濑怜'],
  赛马娘: ['特别周', '无声铃鹿', '东海帝王'],
  碧蓝之海: ['北原伊织', '古手川千纱', '滨冈梓'],
  男高日常: ['忠邦', '田畑秀则', '田中吉竹'],
  日常: ['相生佑子', '长野原美绪', '水上麻衣'],
  幸运星: ['泉此方', '柊镜', '柊司'],
  摇曳露营: ['各务原抚子', '志摩凛', '大垣千明'],
  飞翔的魔女: ['木幡真琴', '仓本圭', '仓本千夏'],
  请问您今天要来点兔子吗: ['保登心爱', '香风智乃', '天天座理世'],
  'NEW GAME!': ['凉风青叶', '八神光', '远山伦'],
  工作细胞: ['红细胞', '白细胞', '血小板'],
  动物狂想曲: ['雷格西', '春', '路易'],
  别对映像研出手: ['浅草绿', '水崎燕', '金森沙耶加'],
  隐瞒之事: ['后藤可久士', '后藤姬', '笕亚美'],
  阿松: ['松野小松', '松野空松', '松野轻松'],
  齐木楠雄的灾难: ['齐木楠雄', '照桥心美', '燃堂力'],
  '在下坂本，有何贵干': ['坂本', '久保田', '8823'],
  黑执事: ['夏尔', '塞巴斯蒂安', '伊丽莎白'],
  吸血鬼骑士: ['黑主优姬', '玖兰枢', '锥生零'],
  樱兰高校男公关部: ['藤冈春绯', '须王环', '凤镜夜'],
  会长是女仆大人: ['鲇泽美咲', '碓冰拓海', '鲇泽纱奈'],
  'S.A特优生': ['华园光', '泷岛彗', '山本纯'],
  好想告诉你: ['黑沼爽子', '风早翔太', '吉田千鹤'],
  月色真美: ['安昙小太郎', '水野茜', '小笠原大地'],
  徒然喜欢你: ['菅原卓郎', '高野千鹤', '刚田武'],
  高分少女: ['矢口春雄', '大野晶', '日高小春'],
  棋魂: ['进藤光', '塔矢亮', '藤原佐为'],
  花牌情缘: ['绫濑千早', '真岛太一', '绵谷新'],
  黑子的篮球: ['黑子哲也', '火神大我', '黄濑凉太'],
  排球少年: ['日向翔阳', '影山飞雄', '月岛萤'],
  钻石王牌: ['泽村荣纯', '降谷晓', '御幸一也'],
  网球王子: ['越前龙马', '手冢国光', '不二周助'],
  'Free!': ['七濑遥', '橘真琴', '松冈凛'],
  冰上的尤里: ['胜生勇利', '维克托', '尤里'],
  飙速宅男: ['小野田坂道', '今泉俊辅', '鸣子章吉'],
  黑塔利亚: ['意大利', '德国', '日本'],
  迷糊餐厅: ['小鸟游宗太', '种岛白杨', '伊波真昼'],
  月刊少女野崎君: ['佐仓千代', '野崎梅太郎', '御子柴实琴'],
  元气少女缘结神: ['桃园奈奈生', '巴卫', '御影'],
  '妖狐×仆SS': ['白鬼院凛凛蝶', '御狐神双炽', '反之冢连胜'],
  野良神: ['夜斗', '壹岐日和', '雪音'],
  双星之阴阳师: ['焰魔堂辘轳', '化野红绪', '石镜悠斗'],
  青之驱魔师: ['奥村燐', '奥村雪男', '杜山诗惠美'],
  驱魔少年: ['亚连·沃克', '神田优', '拉比'],
  魔法禁书目录: ['上条当麻', '御坂美琴', '白井黑子'],
  某科学的超电磁炮: ['御坂美琴', '白井黑子', '初春饰利'],
  刀剑神域: ['桐人', '亚丝娜', '结城明日奈'],
  加速世界: ['有田春雪', '黑雪姬', '仓岛千百合'],
  记录的地平线: ['城惠', '晓', '直继'],
  问题儿童都来自异世界: ['逆回十六夜', '黑兔', '久远飞鸟'],
  游戏人生: ['空', '白', '史蒂芬妮'],
  异世界魔王与召唤少女的奴隶魔术: ['迪亚布罗', '雪拉', '蕾姆'],
  平凡职业造就世界最强: ['南云始', '月', '希雅'],
  这个勇者明明超强却过分慎重: ['龙宫院圣哉', '莉丝妲', '雅黛涅拉'],
  因为太怕痛就全点防御力了: ['梅普露', '莎莉', '霞'],
  熊熊勇闯异世界: ['优奈', '菲娜', '诺雅'],
  '打了300年史莱姆，不知不觉就练到了满级': ['相泽梓', '莱卡', '法尔法'],
  圣女魔力无所不能: ['圣', '天川', '约翰'],
  现实主义勇者的王国再建记: ['相马一也', '莉希雅', '爱夏'],
  世界顶尖的暗杀者转生为异世界贵族: ['卢各', '蒂雅', '塔儿朵'],
  回复术士的重启人生: ['凯亚尔', '刹那', '芙蕾雅'],
  异世界食堂: ['店主', '阿蕾塔', '黑'],
  异世界居酒屋: ['信', '阿忍', '小菊'],
  异世界四重奏: ['和真', '阿库娅', '安兹'],
  素晴: ['佐藤和真', '阿克娅', '惠惠'],
  Konosuba: ['佐藤和真', '阿克娅', '惠惠'],
  // novel
  诡秘之主: ['克莱恩·莫雷蒂', '阿蒙', '亚当'],
  全职高手: ['叶修', '苏沐橙', '黄少天'],
  魔道祖师: ['魏无羡', '蓝忘机', '江澄'],
  天官赐福: ['谢怜', '花城', '风师'],
  死亡万花筒: ['林秋石', '阮南烛', '谭枣枣'],
  全球高考: ['游惑', '秦究', '楚月'],
  破云: ['江停', '严峫', '黑桃K'],
  默读: ['骆闻舟', '费渡', '陶然'],
  撒野: ['顾飞', '蒋丞', '顾淼'],
  伪装学渣: ['贺朝', '谢俞', '万达'],
  'AWM[绝地求生]': ['祁醉', '于炀', '卜那那'],
  'FOG[电竞]': ['余邃', '时洛', '宸火'],
  某某: ['江添', '盛望', '高天扬'],
  这题超纲了: ['许盛', '邵湛', '侯俊'],
  营业悖论: ['裴听颂', '方觉夏', '凌一'],
  我只喜欢你的人设: ['周自珩', '夏习清', '商思睿'],
  我喜欢你的信息素: ['路星辞', '段嘉衍', '宋意'],
  二哈和他的白猫师尊: ['楚晚宁', '墨燃', '师昧'],
  将进酒: ['沈泽川', '萧驰野', '姚温玉'],
  杀破狼: ['顾昀', '长庚', '沈易'],
  残次品: ['林静恒', '陆必行', '图兰'],
  小蘑菇: ['安折', '陆沨', '波利'],
  不要在垃圾桶里捡男朋友: ['池小池', '娄影', '061'],
  快穿之打脸狂魔: ['周允晟', '雷哲', '系统'],
  地球上线: ['唐陌', '傅闻夺', '白若遥'],
  惊悚乐园: ['封不觉', '黎若雨', '王叹之'],
  惊悚练习生: ['宗九', '诸葛暗', '梵卓'],
  我在惊悚游戏里封神: ['白柳', '谢塔', '牧四诚'],
  万人嫌阴郁受重生了: ['林招', '顾西洲', '沈清'],
  人渣反派自救系统: ['沈清秋', '洛冰河', '岳清源'],
  穿成万人迷的炮灰竹马: ['宋喻', '谢绥', '孟光'],
  穿成校草前男友: ['景辞', '赢骄', '何粥'],
  我喜欢你男朋友很久了: ['严准', '裴然', '林康']
}

const onAfterLeave = () => {
  name.value = ''
  activeAvatar.value = ''
  isRandom.value = false
}

const getRandomAvatar = () => {
  const category = items[Math.floor(Math.random() * items.length)].value
  const lists = categoryMap[category]
  const item = lists[Math.floor(Math.random() * lists.length)]
  const avatars = avatarMap[item]

  randomCategory.value = category
  randomItem.value = item

  return avatars[Math.floor(Math.random() * avatars.length)]
}

const onSelectRandomAvatar = () => {
  isRandom.value = true
  onSelectAvatar(getRandomAvatar())
}

const base64ToFile = () => {
  // 移除 URL 前缀
  const byteString = atob(src.value.split(',')[1])
  const { length } = byteString
  const arrayBuffer = new ArrayBuffer(length)
  const ia = new Uint8Array(arrayBuffer)

  for (let i = 0; i < length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([arrayBuffer], { type: 'image/png' })
  const file = new File([blob], 'avatar.png', { type: blob.type })

  return file
}

const onGenRandomAvatar = async () => {
  const avatar = createAvatar(
    styles[Math.floor(Math.random() * styles.length)] as any,
    {
      size: 128,
      seed: String(Math.random())
    }
  )
  const png = toPng(avatar)
  src.value = await png.toDataUri()
}

const onFileChange = e =>
  useUpdateStaticNameFile(e, 'avatar', userInfo, toast, avatarURL)

const onUpdateAvatar = async () => {
  const _activeAvatar = activeAvatar.value
  const newNickname = _activeAvatar || name.value

  try {
    const { data: token } = await updateProfile({
      nickname: newNickname
    })
    localStorage.setItem('token', token)
    globalSocket.value.emit('refresh-profile', token)
    userInfo.value.profile.nickname = newNickname
    toast.add({
      title: '修改资料成功',
      icon: 'lucide:smile'
    })
    emit('close', true)
    isConfirmSlideoverOpen.value = false
    isSlideoverOpen.value = false
  } catch (error) {
    toast.add({
      title: '修改资料失败',
      color: 'error',
      icon: 'lucide:annoyed'
    })
  }

  if (src.value.startsWith('data:image/')) {
    const file = base64ToFile()
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    const input = avatarRef.value
    input.files = dataTransfer.files
    const event = new Event('change')
    input.dispatchEvent(event)
  }
}

const onOpenConfirmSlideover = () => {
  isConfirmSlideoverOpen.value = true

  // 如果已经创建了角色，那么不生成头像，让用户手动选择是否替换头像
  if (!userInfo.value.profile.nickname) {
    onGenRandomAvatar()
  }
}

const onSelectItem = name => {
  activeItem.value = name
  isSlideoverOpen.value = true
}

const onSelectAvatar = name => {
  activeAvatar.value = name
  onOpenConfirmSlideover()
}

watch(keyword, () => {})
</script>
