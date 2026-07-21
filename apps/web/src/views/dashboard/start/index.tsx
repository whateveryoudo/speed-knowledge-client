import { defineComponent, ref, computed } from 'vue'
import {
  Flex,
  Dropdown,
  Menu,
  MenuItem,
  Segmented,
  Table,
  type TableColumnType,
  Space,
} from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'
import { DownOutlined } from '@ant-design/icons-vue'
import { Empty0 } from '#sk-web/components/global'
import { dashboard as dashboardApi } from '@sk/api'
import { transformDatatimeToRecentText } from '@sk/utils'
import { useTable } from 'speed-components-ui/hooks'

import {
  documentHistoryTypeOptions,
  documentTypeOptions,
  type DashboardDocumentHistoryResponse,
  DocumentHistoryType,
  DocumentType,
} from '@sk/types'
import router from '#sk-web/router'
import AddKnowledge from '../components/addMenu/AddKnowledge.vue'
import SelectKnowledgeForDocument from '../components/addMenu/SelectKnowledgeForDocument.vue'
type MenuBtnItem = {
  label: string
  key: string
  desc?: string
  icon: string
  overlay?: MenuBtnItem[]
}

export default defineComponent({
  name: 'Start',
  setup(props, { emit }) {
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
    const openAddKnowledge = ref<boolean>(false)
    const openSelectKnowledge = ref<boolean>(false)
    const getDocumentTypeIcon = (type: DocumentType) => {
      return documentTypeOptions.find((item) => item.value === type)?.icon
    }
    const columns: TableColumnType<DashboardDocumentHistoryResponse>[] = [
      {
        title: '文档标题',
        dataIndex: 'doc_name',
        customRender: ({ record }: { record: DashboardDocumentHistoryResponse }) => {
          return (
            <Space>
              <IconFont
                svgSprite
                type={getDocumentTypeIcon(record.doc_type)}
                style={{ width: '22px', height: '22px' }}
              />
              <span
                class="text-[var(--sd-text-primary)] cursor-pointer"
                onClick={() => {
                  router.push(
                    `/${record.doc_belong_team_slug}/knowledge/${record.doc_belong_knowledge_slug}/document/${record.doc_slug}`,
                  )
                }}
              >
                {record.doc_name}
              </span>
            </Space>
          )
        },
      },
      {
        title: '团队/知识库',
        dataIndex: 'doc_belong_knowledge_name',
        customRender: ({ record }: { text: string; record: DashboardDocumentHistoryResponse }) => {
          // TODO:个人花园展示
          return (
            <span class="text-[var(--sd-text-caption)]">
              {record.doc_belong_team_name}
              <span class="mx-1">/</span>
              <span
                class="cursor-pointer"
                onClick={() => {
                  router.push(
                    `/${record.doc_belong_team_slug}/knowledge/${record.doc_belong_knowledge_slug}`,
                  )
                }}
              >
                {record.doc_belong_knowledge_name}
              </span>
            </span>
          )
        },
      },
      {
        title: '触发时间',
        dataIndex: 'update_datetime',
        customRender: ({ text }: { text: string }) => {
          return (
            <span class="text-[var(--sd-text-caption)]">{transformDatatimeToRecentText(text)}</span>
          )
        },
      },
    ]
    const docType = ref<DocumentHistoryType>(DocumentHistoryType.EDIT)

    const curDocTypeName = computed(() => {
      return documentHistoryTypeOptions.find((item) => item.value === docType.value)?.label
    })
    const options = computed(() => {
      return {
        extraParams: {
          history_type: docType.value,
        },
      }
    })

    const { dataSource, loading, getList, pagination, handleTableChange } = useTable(
      dashboardApi.getDocumentHistoryList,
      options,
    )


    // 初始化列表
    getList()

    const handleStartMenuClick = (key: string) => {
      if (key === 'knowledge') {
        openAddKnowledge.value = true
      }
      if (key === 'document') {
        openSelectKnowledge.value = true
      }
    }
    const triggerRender = (item: MenuBtnItem) => (
      <div
        class="flex items-center relative px-4 py-[8px] rounded-[8px] border border-solid border-[var(--sd-border-grey-4)] cursor-pointer hover:bg-[var(--sd-bg-secondary)]"
        onClick={() => {
          if (item.key === 'knowledge') {
            openAddKnowledge.value = true
          }
          if (item.key === 'document-trigger') {
            openSelectKnowledge.value = true
          }
        }}
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
      </div>
    )
    const overlayRender = (overLayList: MenuBtnItem[]) => {
      return (
        <Menu onClick={({ key }) => handleStartMenuClick(String(key))}>
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
        <div class="w-fit mb-4">
          <Segmented
            value={docType.value}
            onChange={(value: any) => {
              docType.value = value as DocumentHistoryType
              getList()
            }}
            options={documentHistoryTypeOptions}
          ></Segmented>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource.value}
          loading={loading.value}
          showHeader={false}
          pagination={pagination.value}
          onChange={handleTableChange}
          v-slots={{
            emptyText: () => (
              <Empty0
                style={{ marginTop: '50px' }}
                description={`暂无${curDocTypeName.value}的文档`}
              />
            ),
          }}
        ></Table>

        <AddKnowledge
          open={openAddKnowledge.value}
          onUpdate:open={(flag: boolean) => (openAddKnowledge.value = flag)}
        />
        <SelectKnowledgeForDocument
          open={openSelectKnowledge.value}
          onUpdate:open={(flag: boolean) => (openSelectKnowledge.value = flag)}
        />
      </Flex>
    )
  },
})
