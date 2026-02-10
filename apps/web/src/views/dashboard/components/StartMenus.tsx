import { defineComponent, ref } from 'vue'
import type { ModuleMenuItem } from '../type'
import { ClockCircleOutlined, ClockCircleFilled, TeamOutlined } from '@ant-design/icons-vue'
import { Tooltip } from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'
import { useRoute, useRouter } from 'vue-router'
export default defineComponent({
  name: 'StartMenus',
  props: {
    expanded: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const moduleMenus = ref<ModuleMenuItem[]>([
      {
        title: '开始',
        key: '/dashboard/start',
        icon: () => <ClockCircleOutlined />,
        filledIcon: () => <ClockCircleFilled />,
      },
      // {
      //   title: '团队',
      //   key: 'team',
      //   icon: () => <TeamOutlined />,
      //   filledIcon: () => <TeamOutlined />,
      // }
    ])

    const handleModuleClick = (item: ModuleMenuItem) => {
      router.push(item.key)
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
      </div>
    )
  },
})