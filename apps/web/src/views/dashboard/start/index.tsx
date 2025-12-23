import { defineComponent, ref, computed } from 'vue'
import {
  Flex,
  Dropdown,
  Menu,
  MenuItem,
  Segmented,
  Table,
  type TableColumnType,
} from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'
import { DownOutlined } from '@ant-design/icons-vue'
import { Empty0 } from '#sk-web/components/global'
type MenuBtnItem = {
  label: string
  key: string
  desc?: string
  icon: string
  overlay?: MenuBtnItem[]
}

type DocumentItem = {
  title: string
  space: string
  created_at: string
  key?: string
}
export default defineComponent({
  name: 'Start',
  setup(props) {
    const startMenus = ref<MenuBtnItem[]>([
      {
        label: '新建文档',
        key: 'document-trigger',
        icon: 'icon-document-add',
        desc: '文档',
        overlay: [
          {
            label: '新建文档',
            key: 'document',
            icon: 'icon-document',
          },
        ],
      },
      {
        label: '新建知识库',
        key: 'knowledge',
        icon: 'icon-knowledge-add',
        desc: '使用知识库整理知识',
      },
    ])
    const docListLoading = ref(false)
    const dataSource = ref<DocumentItem[]>([])
    const columns: TableColumnType<DocumentItem>[] = [
      {
        title: '文档标题',
        dataIndex: 'title',
      },
      {
        title: '文档空间/知识库',
        dataIndex: 'space',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
      },
    ]
    const docType = ref<string>('edited')
    const documentTypeOptions = ref([
      { value: 'edited', label: '编辑过' },
      { value: 'browsed', label: '浏览过' },
    ])
    const curDocTypeName = computed(() => {
      return documentTypeOptions.value.find((item) => item.value === docType.value)?.label
    })
    const triggerRender = (item: MenuBtnItem) => (
      <Flex
        align="center"
        gap={8}
        class="relative px-4 py-[8px] rounded-[8px] border border-solid border-[var(--sd-border-grey-4)] cursor-pointer hover:bg-[var(--sd-bg-secondary)]"
      >
        <IconFont
          type={item.icon}
          class="mb-2"
          svg-sprite
          style={{ width: '22px', height: '22px' }}
        />
        <Flex vertical class="flex-1 ml-2">
          <div class="font-medium text-[var(--sd-text-grey-900)]">{item.label}</div>
          {item.desc && <div class="mt-1 text-xs text-[var(--sd-grey-7)]">{item.desc}</div>}
        </Flex>
        {item.overlay && (
          <DownOutlined class="text-[12px] text-[var(--sd-text-grey-900)] opacity-60" />
        )}
      </Flex>
    )
    const overlayRender = (overLayList: MenuBtnItem[]) => {
      return (
        <Menu>
          {overLayList.map((item: MenuBtnItem) => (
            <MenuItem key={item.key}>
              <div class="flex items-center gap-2">
                <IconFont type={item.icon} svg-sprite style={{ width: '18px', height: '18px' }} />
                <span>{item.label}</span>
              </div>
            </MenuItem>
          ))}
        </Menu>
      )
    }
    return () => (
      <Flex vertical class="px-6">
        <h3 class="text-[18px] mt-6">开始</h3>
        <div class="mt-4">
          <div class="grid grid-cols-4 gap-4">
            {startMenus.value.map((item: MenuBtnItem) => {
              return item.overlay && item.overlay.length ? (
                <Dropdown key={item.key} overlay={overlayRender(item.overlay)} placement="bottom">
                  {/* a-flex无法直接触发 */}
                  <div>{triggerRender(item)}</div>
                </Dropdown>
              ) : (
                <div key={item.key}>{triggerRender(item)}</div>
              )
            })}
          </div>
        </div>
        <h3 class="text-[18px] mt-6 mb-4">文档</h3>
        <div class="w-fit">
          <Segmented
            value={docType.value}
            onChange={(value: string | number) => {
              docType.value = value as string
            }}
            options={documentTypeOptions.value}
          ></Segmented>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource.value}
          loading={docListLoading.value}
          showHeader={false}
          v-slots={{
            emptyText: () => (
              <Empty0
                style={{ marginTop: '50px' }}
                description={`暂无${curDocTypeName.value}的文档`}
              />
            ),
          }}
        ></Table>
      </Flex>
    )
  },
})
