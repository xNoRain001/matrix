const useInitAutoScrollBtn = (
  scrollTop,
  isFooterNavsUpdateByScroll,
  footerNavs,
  nav,
  isAutoScrollBtnShow
) => {
  const isPlayground = nav === 'playground'

  if (scrollTop > 400) {
    if (isFooterNavsUpdateByScroll) {
      if (isPlayground) {
        const nav = footerNavs.value[1]
        nav.label = '顶部'
        nav.icon = 'lucide:rocket'
      } else {
        const nav = footerNavs.value[4]
        nav.label = '顶部'
        nav.icon = 'lucide:rocket'
      }
    } else {
      isAutoScrollBtnShow.value = true
    }
  } else {
    if (isFooterNavsUpdateByScroll) {
      if (isPlayground) {
        const nav = footerNavs.value[1]
        nav.label = '广场'
        nav.icon = 'lucide:rose'
      } else {
        const nav = footerNavs.value[4]
        nav.label = '我的'
        nav.icon = 'lucide:user-round-cog'
      }
    } else {
      isAutoScrollBtnShow.value = false
    }
  }
}

export default useInitAutoScrollBtn
