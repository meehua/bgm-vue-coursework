<template>
    <el-dialog v-model="appState.loginBoxIsShow" width="400px">
        <div v-loading="loading" element-loading-text="加载中...">
            <div v-if="appState.loggedIn" class="user-info">
                <div class="avatar-container">
                    <el-avatar :size="80" :src="avatarSrc" fit="cover" />
                </div>
                <div class="user-details">
                    <el-text tag="h3" size="large" class="nickname">{{ nickname }}</el-text>
                    <el-divider />
                    <el-text class="sign-text">{{ sign || '这个人很懒，还没有签名~' }}</el-text>
                    <div class="logout-btn">
                        <el-button type="info" plain @click="logout">退出登录</el-button>
                    </div>
                </div>
            </div>
            <div v-else class="login-container">
                <el-text tag="h3" size="large" class="login-title">输入你的访问令牌</el-text>
                <el-divider />
                <el-form label-width="auto" style="margin-top: 20px;">
                    <el-form-item label="Access Token">
                        <el-input v-model="appState.accessToken" placeholder="输入或粘贴访问令牌" type="password" show-password
                            clearable @keyup.enter="saveToken" />
                    </el-form-item>

                    <el-form-item>
                        <div style="display: flex; justify-content: space-between; width: 100%;">
                            <el-button type="primary" @click="saveToken" :loading="loading">
                                保存令牌
                            </el-button>
                            <el-link type="primary" href="https://next.bgm.tv/demo/access-token" target="_blank"
                                :icon="Link">
                                获取令牌
                            </el-link>
                        </div>
                    </el-form-item>

                    <el-alert title="令牌说明" type="info" :closable="false" show-icon style="margin-top: 10px;">
                        <template #default>
                            <el-text size="small">
                                访问令牌将保存在浏览器本地，仅与 bangumi API 通信时使用。请妥善保管，不要泄露给他人。
                            </el-text>
                        </template>
                    </el-alert>
                </el-form>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Link } from '@element-plus/icons-vue'
import api from '../api/client.js'

const appState = inject('appState')
const loading = ref(false)
const avatarSrc = ref('')
const nickname = ref('')
const sign = ref('')

// 检查本地是否已有token
onMounted(() => {
    const savedToken = localStorage.getItem('accessToken')
    if (savedToken && !appState.accessToken) {
        appState.accessToken = savedToken
        getUserInfo()
    }
})

const saveToken = () => {
    if (!appState.accessToken.trim()) {
        ElNotification({
            title: '提示',
            message: '请输入访问令牌',
            type: 'warning',
        })
        return
    }

    localStorage.setItem('accessToken', appState.accessToken)
    loading.value = true
    getUserInfo()
}

const logout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        localStorage.removeItem('accessToken')
        appState.accessToken = ''
        appState.loggedIn = false
        appState.userInfo = null
        avatarSrc.value = ''
        nickname.value = ''
        sign.value = ''
        ElNotification({
            title: '已退出',
            message: '你已成功退出登录',
            type: 'success',
        })
    })
}

const tokenInvalid = () => {
    ElNotification({
        title: '令牌无效',
        message: '请检查你的访问令牌是否正确。',
        type: 'error',
    })
}

const networkError = () => {
    ElNotification({
        title: '网络错误',
        message: '网络请求失败，请检查网络连接后重试。',
        type: 'error',
    })
}

const getUserInfo = async () => {
    try {
        const response = await api.get('/v0/me', { useToken: true })
        const data = response.data

        appState.loggedIn = true
        appState.userInfo = data
        avatarSrc.value = data.avatar.large
        nickname.value = data.nickname
        sign.value = data.sign

        ElNotification({
            title: '登录成功',
            message: `欢迎回来，${data.nickname}!`,
            type: 'success',
        })
    } catch (error) {
        console.error('获取用户信息失败:', error)

        // 判断是否为网络错误
        if (error.code === 'ERR_NETWORK' ||
            error.message?.includes('Network Error') ||
            error.message?.includes('timeout') ||
            !error.response) {
            // 网络错误：不删除token，仅提示网络问题
            networkError()
            // 保持当前状态，不清除token，允许用户稍后重试
            appState.loggedIn = false
        }
        // 判断是否为401错误（token无效）
        else if (error.response?.status === 401) {
            // 令牌无效：清除token并提示
            appState.loggedIn = false
            localStorage.removeItem('accessToken')
            tokenInvalid()
        }
        // 其他服务器错误
        else {
            // 其他错误：清除token并提示
            appState.loggedIn = false
            localStorage.removeItem('accessToken')
            ElNotification({
                title: '请求失败',
                message: `服务器错误: ${error.response?.status || '未知错误'}`,
                type: 'error',
            })
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.user-info {
    text-align: center;
    padding: 20px 0;
}

.avatar-container {
    margin-bottom: 20px;
}

.nickname {
    margin: 10px 0;
    color: #409EFF;
}

.sign-text {
    color: #666;
    line-height: 1.6;
    margin: 10px 0;
    display: block;
    min-height: 60px;
}

.logout-btn {
    margin-top: 20px;
}

.login-container {
    padding: 10px 0;
}

.login-title {
    text-align: center;
    margin-bottom: 10px;
    color: #333;
}

:deep(.el-dialog__body) {
    padding: 20px 25px;
}

:deep(.el-divider--horizontal) {
    margin: 16px 0;
}
</style>
