<template>
  <el-card>
    <template #header>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span>条目详情</span>
        <el-button @click="toComments">查看评论</el-button>
      </div>
    </template>

    <el-skeleton v-if="loading" :rows="6" animated />
    <div v-else>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-image
            :src="subject?.images?.large || subject?.images?.grid"
            fit="contain"
            style="width:100%;height:300px"
          />
        </el-col>
        <el-col :span="18">
          <h2 style="margin:0 0 8px">{{ subject?.name_cn || subject?.name }}</h2>
          <div style="margin-bottom:6px">评分 {{ subject?.rating?.score ?? '-' }} 排名 {{ subject?.rank ?? '-' }}</div>
          <div style="margin-bottom:12px">{{ subject?.summary }}</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="类型">{{ mapType(subject?.type) }}</el-descriptions-item>
            <el-descriptions-item label="话数">{{ subject?.eps_count ?? subject?.eps ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="开播">{{ subject?.air_date || '-' }}</el-descriptions-item>
            <el-descriptions-item label="放送日">{{ subject?.air_weekday || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-divider />
      <div>
        <h3 style="margin:0 0 8px">制作人员</h3>
        <el-table :data="subject?.staff || []" size="small">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="role_name" label="职位" />
        </el-table>
      </div>

      <el-divider />
      <div>
        <h3 style="margin:0 0 8px">角色</h3>
        <el-table :data="subject?.crt || subject?.characters || []" size="small">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="role_name" label="类型" />
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api/client'

const route = useRoute()
const router = useRouter()

const subject = ref<any>(null)
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const id = route.params.id
    if (!id) return
    const { data } = await api.get(`/subject/${id}`, { params:{responseGroup:'large'} })
    subject.value = data
  } finally {
    loading.value = false
  }
}

const toComments = () => router.push(`/subject/${route.params.id}/comments`)
const mapType = (t:number|undefined) => ({1:'书籍',2:'动画',3:'音乐',4:'游戏',6:'三次元'} as any)[t??0]||'-'

onMounted(load)
</script>
