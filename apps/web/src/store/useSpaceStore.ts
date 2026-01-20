import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type SpaceItem, SpaceType } from '@sk/types'
import { to } from 'await-to-js'
import { space as spaceApi } from '@sk/api'
import { message } from 'ant-design-vue'
export const useSpaceStore = defineStore('space', () => {
  const spaceInfo = ref<SpaceItem>({
    id: '',
    type: SpaceType.PERSONAL,
    name: '',
    domain: '',
    owner_id: '',
    contact_email: '',
    icon: {
      id: '',
      url: '',
    },
    description: '',
    created_at: '',
    updated_at: '',
    space_members: [],
  })
  const isPersonalSpace = computed(() => spaceInfo.value.type === SpaceType.PERSONAL)

  const initSpace = async () => {
    const hostname = window.location.hostname; // 例如：app.example.com
    const parts = hostname.split('.');
    const accessToken = localStorage.getItem('access_token')

    // 如果域名是 example.com（没有子域名），parts.length === 2
    // 如果是 app.example.com，parts.length >= 3，子域名为 parts[0]
    const domin = parts.length > 2 ? parts[0] : '';
    if (domin) { // 如果包含域名
      const [err, res] = await to(spaceApi.getSpaceInfoByDomin(domin))
      if (err) {
        message.error(err.message)
        return
      }
      spaceInfo.value = res.data;
    } else {
      if (accessToken) {
        const [err, res] = await to(spaceApi.getSpaceInfo())
        if (err) {
          message.error(err.message)
          return
        }
        spaceInfo.value = res.data;
      }
    }
  }
  const getSpaceInfoByUser = async () => {
    const [err, res] = await to(spaceApi.getSpaceInfo())
    if (err) {
      message.error(err.message)
      return
    }
    spaceInfo.value = res.data;
  }
  return {
    spaceInfo,
    initSpace,
    isPersonalSpace,
    getSpaceInfoByUser
  }
})