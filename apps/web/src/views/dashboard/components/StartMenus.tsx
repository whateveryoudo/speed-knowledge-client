import { defineComponent, ref } from 'vue'
import type { ModuleMenuItem } from '../type'
import { ClockCircleOutlined, ClockCircleFilled } from '@ant-design/icons-vue'
import { Tooltip } from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'

export default defineComponent({
  name: 'StartMenus',
  props: {
    activeModuleKey: {
      type: String,
      default: 'start',
    },
    expanded: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:activeModuleKey'],
  setup(props, { emit }) {
    const moduleMenus = ref<ModuleMenuItem[]>([
      {
        title: '开始',
        key: 'start',
        icon: () => <ClockCircleOutlined />,
        filledIcon: () => <ClockCircleFilled />,
      },
    ])

    const handleModuleClick = (item: ModuleMenuItem) => {
      emit('update:activeModuleKey', item.key)
    }

    const renderItem = (item: ModuleMenuItem) => {
      const isActive = props.activeModuleKey === item.key
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