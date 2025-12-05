<template>
  <el-container v-if="loading">
    <el-skeleton animated />
  </el-container>

  <el-container v-else-if="subject">
    <el-header height="auto" style="padding: 20px;">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover" :body-style="{ padding: '20px' }">
            <el-row :gutter="20">
              <el-col :span="18">
                <el-space direction="vertical" alignment="start" :size="10">
                  <el-space>
                    <el-tag effect="dark">{{ mapType(subject?.type) }}</el-tag>
                    <el-text>{{ subject?.air_date?.slice(0, 4) || '年代未知' }}</el-text>
                    <el-text>{{ subject?.eps_count ?? subject?.eps ?? '-' }} 话</el-text>
                  </el-space>

                  <el-text tag="h1" size="large" style="font-size: 24px; font-weight: bold;">{{ subject?.name_cn ||
                    subject?.name }}</el-text>
                  <el-text v-if="subject?.name_cn && subject?.name !== subject?.name_cn" type="info">{{ subject?.name
                  }}</el-text>

                  <el-row align="middle" :gutter="20">
                    <el-col :span="24">
                      <el-space :size="20">
                        <el-statistic :value="subject?.rating?.score ?? 0" :precision="1" title="评分">
                          <template #suffix>
                            <el-icon style="vertical-align: -0.125em">
                              <Star />
                            </el-icon>
                          </template>
                        </el-statistic>
                        <el-divider direction="vertical" />
                        <el-space :size="10">
                          <el-rate v-model="ratingValue" disabled show-score text-color="#ff9900" :max="10" />
                          <el-text size="small" type="info">Rank #{{ subject?.rank ?? '-' }}</el-text>
                        </el-space>
                        <el-divider direction="vertical" />
                        <el-button type="primary" :icon="Star" @click="onClickCollect" size="large">
                          {{ collected ? '已收藏' : '收藏' }}
                        </el-button>
                      </el-space>
                    </el-col>
                  </el-row>
                </el-space>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-header>

    <el-main>
      <el-row :gutter="20">
        <!-- 左侧栏 -->
        <el-col :xs="24" :sm="8" :md="6">
          <el-space direction="vertical" fill style="width: 100%" :size="20">
            <el-card :body-style="{ padding: '0px' }">
              <el-image :src="getCoverImage(subject)" fit="cover" style="width: 100%; display: block;"
                :preview-src-list="[getCoverImage(subject)]" />
            </el-card>

            <el-card header="放送信息">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="放送日">{{ subject?.air_weekday || '未知' }}</el-descriptions-item>
                <el-descriptions-item label="开播">{{ subject?.air_date || '-' }}</el-descriptions-item>
                <el-descriptions-item label="话数">{{ subject?.eps_count ?? subject?.eps ?? '-' }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-space>
        </el-col>

        <!-- 右侧栏 -->
        <el-col :xs="24" :sm="16" :md="18">
          <el-space direction="vertical" fill style="width: 100%" :size="20">

            <el-card header="简介 Story">
              <el-text style="white-space: pre-wrap; line-height: 1.6;">{{ subject?.summary || '暂无简介' }}</el-text>
            </el-card>

            <el-card header="角色 Characters">
              <el-row :gutter="12" v-if="getCharacters(subject).length">
                <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="(char, idx) in getCharacters(subject)" :key="idx"
                  style="margin-bottom: 12px;">
                  <el-card shadow="hover" :body-style="{ padding: '10px', textAlign: 'center' }">
                    <el-space direction="vertical" alignment="center">
                      <el-avatar :size="60" :src="char.images?.grid || char.image">{{ char.name[0] }}</el-avatar>
                      <el-text truncated style="width: 100%" :title="char.name">{{ char.name }}</el-text>
                      <el-text type="info" size="small" truncated>{{ char.role_name }}</el-text>
                    </el-space>
                  </el-card>
                </el-col>
              </el-row>
              <el-empty v-else description="暂无角色" />
            </el-card>

            <el-card header="制作人员 Staff">
              <el-space wrap v-if="subject?.staff?.length">
                <el-tag v-for="(s, i) in subject?.staff" :key="i" type="info" effect="plain">
                  {{ s.role_name }} : {{ s.name }}
                </el-tag>
              </el-space>
              <el-empty v-else description="暂无制作信息" />
            </el-card>

          </el-space>
        </el-col>
      </el-row>
    </el-main>

    <EditRatingDialog v-model="ratingDialogVisible" :subject="subject" @saved="onRatingSaved" />
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import EditRatingDialog from '../components/EditRatingDialog.vue'
import api from '../api/client.js'

const route = useRoute()
const appState = inject('appState')

const subject = ref(null)
const loading = ref(false)
const ratingValue = computed(() => subject.value?.rating?.score ? Number(subject.value.rating.score) : 0)
const ratingDialogVisible = ref(false)
const collected = ref(false)
const userCollection = ref({ rate: 0, comment: '' })

const load = async () => {
  loading.value = true
  try {
    const id = route.params.id
    if (!id) return
    const { data } = await api.get(`/subject/${id}`, { params: { responseGroup: 'large' } })
    subject.value = data
    if (appState?.loggedIn && appState?.userInfo?.username) await loadUserCollection()
  } finally {
    loading.value = false
  }
}

const loadUserCollection = async () => {
  try {
    const { data } = await api.get(`/v0/users/${appState.userInfo.username}/collections/${subject.value.id}`, { useToken: true })
    collected.value = true
  } catch (e) {
    collected.value = false
  }
}

const onClickCollect = () => {
  if (!appState?.loggedIn) {
    appState.loginBoxIsShow = true
    ElMessage.warning('请先登录以管理收藏')
    return
  }
  ratingDialogVisible.value = true
}

const onRatingSaved = (payload) => {
  // userCollection.value.rate = payload?.rate ?? 0
  // userCollection.value.comment = payload?.comment ?? ''
  collected.value = true
  ElMessage.success('收藏信息已更新')
}

const getCoverImage = (sub) => sub?.images?.large || sub?.images?.common || sub?.images?.grid || ''
const getCharacters = (sub) => sub?.crt || sub?.characters || []
const mapType = (t) => ({ 1: '书籍', 2: '动画', 3: '音乐', 4: '游戏', 6: '三次元' })[t ?? 0] || '条目'

onMounted(load)
</script>
