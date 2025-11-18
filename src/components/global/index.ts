import { type App } from 'vue'
import Empty0 from './empty/Empty0.vue'
import SkeletonList from './skeletonList/index.vue'

export default {
  install(app: App) {
    app.component(Empty0.name!, Empty0)
    app.component(SkeletonList.name!, SkeletonList)
  },
}
