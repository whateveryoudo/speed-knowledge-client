import { defineComponent, ref, type PropType } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { Button, Dropdown, Menu } from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'
import { type ItemType } from 'ant-design-vue'
import { document as documentApi } from '@sk/api'
import { DocumentType, DocumentNodeType, type DocumentNodeItem } from '@sk/types'
import { to } from 'await-to-js'
import ImportModal from '../import/index.vue'

export default defineComponent({
  name: 'AddMenu',
  emits: ['add-document-cb', 'add-catalog-node-cb', 'open-change'],
  props: {
    knowledgeId: {
      type: String,
      required: true,
    },
    parentId: {
      type: String as PropType<string | null>,
      default: null,
    },
    triggerType: {
      type: String as PropType<'default' | 'icon'>,
      default: 'default',
    },
    popoverTrigger: {
      type: String as PropType<'click' | 'hover'>,
      default: 'hover',
    },
  },
  setup(props, { emit }) {
    const open = ref(false)
    const importVisible = ref(false)
    const items = ref<ItemType[]>([
      {
        label: '文档',
        key: 'word',
        icon: (
          <IconFont type="icon-document" svg-sprite style={{ width: '18px', height: '18px' }} />
        ),
      },
      {
        label: '表格',
        key: 'sheet',
        icon: <IconFont type="icon-sheet" svg-sprite style={{ width: '18px', height: '18px' }} />,
      },
      {
        type: 'divider',
      },
      {
        label: '导入',
        key: 'import',
        icon: (
          <IconFont type="icon-document-import" svg-sprite style={{ width: '18px', height: '18px' }} />
        ),
      },
      {
        type: 'divider',
      },
      {
        label: '新建分组',
        key: 'group',
        icon: <IconFont type="icon-group" svg-sprite style={{ width: '18px', height: '18px' }} />,
      },
    ])

    const resolveParentId = () => props.parentId || null

    const handleMenuClick = async (info: { key: string | number }) => {
      const key = String(info.key)
      open.value = false
      const parent_id = resolveParentId()

      if (key === 'import') {
        importVisible.value = true
        return
      }

      if (key === DocumentType.WORD || key === DocumentType.SHEET) {
        const [error, res] = await to(
          documentApi.addDocument({
            knowledge_id: props.knowledgeId,
            type: key,
            name: key === DocumentType.WORD ? '无标题文档' : '无标题表格',
            parent_id,
          }),
        )
        if (!error) {
          emit('add-document-cb', res.data)
        }
        return
      }

      if (key === DocumentType.GROUP) {
        const [error, res] = await to(
          documentApi.createCatalogNode({
            knowledge_id: props.knowledgeId,
            type: DocumentNodeType.TITLE,
            name: '无标题分组',
            parent_id,
          }),
        )
        if (!error) {
          emit('add-catalog-node-cb', res.data)
        }
      }
    }

    const handleOpenChange = (visible: boolean) => {
      open.value = visible
      emit('open-change', visible)
    }

    const handleImportSuccess = (node: DocumentNodeItem) => {
      emit('add-document-cb', node)
    }

    const renderMenu = () => {
      return <Menu items={items.value} onClick={handleMenuClick} />
    }

    return () => (
      <>
        <Dropdown
          open={open.value}
          overlayClassName="w-[120px]"
          placement="bottomLeft"
          trigger={props.popoverTrigger}
          overlay={renderMenu()}
          onOpenChange={handleOpenChange}
        >
          {props.triggerType === 'icon' ? (
            <Button
              type="text"
              class="shadow-btn-wrapper icon"
              onClick={(e: Event) => e.stopPropagation()}
            >
              <PlusOutlined />
            </Button>
          ) : (
            <Button type="default" class="px-2">
              <PlusOutlined />
            </Button>
          )}
        </Dropdown>
        <ImportModal
          visible={importVisible.value}
          knowledgeId={props.knowledgeId}
          parentId={props.parentId}
          onUpdate:visible={(v: boolean) => {
            importVisible.value = v
          }}
          onSuccess={handleImportSuccess}
        />
      </>
    )
  },
})
