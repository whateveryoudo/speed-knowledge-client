import { defineComponent, ref } from 'vue'
import type { ModuleMenuItem } from '../../type'
import { ClockCircleOutlined, ClockCircleFilled, PlusOutlined } from '@ant-design/icons-vue'
import { Tooltip, Button, Dropdown, Menu } from 'ant-design-vue'
import { IconFont } from 'speed-components-ui/components'
import { type ItemType } from 'ant-design-vue';
import AddKnowledge from './AddKnowledge.vue'
import SelectKnowledgeForDocument from './SelectKnowledgeForDocument.vue'

export default defineComponent({
    name: 'AddMenu',
    emits: ['add-knowledge-cb'],
    setup(props, { emit }) {
        const openAddKnowledge = ref(false)
        const openSelectKnowledge = ref(false)
        const items = ref<ItemType[]>([
            {
                label: '文档',
                key: 'document',
                icon: <IconFont type="icon-document" svg-sprite style={{ width: '18px', height: '18px' }} />,
            },
            { type: 'divider' },
            {
                label: '知识库',
                key: 'knowledge-base',
                icon: <IconFont type="icon-book-0" svg-sprite style={{ width: '18px', height: '18px' }} />,
            },
        ])
        const handleMenuClick = ({ key }: { key: string | number }) => {
            if (key === 'knowledge-base') {
                openAddKnowledge.value = true
            }
            if (key === 'document') {
                openSelectKnowledge.value = true
            }
        }
        const renderMenu = () => {
            return (
                <Menu items={items.value} onClick={handleMenuClick} />
            )
        }

        return () => <>
            <Dropdown placement="bottomLeft" overlay={renderMenu()} >
                <Button type="default" class="px-2">
                    <PlusOutlined />
                </Button>
            </Dropdown>
            <AddKnowledge open={openAddKnowledge.value} onOk={(knowledge) => emit('add-knowledge-cb', knowledge)}
                onUpdate:open={(flag: boolean) => openAddKnowledge.value = flag}
            />
            <SelectKnowledgeForDocument
                open={openSelectKnowledge.value}
                onUpdate:open={(flag: boolean) => (openSelectKnowledge.value = flag)}
            />
        </>
    }
});