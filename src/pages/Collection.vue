<template>
    <div class="common-layout">
        <el-card>
            <template #header>
                <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
                    <span>收藏夹</span>
                    <el-select v-model="collectionType" placeholder="收藏类型" style="width:180px">
                        <el-option label="全部" value="all" />
                        <el-option label="想看" value="1" />
                        <el-option label="在看" value="3" />
                        <el-option label="看过" value="2" />
                        <el-option label="搁置" value="4" />
                        <el-option label="抛弃" value="5" />
                    </el-select>
                    <el-select v-model="subjectType" placeholder="条目类型" style="width:200px">
                        <el-option label="全部" :value="'all'" />
                        <el-option v-for="opt in subjectTypeOptions" :key="opt.value" :label="opt.label"
                            :value="opt.value" />
                    </el-select>
                </div>
            </template>

            <div v-loading="loading" element-loading-text="加载中...">
                <el-empty v-if="!loading && visibleItems.length === 0" :description="emptyDescription" />

                <div v-else v-infinite-scroll="loadMore" :infinite-scroll-disabled="loadingMore || !hasMore"
                    :infinite-scroll-distance="50">
                    <el-row :gutter="16">
                        <el-col v-for="item in visibleItems" :key="item.subject_id" :xs="24" :sm="12" :md="8" :lg="6">
                            <el-card shadow="hover" style="margin-bottom:12px; position:relative"
                                @click="openEdit(item)">
                                <el-row :gutter="8">
                                    <el-col :span="8">
                                        <el-image :src="imgSrc(item)" fit="cover" style="width:100%;height:140px"
                                            lazy />
                                    </el-col>
                                    <el-col :span="16">
                                        <div style="font-weight:600">{{ item.subject?.name_cn || item.subject?.name }}
                                        </div>
                                        <div style="color:#666;margin:4px 0">站内评分 {{ item.subject?.score ?? '-' }}</div>
                                        <div style="color:#666">我的评分 {{ item.rate || '-' }}</div>
                                        <div class="comment">{{ item.comment || '暂无评语' }}</div>
                                    </el-col>
                                </el-row>
                                <div style="position:absolute;right:12px;bottom:12px">
                                    <el-button size="small" type="primary"
                                        @click.stop="toDetail(item.subject_id)">详情</el-button>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                    <div style="display:flex;justify-content:center;margin:12px 0" v-if="loadingMore">
                        <el-text type="info">加载中...</el-text>
                    </div>
                </div>
            </div>
        </el-card>
        <el-backtop :right="24" :bottom="24" />
        <EditRatingDialog :subject-id="editingId" v-model="editVisible" @saved="onSaved" />
    </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import EditRatingDialog from '../components/EditRatingDialog.vue'
import api from '../api/client.js'

const appState = inject('appState')
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const loadingMore = ref(false)
const results = ref([])
const emptyDescription = ref('')
const hasMore = ref(true)
const limit = 30
const offset = ref(0)

const collectionType = ref(route.query.type || 'all')
const subjectType = ref(route.query.subject_type ? Number(route.query.subject_type) : 'all')
const subjectTypeOptions = [
    { label: '书籍', value: 1 },
    { label: '动画', value: 2 },
    { label: '音乐', value: 3 },
    { label: '游戏', value: 4 },
    { label: '三次元', value: 6 },
]

const visibleItems = computed(() => results.value)

const syncQuery = () => {
    const q = { type: collectionType.value }
    if (subjectType.value !== 'all') q.subject_type = String(subjectType.value)
    router.replace({ path: '/collection', query: q })
}

watch([collectionType, subjectType], () => {
    syncQuery()
    reload(true)
})

const imgSrc = (item) => item.subject?.images?.large || item.subject?.images?.grid

const setEmpty = () => {
    if (!appState?.loggedIn) emptyDescription.value = '请先登录以查看收藏'
    else emptyDescription.value = '暂无收藏'
}

const load = async () => {
    if (!appState.userInfo?.username) { setEmpty(); return }
    loading.value = true
    try {
        const params = { limit, offset: offset.value }
        if (collectionType.value !== 'all') params.type = Number(collectionType.value)
        if (subjectType.value !== 'all') params.subject_type = Number(subjectType.value)
        const { data } = await api.get(`/v0/users/${appState.userInfo.username}/collections`, {
            params,
            useToken: true
        })
        const list = data?.data || []
        if (offset.value === 0) results.value = list
        else results.value = results.value.concat(list)
        const total = data?.total ?? list.length
        hasMore.value = results.value.length < total
        if (results.value.length === 0) setEmpty()
    } catch (error) {
        ElNotification({ title: '错误', message: error?.response?.data?.message || '加载失败', type: 'error' })
        setEmpty()
    } finally {
        loading.value = false
    }
}

const reload = async (reset = false) => {
    if (reset) {
        offset.value = 0
        hasMore.value = true
    }
    await load()
}

const loadMore = async () => {
    if (loading.value || loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
        offset.value += limit
        await load()
    } finally {
        loadingMore.value = false
    }
}

const toDetail = (id) => router.push(`/subject/${id}`)

const editVisible = ref(false)
const editingId = ref(0)
const openEdit = (item) => { editingId.value = item.subject_id; editVisible.value = true }
const onSaved = (payload) => {
    const idx = results.value.findIndex(i => i.subject_id === editingId.value)
    if (idx >= 0) {
        results.value[idx].rate = payload.rate
        results.value[idx].comment = payload.comment
    }
}

watch([() => appState.loggedIn, () => appState.userInfo], ([loggedIn, userInfo]) => {
    if (loggedIn && userInfo?.username) reload(true)
    else {
        results.value = []
        setEmpty()
    }
}, { immediate: true })
</script>

<style scoped>
.comment {
    color: #666;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden
}
</style>