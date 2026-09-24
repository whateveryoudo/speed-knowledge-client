import { computed, defineComponent, ref } from 'vue'
import type { ModuleMenuItem } from '../type'
import {
  ClockCircleOutlined,
  ClockCircleFilled,
  StarOutlined,
  StarFilled,
  ReadOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue'
import { Tooltip, message } from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'
import { useRoute, useRouter } from 'vue-router'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'StartMenus',
  props: {
    expanded: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const spaceStore = useSpaceStore()
    const { isPersonalSpace, spaceInfo } = storeToRefs(spaceStore)

    const moduleMenus = computed<ModuleMenuItem[]>(() => {
      const menus: ModuleMenuItem[] = [
        {
          title: '开始',
          key: '/dashboard/start',
          icon: () => <ClockCircleOutlined />,
          filledIcon: () => <ClockCircleFilled />,
        },
        {
          title: '收藏',
          key: '/dashboard/collect',
          icon: () => <StarOutlined />,
          filledIcon: () => <StarFilled />,
        },
      ]
      if (!isPersonalSpace.value) {
        menus.push({
          title: '公共区',
          key: 'public-area',
          icon: () => <ReadOutlined />,
          filledIcon: () => <ReadOutlined />,
        })
      }
      return menus
    })

    const handleModuleClick = (item: ModuleMenuItem) => {
      if (item.key === 'public-area') {
        const slug = spaceInfo.value.public_area_slug
        if (!slug) {
          message.warning('公共区尚未就绪')
          return
        }
        router.push(`/${slug}/knowledge/`)
        return
      }
      router.push(item.key)
    }

    const goSpaceManage = () => {
      message.info('空间管理稍后接入，请先用创建空间造数据')
    }

    const renderItem = (item: ModuleMenuItem) => {
      const isActive = route.path === item.key
      const IconRender = isActive ? item.filledIcon : item.icon
      const content = (
        <div
          onClick={() => handleModuleClick(item)}
          class={[
            'flex items-center h-[32px] my-[4px] px-[10px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200 cursor-pointer',
            isActive && 'bg-[var(--sd-bg-primary-hover)]',
            !props.expanded && 'justify-center',
          ]}
        >
          <IconFont iconRender={IconRender} class={!props.expanded ? '' : 'mr-2'} />
          {props.expanded && <span class="text-[var(--sd-text-grey-900)]">{item.title}</span>}
        </div>
      )
      if (props.expanded) return content
      return (
        <Tooltip placement="right" title={item.title}>
          {content}
        </Tooltip>
      )
    }

    return () => (
      <div class="px-2">
        {moduleMenus.value.map((item) => (
          <div key={item.key}>{renderItem(item)}</div>
        ))}
        {!isPersonalSpace.value && props.expanded && (
          <div
            onClick={goSpaceManage}
            class="flex items-center h-[32px] my-[4px] px-[10px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200 cursor-pointer mt-2"
          >
            <IconFont iconRender={() => <SettingOutlined />} class="mr-2" />
            <span class="text-[var(--sd-text-grey-900)]">空间管理</span>
          </div>
        )}
      </div>
    )
  },
})
