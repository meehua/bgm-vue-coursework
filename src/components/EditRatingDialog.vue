<template>
    <el-dialog v-model="visibleInner" :title="dialogTitle" width="500px">
        <div v-loading="loading" element-loading-text="加载中...">
            <el-form label-width="80px">
                <el-form-item label="状态">
                    <div class="flex flex-col items-start gap-4">
                        <el-segmented v-model="epStatus" :options="epStatusList" size="default" />
                    </div>
                </el-form-item>
                <el-form-item label="评分">
                    <el-space :size="15">
                        <el-rate v-model="rate" :max="10" />
                        <el-text type="primary">{{ rate == 0 ? '未评分' : rate }}</el-text>
                        <el-button type="danger" :icon="Delete" circle @click="rate = 0" />
                    </el-space>
                </el-form-item>
                <el-form-item label="评语">
                    <el-input v-model="comment" type="textarea" :rows="4" maxlength="200" show-word-limit />
                </el-form-item>
            </el-form>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
                <el-button @click="visibleInner = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="save">保存</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, watch, inject, computed } from 'vue'
import { ElNotification } from 'element-plus'
import api from '../api/client'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
    subjectId: Number,
    modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'saved'])

const appState = inject('appState')
const visibleInner = ref(false)
const loading = ref(false)
const saving = ref(false)
const rate = ref(0)
const comment = ref('')
const subjectName = ref('')
const dialogTitle = computed(() => subjectName.value ? `收藏条目 · ${subjectName.value}` : '收藏条目')


const STATUS_OPTIONS = [
    { label: '想看', value: 1 },
    { label: '看过', value: 2 },
    { label: '在看', value: 3 },
    { label: '搁置', value: 4 },
    { label: '抛弃', value: 5 }
]

// 创建双向映射
const labelToValueMap = {
    '想看': 1,
    '看过': 2,
    '在看': 3,
    '搁置': 4,
    '抛弃': 5
}

const valueToLabelMap = {
    1: '想看',
    2: '看过',
    3: '在看',
    4: '搁置',
    5: '抛弃'
}

// 工具函数
const getValueByLabel = (label) => {
    return labelToValueMap[label] || 0
}

const getLabelByValue = (value) => {
    return valueToLabelMap[value] || ''
}

// 获取纯标签数组（给组件用）
const getLabelList = () => {
    return STATUS_OPTIONS.map(item => item.label)
}

const epStatus = ref('')
const epStatusList = getLabelList()

watch(() => props.modelValue, (v) => {
    subjectName.value = ''
    visibleInner.value = v
    if (v) load()
})

watch(visibleInner, (v) => emit('update:modelValue', v))

const load = async () => {
    if (!appState.userInfo?.username) return
    loading.value = true
    try {
        const { data } = await api.get(`/v0/users/${appState.userInfo.username}/collections/${props.subjectId}`, { useToken: true })
        rate.value = data?.rate ?? 0
        comment.value = data?.comment ?? ''
        epStatus.value = getLabelByValue(data?.type) || ''
        subjectName.value = data?.subject?.name_cn || data?.subject?.name || ''
    } catch (error) {
        ElNotification({ title: '错误', message: error?.response?.data?.message || '加载失败', type: 'error' })
    } finally {
        loading.value = false
    }
}

const save = async () => {
    saving.value = true
    try {
        if (rate.value < 0 || rate.value > 10) {
            ElNotification({ title: '提示', message: '请选择 1-10 的整数评分', type: 'warning' })
            saving.value = false
            return
        }
        await api.post(`/v0/users/-/collections/${props.subjectId}`, { rate: rate.value, comment: comment.value, type: getValueByLabel(epStatus.value) }, { useToken: true })
        ElNotification({ title: '成功', message: '已保存评分与评价', type: 'success' })
        emit('saved', { rate: rate.value, comment: comment.value })
        visibleInner.value = false
    } catch (error) {
        ElNotification({ title: '错误', message: error?.response?.data?.message || '保存失败', type: 'error' })
    } finally {
        saving.value = false
    }
}
</script>