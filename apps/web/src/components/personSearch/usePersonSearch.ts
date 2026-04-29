import { ref } from 'vue'
import { user as userApi, document as documentApi } from '@sk/api'
import { type UserInfo } from '@sk/types'
import { to } from 'await-to-js'
import { debounce } from 'lodash-es'
import { useUserStore } from '#sk-web/store/useUserStore'
export const usePersonSearch = () => {
  const data = ref<UserInfo[]>([])
  // 全量用户列表（用于查找，不会被清空）
  const allUsers = ref<UserInfo[]>([])
  const fetching = ref(false)
  const userStore = useUserStore()
  const fetchUser = debounce(async (searchValue: string) => {
    const [error, res] = await to(userApi.getFullUserList({ keyword: searchValue }))
    if (error) {
      return []
    }
    data.value = res.data
    return res.data
  }, 300)
  //   特供方法（注意不要debounce，tiptap的提示会有问题）
  const fetchDocContextUsers = async (documentId: string, searchValue: string) => {
    const [error, res] = await to(documentApi.getDocContextUsers(documentId, searchValue))
    if (error) {
      return []
    }
    // 排除当前登录人
    return res.data ? res.data.filter((user: UserInfo) => user.id !== userStore.userInfo.id) : []
  }
  // 根据 id 查找用户信息(tagRender没返回完整行？？)
  const getUserById = (id: number) => {
    return allUsers.value.find((user: UserInfo) => user.id === id)
  }

  const initAllUsers = async () => {
    const [error, res] = await to(userApi.getFullUserList({ keyword: '' }))
    if (!error && res.data) {
      allUsers.value = res.data
    }
  }

  return {
    data,
    fetching,
    fetchUser,
    fetchDocContextUsers,
    getUserById,
    initAllUsers,
  }
}
