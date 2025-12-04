<template>
  <div class="hybrid-page">

    <!-- 加载骨架屏 -->
    <div v-if="loading" class="loading-box">
      <el-skeleton animated>
        <template #template>
          <div style="height: 380px; background: #e0e0e0;"></div>
          <div style="max-width: 1140px; margin: -100px auto 0; padding: 0 20px; display: flex; gap: 30px">
            <el-skeleton-item variant="image" style="width: 260px; height: 360px; border-radius: 12px" />
            <div style="flex: 1; padding-top: 120px">
              <el-skeleton-item variant="h1" style="width: 40%" />
              <el-skeleton-item variant="text" :rows="4" style="margin-top: 20px" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="subject" class="main-wrapper">

      <!-- ================= 1. 顶部沉浸区 ================= -->
      <div class="hero-header">
        <!-- 动态模糊背景 -->
        <div class="hero-backdrop" :style="{ backgroundImage: `url(${getCoverImage(subject)})` }"></div>
        <div class="hero-mask"></div>

        <div class="hero-container">
          <div class="hero-content">
            <!-- 核心信息 -->
            <div class="hero-meta">
              <el-tag effect="dark" round color="rgba(255,255,255,0.2)" style="border:none; color:#fff">
                {{ mapType(subject?.type) }}
              </el-tag>
              <span>{{ subject?.air_date?.slice(0, 4) || '年代未知' }}</span>
              <span>{{ subject?.eps_count ?? subject?.eps ?? '-' }} 话</span>
            </div>

            <h1 class="hero-title">{{ subject?.name_cn || subject?.name }}</h1>
            <h2 class="hero-subtitle" v-if="subject?.name_cn && subject?.name !== subject?.name_cn">{{ subject?.name }}
            </h2>

            <!-- 评分玻璃条 -->
            <div class="glass-rating-bar">
              <div class="rating-block">
                <span class="score">{{ subject?.rating?.score ?? '0.0' }}</span>
                <div class="stars-wrapper">
                  <el-rate v-model="ratingValue" disabled text-color="#ff9900"
                    disabled-void-color="rgba(255,255,255,0.3)" score-template="" :max="10" />
                  <span class="rank-text">Rank #{{ subject?.rank ?? '-' }}</span>
                </div>
              </div>

              <div class="divider"></div>

              <!-- 按钮组：已删除评论按钮，只保留收藏 -->
              <div class="action-group">
                <button class="glass-btn primary">
                  <el-icon>
                    <Star />
                  </el-icon> 收藏
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 2. 下方内容区 ================= -->
      <div class="body-container">
        <div class="layout-grid">

          <!-- 左侧：跨界海报 -->
          <div class="poster-sidebar">
            <div class="poster-wrapper">
              <el-image :src="getCoverImage(subject)" fit="cover" class="poster-image"
                :preview-src-list="[getCoverImage(subject)]" />
            </div>

            <!-- 侧边信息栏 -->
            <div class="sidebar-info">
              <h3 class="sidebar-title">放送信息</h3>
              <ul class="info-list">
                <li><span class="label">放送日</span> <span class="val">{{ subject?.air_weekday || '未知' }}</span></li>
                <li><span class="label">开播</span> <span class="val">{{ subject?.air_date || '-' }}</span></li>
                <li><span class="label">话数</span> <span class="val">{{ subject?.eps_count ?? subject?.eps ?? '-'
                    }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- 右侧：主要内容 -->
          <div class="content-main">
            <!-- 简介 -->
            <div class="content-section">
              <h3 class="section-title">简介 <small>Story</small></h3>
              <p class="summary-text">{{ subject?.summary || '暂无简介' }}</p>
            </div>

            <!-- 角色 -->
            <div class="content-section">
              <h3 class="section-title">角色 <small>Characters</small></h3>
              <div class="char-grid" v-if="getCharacters(subject).length">
                <div v-for="(char, idx) in getCharacters(subject)" :key="idx" class="char-card">
                  <el-avatar :size="50" :src="char.images?.grid || char.image" shape="circle" class="char-avatar">
                    {{ char.name[0] }}
                  </el-avatar>
                  <div class="char-details">
                    <div class="char-name" :title="char.name">{{ char.name }}</div>
                    <div class="char-role">{{ char.role_name }}</div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无角色" :image-size="60" />
            </div>

            <!-- Staff -->
            <div class="content-section">
              <h3 class="section-title">制作人员 <small>Staff</small></h3>
              <div class="staff-grid" v-if="subject?.staff?.length">
                <div v-for="(s, i) in subject?.staff" :key="i" class="staff-item">
                  <span class="staff-role">{{ s.role_name }}</span>
                  <span class="staff-name">{{ s.name }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无制作信息" :image-size="60" />
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
// 移除了 ChatLineSquare，只保留 Star
import { Star } from '@element-plus/icons-vue'
import api from '../api/client'

const route = useRoute()

const subject = ref<any>(null)
const loading = ref(false)
const ratingValue = computed(() => subject.value?.rating?.score ? Number(subject.value.rating.score) : 0)

const load = async () => {
  loading.value = true
  try {
    const id = route.params.id
    if (!id) return
    const { data } = await api.get(`/subject/${id}`, { params: { responseGroup: 'large' } })
    subject.value = data
  } finally {
    loading.value = false
  }
}

const getCoverImage = (sub: any) => sub?.images?.large || sub?.images?.common || sub?.images?.grid || ''
const getCharacters = (sub: any) => sub?.crt || sub?.characters || []
const mapType = (t: number | undefined) => ({ 1: '书籍', 2: '动画', 3: '音乐', 4: '游戏', 6: '三次元' } as any)[t ?? 0] || '条目'

onMounted(load)
</script>

<style scoped>
/* 全局设定 */
.hybrid-page {
  background-color: #f6f7f8;
  min-height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

/* 核心布局容器 */
.hero-container,
.body-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  box-sizing: border-box;
}

/* ================= Header ================= */
.hero-header {
  position: relative;
  height: 420px;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  color: #fff;
}

.hero-backdrop {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-size: cover;
  background-position: center 20%;
  filter: blur(35px) brightness(0.5);
  z-index: 1;
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.1) 100%);
  z-index: 2;
}

.hero-container {
  z-index: 3;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

/* 
  左侧 padding 预留给海报 
  260px (海报宽) + 40px (Gap) = 300px
*/
.hero-content {
  padding-left: 300px;
  width: 100%;
  box-sizing: border-box;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  margin: 0 0 5px 0;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-subtitle {
  font-size: 20px;
  font-weight: 400;
  margin: 0 0 25px 0;
  color: rgba(255, 255, 255, 0.7);
}

/* 玻璃评分条 */
.glass-rating-bar {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 24px;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.rating-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score {
  font-size: 38px;
  font-weight: bold;
  color: #ffcc00;
  line-height: 1;
  letter-spacing: -1px;
}

.stars-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.rank-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
}

.action-group {
  display: flex;
  gap: 12px;
}

.glass-btn {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 24px;
  /* 稍微加宽一点 */
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-size: 14px;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

/* Primary 样式 (白色实心) */
.glass-btn.primary {
  background: #fff;
  color: #000;
  border-color: #fff;
  font-weight: 600;
}

.glass-btn.primary:hover {
  background: #eee;
}

/* ================= Body ================= */
.layout-grid {
  display: flex;
  gap: 40px;
  position: relative;
  z-index: 4;
}

/* 左侧海报区 */
.poster-sidebar {
  width: 260px;
  flex-shrink: 0;
}

.poster-wrapper {
  width: 260px;
  height: 364px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  border: 4px solid #fff;
  margin-top: -220px;
  /* 负边距上浮 */
  background: #e0e0e0;
  position: relative;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.sidebar-info {
  margin-top: 24px;
}

.sidebar-title {
  font-size: 16px;
  border-left: 4px solid #fb7299;
  padding-left: 10px;
  margin-bottom: 12px;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.info-list .label {
  color: #888;
}

.info-list .val {
  font-weight: 500;
  color: #333;
}

/* 右侧内容区 */
.content-main {
  flex: 1;
  padding-top: 20px;
  padding-bottom: 60px;
  min-width: 0;
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #333;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.section-title small {
  font-size: 13px;
  color: #bbb;
  font-weight: 400;
  text-transform: uppercase;
}

.summary-text {
  color: #555;
  line-height: 1.8;
  font-size: 15px;
  text-align: justify;
}

/* Grid 样式 */
.char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.char-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  transition: transform 0.2s;
  border: 1px solid transparent;
}

.char-card:hover {
  transform: translateY(-3px);
  background: #fff;
  border-color: #eee;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.char-avatar {
  flex-shrink: 0;
  background: #eee;
}

.char-details {
  overflow: hidden;
}

.char-name {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.char-role {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px 20px;
}

.staff-item {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.staff-role {
  color: #fb7299;
  background: rgba(251, 114, 153, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;
}

.staff-name {
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>