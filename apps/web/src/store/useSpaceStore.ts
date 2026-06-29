import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type SpaceItem, SpaceType } from '@sk/types'
import { to } from 'await-to-js'
import { space as spaceApi } from '@sk/api'
import { message } from 'ant-design-vue'
import { getSpaceSubdomain } from '@sk/utils'
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
    const domin = getSpaceSubdomain(window.location.hostname)
    const accessToken = localStorage.getItem('access_token')

    if (domin) {
      const [err, res] = await to(spaceApi.getSpaceInfoByDomin(domin))
      if (err) {
        message.error(err.message)
        return
      }
      spaceInfo.value = res.data;
    } else if (accessToken) {
      const [err, res] = await to(spaceApi.getSpaceInfo())
      if (err) {
        message.error(err.message)
        return
      }
      spaceInfo.value = res.data;
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