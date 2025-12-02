<template>
  <div class="common-layout">
    <el-container>

      <!-- 搜索栏 -->
      <el-header>
        <el-input
          v-model="input"
          style="width: 240px"
          placeholder="请输入搜索内容"
          @keyup.enter="search"
        />
        <el-button type="primary" :loading="loading" @click="search">搜索</el-button>
      </el-header>

      <!-- 展示区 -->
      <el-main>
        <!-- 搜索结果为空显示 -->
        <el-empty v-if="!loading && results.length === 0" description="无结果" />

        <!-- 搜索结果列表 -->
        <el-row :gutter="16">
          <el-col
            v-for="item in results.slice(0, 16)"
            :key="item.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card shadow="hover" style="margin-bottom:12px" @click="goSubject(item.id)">
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-image :src="item.images?.large" fit="cover" style="width:100%;height:120px" />
                </el-col>
                <el-col :span="16">
                  <div style="font-weight:600">{{ item.name_cn || item.name }}</div>
                  <div class="summary">{{ item.summary || '-' }}</div>
                  <div style="color:#666">发行时间: {{ item.air_date || '-' }}</div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>

        <!-- 分页 -->
        <div style="display:flex;justify-content:center;margin-top:12px" v-if="results.length > 0">
          <el-pagination
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="total"
            @current-change="onPage"
          />
        </div>
      </el-main>

    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import router from '../router'
import api from '../../api/client'

const input = ref('')        // 搜索关键词
const results = ref<any[]>([]) // 搜索结果
const total = ref(0)         // 总条目数
const page = ref(1)          // 当前页码
const pageSize = 25          // 每页数量
const loading = ref(false)   // 加载状态

// 搜索函数
const search = async () => {
  if (!input.value) return
  loading.value = true
  try {
    const path = `/search/subject/${encodeURIComponent(input.value)}`
    const { data } = await api.get(path, {
      params: {
        responseGroup: 'large',
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

// 分页处理
const onPage = (p: number) => {
  page.value = p
  search()
}

// 跳转到详情
const goSubject = (id: number) => router.push(`/subject/${id}`)
</script>

<style scoped>
.summary {
  color: #666;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4em;
  max-height: 2.8em;
}
</style>
