import { type App } from 'vue'
import Empty0 from './empty/Empty0.vue'
import SkeletonList from './skeletonList/index.vue'
import FlexSearch from './flexSearch/index.vue'
import NotFound from './notFound/index.vue'
export default {
  install(app: App) {
    app.component(Empty0.name!, Empty0)
    app.component(SkeletonList.name!, SkeletonList)
    app.component(FlexSearch.name!, FlexSearch)
    app.component(NotFound.name!, NotFound)
  },
}
export {
  Empty0,
  SkeletonList,
  FlexSearch,
  NotFound,
}