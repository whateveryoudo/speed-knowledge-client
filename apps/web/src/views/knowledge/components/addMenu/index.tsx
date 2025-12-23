import { defineComponent, ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { Tooltip, Button, Dropdown, Menu } from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'
import { type ItemType } from 'ant-design-vue'
import { document as documentApi } from '@sk/api'
import  { type DocumentItem, DocumentType } from '@sk/types'
import { to } from 'await-to-js'
export default defineComponent({
  name: 'AddMenu',
  emits: ['add-document-cb'],
  props: {
    knowledgeId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const items = ref<ItemType[]>([
      {
        label: '文档',
        key: 'word',
        icon: (
          <IconFont type="icon-document" svg-sprite style={{ width: '18px', height: '18px' }} />
        ),
      },
    ])
    const handleMenuClick = async ({ key }: { key: string | number }) => {
      if (key === 'word') {
        // 直接调用新增接口
        const [error, res] = await to(documentApi.addDocument({
          knowledge_id: props.knowledgeId,
          type: DocumentType.WORD,
          name: '无标题文档',
        }));
        if (!error) {
          emit('add-document-cb',res.data)
        }
      }
    }
    const renderMenu = () => {
      return <Menu items={items.value} onClick={handleMenuClick} />
    }

    return () => (
      <>
        <Dropdown placement="bottomLeft" overlay={renderMenu()}>
          <Button type="default" class="px-2">
            <PlusOutlined />
          </Button>
        </Dropdown>
      </>
    )
  },
})
