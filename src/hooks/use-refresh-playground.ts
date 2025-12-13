import {
  getPlaygroundFriendPostsAPI,
  getPlaygroundPostsAPI,
  getPlaygroundProductsAPI
} from '@/apis/playground'

const useRefreshPlayground = async (
  activeTab,
  activeCollegeTab,
  postMap,
  userInfo,
  toast
) => {
  const _activeTab = activeTab.value

  if (_activeTab === 'latest') {
    const posts = (
      await getPlaygroundPostsAPI(
        '',
        //  可能在没有帖子的情况下刷新
        postMap.value.latest.posts?.[0]?._id || ''
      )
    ).data
    const { length } = posts

    if (length) {
      postMap.value.latest.posts.unshift(...posts)
    } else {
      toast.add({
        title: '暂时没有新内容',
        color: 'error',
        icon: 'lucide:annoyed'
      })
    }
  } else if (_activeTab === 'friend') {
    // 完全替换原数据，因为可能关注或取消关注其他用户
    const posts = (await getPlaygroundFriendPostsAPI()).data
    postMap.value.friend.posts = posts
    toast.add({
      title: '刷新成功',
      icon: 'lucide:smile'
    })
  } else {
    const _activeCollegeTab = activeCollegeTab.value

    if (_activeCollegeTab === 'myCollege') {
      const posts = (
        await getPlaygroundPostsAPI(
          '',
          //  可能在没有帖子的情况下刷新
          postMap.value.myCollege.posts?.[0]?._id || '',
          userInfo.value.profile.college
        )
      ).data
      const { length } = posts

      if (length) {
        postMap.value.myCollege.posts.unshift(...posts)
      } else {
        toast.add({
          title: '暂时没有新内容',
          color: 'error',
          icon: 'lucide:annoyed'
        })
      }
    } else if (_activeCollegeTab === 'market') {
      const products = (
        await getPlaygroundProductsAPI(
          userInfo.value.profile.college,
          '',
          postMap.value.market.products?.[0]?._id || ''
        )
      ).data
      const { length } = products

      if (length) {
        postMap.value.market.products.unshift(...products)
      } else {
        toast.add({
          title: '暂时没有新内容',
          color: 'error',
          icon: 'lucide:annoyed'
        })
      }
    }
  }
}

export default useRefreshPlayground
