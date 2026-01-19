import { cloneDeep } from 'lodash-es'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
// 这里添加重置store方法
pinia.use(({ store }) => {
    if (store.$id === "knowledge") {
        const initialState = cloneDeep(store.$state)
        store.$reset = () => {
            store.$patch(cloneDeep(initialState))
        }
    }
})
export default pinia