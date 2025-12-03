<template>
  <el-card>
    <template #header>
      <div style="display:flex;gap:8px;align-items:center">
        <span>搜索</span>
        <el-input v-model="keyword" placeholder="输入关键字" clearable style="max-width:360px" @keyup.enter="search" />
        <el-select v-model="type" placeholder="类型" style="width:140px">
          <el-option v-for="t in types" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="search">搜索</el-button>
      </div>
    </template>
    <el-empty v-if="!loading && results.length === 0" description="无结果" />
    <el-row v-else :gutter="16">
      <el-col v-for="item in results" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" style="margin-bottom:12px" @click="goSubject(item.id)">
          <el-row :gutter="8">
            <el-col :span="8">
              <el-image :src="item.images?.large" fit="cover" style="width:100%;height:120px" />
            </el-col>
            <el-col :span="16">
              <div style="font-weight:600">{{ item.name_cn || item.name }}</div>
              <div style="color:#666">评分: {{ item.rating?.score ?? '-' }}</div>
              <div style="color:#666">放送: {{ item.air_date || '-' }}</div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <div style="display:flex;justify-content:center;margin-top:12px" v-if="results.length > 0">
      <el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="onPage" />
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import router from '../router'
import api from '../api/client.js'

const keyword = ref('')
const type = ref(2)  // 移除类型注解
const types = [
  { label: '书籍', value: 1 },
  { label: '动画', value: 2 },
  { label: '音乐', value: 3 },
  { label: '游戏', value: 4 },
  { label: '三次元', value: 6 }
]
const results = ref([])  // 移除类型注解
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)

const search = async () => {
  if (!keyword.value) return
  loading.value = true
  try {
    const path = `/search/subject/${encodeURIComponent(keyword.value)}`
    const { data } = await api.get(path, {
      params: {
        responseGroup: 'small',
        type: type.value !== null && type.value !== undefined ? type.value : undefined,  // 用条件表达式替换 ?? 操作符
        start: (page.value - 1) * pageSize,
        max_results: pageSize
      }
    })
    results.value = data.list || data || []
    total.value = data.results || results.value.length
  } finally {
    loading.value = false
  }
}

const onPage = (p) => {  // 移除参数类型注解
  page.value = p
  search()
}

const goSubject = (id) => router.push(`/subject/${id}`)  // 移除参数类型注解
</script>