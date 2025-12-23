import { defineStore } from 'pinia'
import {ref} from 'vue'
import  type { UserInfo } from '@sk/types'
import { user as userApi } from '@sk/api'
import { to } from 'await-to-js'
export const useUserStore = defineStore('user', () => {
    const userInfo = ref<UserInfo>({
        id: '',
        username: '',
        email: '',
        nickname: '',
        created_at: '',
        updated_at: '',
    })
    const getUserInfo = async () => {
        const [err, res] = await to(userApi.getUserInfo())
        if (err) {
            return
        }
        userInfo.value = res.data
    }
    return {
        userInfo,
        getUserInfo,
    }
}, {
    persist: true,
})