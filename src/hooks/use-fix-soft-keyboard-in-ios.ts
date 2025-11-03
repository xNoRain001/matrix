import useNoop from './use-noop'

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

const useFixSoftKeyboardInIOS = (container, scrollContainer) => {
  if (isIOS) {
    const resizeHandler = () => {
      // 安卓：在呼出键盘后，不会将获取焦点的输入框滚动到视图内，直接修改视图高度为原来的
      // 视图高度 - 键盘高度，原先的视图只是高度变小了，头部依然能够显示，如果内容高度
      // 大于视口宽度，出现滚动条
      // iOS: 在呼出键盘后，会将获取焦点的输入框滚动到视图内，视图高度不会改变，而是由
      // 原本的视图和底部键盘组成，原本的视图溢出的高度最大值为键盘的高度（滚动区域的
      // 最大距离为键盘高度），由输入框的位置决定，这就导致头部可能无法显示在当前视图中，
      // 另外，iOS 键盘显示时，页面的头部和底部都会多出一块衬底区域

      // visualViewport.offsetTop 表示视觉视口相对于布局视口的偏移，标签栏在底部时
      // 这个值可能不准
      // TODO: 找到解决办法
      const { offsetTop, height } = visualViewport
      container.style.paddingTop = `${offsetTop}px`
      const html = document.documentElement
      const { scrollHeight } = html

      // 不相等，说明输入框被软键盘挡住了，需要修正位置，在底部输入框出现了高度较大的折叠
      // 项时，会出现这种情况
      if (scrollHeight !== offsetTop + height) {
        html.scrollTop = scrollHeight - height
      }

      scrollContainer.scrollToBottom()
    }

    // 软键盘打开和关闭时触发
    visualViewport.addEventListener('resize', resizeHandler)
    visualViewport.addEventListener('scroll', resizeHandler)

    return () => {
      visualViewport.removeEventListener('resize', resizeHandler)
      visualViewport.removeEventListener('scroll', resizeHandler)
    }
  }

  return useNoop
}

export default useFixSoftKeyboardInIOS
