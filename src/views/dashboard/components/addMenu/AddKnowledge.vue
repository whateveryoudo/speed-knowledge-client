<template>
    <s-full-modal width="424px" :open="open" title="新建知识库" :footer="false" @cancel="handleCancel">
        <a-form ref="formRef">
            <!-- 基本信息 -->
            <div class="mb-6">
                <div class="mt-4 mb-2 text-[var(--ant-color-text)]">基本信息</div>

                <a-form-item name="name" label="" class="mb-3">
                    <a-flex :gap="6">
                        <KnowledgeIconSelect v-model:value="form.icon" />
                        <a-input v-model:value="form.name" placeholder="知识库名称" />
                    </a-flex>
                </a-form-item>
                <a-form-item name="description" label="">
                    <a-textarea v-model:value="form.description" placeholder="请输入知识库简介" :rows="4" :maxlength="200" />
                </a-form-item>
            </div>

            <!-- 新建至 -->
            <div class="mb-6">
                <div class="mb-2 text-[var(--ant-color-text)]">新建至</div>
                <a-form-item name="owner">
                    <a-input v-model:value="form.owner" disabled>
                        <template #prefix>
                            <img :src="avatarDef" class="w-[24px] h-[24px] rounded-full" />
                        </template>
                    </a-input>
                </a-form-item>
            </div>

            <!-- 分组 -->
            <div class="mb-6">
                <div class="mb-2 text-[var(--ant-color-text)]">分组</div>
                <a-form-item name="group">
                    <a-select v-model:value="form.group" placeholder="请选择分组">
                        <a-select-option value="default">我的知识库</a-select-option>
                    </a-select>
                </a-form-item>
            </div>
        </a-form>
        <a-button block type="primary" :class="[!canSubmit && 'opacity-50 cursor-not-allowed']" :loading="loading" @click="handleOk">
            新建
        </a-button>
    </s-full-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IconFont } from 'speed-components-ui/components'
import { UserOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'
import avatarDef from '@/assets/images/avatar_def.png'
import KnowledgeIconSelect from './KnowledgeIconSelect.vue'

interface Props {
    open?: boolean
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'ok', values: FormValues): void
}

interface FormValues {
    name: string
    description?: string
    owner: string
    group: string
}

const props = withDefaults(defineProps<Props>(), {
    open: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref<FormValues>({
    name: '',
    description: '',
    owner: '个人',
    group: 'default'
})

const rules = {
    name: [
        { required: true, message: '请输入知识库名称', trigger: 'blur' }
    ],
    group: [
        { required: true, message: '请选择分组', trigger: 'change' }
    ]
}

// 通过 watch 字段判断按钮是否可用
const canSubmit = computed(() => {
    return !!form.value.name.trim() && !!form.value.group
})

// 监听 open 变化，重置表单
watch(() => props.open, (val) => {
    if (val) {
        // 打开时重置表单
        form.value = {
            name: '',
            description: '',
            owner: '个人',
            group: 'default'
        }
        formRef.value?.clearValidate()
    }
})





const handleOk = async () => {
    if (!canSubmit.value) return
    try {
        loading.value = true

        // 模拟提交
        setTimeout(() => {
            emit('ok', { ...form.value })
            emit('update:open', false)
            loading.value = false
        }, 500)
    } catch (error) {
        console.error('表单验证失败:', error)
    }
}

const handleCancel = () => {
    emit('update:open', false)
}
</script>

<style lang="less" scoped>
:deep(.ant-form-item-label) {
    font-weight: 500;
}
</style>