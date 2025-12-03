<template>
    <el-card>
        <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
                <span>每日放送</span>
                <el-button type="primary" @click="load" :loading="loading">刷新</el-button>
            </div>
        </template>
        <el-tabs v-model="active">
            <el-tab-pane v-for="g in calendar" :key="g.weekday.id" :label="g.weekday.cn" :name="String(g.weekday.id)">
                <el-row :gutter="16">
                    <el-col v-for="item in g.items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                        <el-card shadow="hover" style="margin-bottom:12px" @click="goSubject(item.id)">
                            <el-row :gutter="8">
                                <el-col :span="8">
                                    <el-image
                                        :src="item.images?.large || item.images?.common || item.images?.medium || item.images?.grid"
                                        fit="cover" style="width:100%;height:120px" />
                                </el-col>
                                <el-col :span="16">
                                    <div style="font-weight:600">{{ item.name_cn || item.name }}</div>
                                    <div style="color:#666">评分: {{ item.rating?.score ?? '-' }}</div>
                                    <div style="color:#666">话数: {{ item.eps_count ?? item.eps ?? '-' }}</div>
                                </el-col>
                            </el-row>
                        </el-card>
                    </el-col>
                </el-row>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import router from '../router'
import api from '../api/client'

const calendar = ref([])
const active = ref('1')
const loading = ref(false)

const load = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/calendar')
        calendar.value = data
        const jsDay = new Date().getDay() // 0-6, Sun=0
        const todayId = jsDay === 0 ? 7 : jsDay // API: Mon=1..Sun=7
        const exist = data?.find?.((g) => g?.weekday?.id === todayId)
        if (exist) active.value = String(todayId)
        else if (data?.[0]?.weekday?.id) active.value = String(data[0].weekday.id)
    } finally {
        loading.value = false
    }
}

const goSubject = (id) => router.push(`/subject/${id}`)

onMounted(load)
</script>