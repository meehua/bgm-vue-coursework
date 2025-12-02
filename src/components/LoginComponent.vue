<template>
    <el-dialog v-model="appState.loginBoxIsShow">
        <div v-loading="loading">
            <div v-if="appState.loggedIn">
                <el-avatar :fit="cover" :src="avatarSrc" />
                <el-text size="large">{{ nickname }}</el-text>
                <el-text size="large">{{ sign }}</el-text>
            </div>
            <div v-else>
                <h3>输入你的访问令牌</h3>
                <br>
                <el-form style="max-width:300px;margin:auto">
                    <el-form-item label="Access Token">
                        <el-input v-model="appState.accessToken" placeholder="输入或粘贴访问令牌" />
                        <div style="margin-top:6px">
                            <br>
                            <el-button size="" type="primary" @click="saveToken">保存令牌</el-button>
                            <el-link style="margin-left:8px" href="https://next.bgm.tv/demo/access-token"
                                target="_blank">获取令牌</el-link>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, inject } from 'vue'
import { ElNotification } from 'element-plus'
import api from '../api/client.js'
const appState = inject('appState')
const saveToken = () => {
    localStorage.setItem('accessToken', appState.accessToken)
    loading.value = true
    getUserInfo()
}
const loading = ref(false)
const avatarSrc = ref('')
const nickname = ref('')
const sign = ref('')

const tokenInvalid = () => {
    ElNotification({
        title: '令牌无效',
        message: '请检查你的访问令牌是否正确。',
        type: 'error',
    })
}

const getUserInfo = async () => {
    try {
        const response = await api.get('/v0/me', { useToken: true })

        // 响应处理
        const data = response.data
        console.log('用户信息:', data)
        appState.loggedIn = true
        loading.value = false
        avatarSrc.value = data.avatar.large
        nickname.value = data.nickname
        sign.value = data.sign
    } catch (error) {
        console.error('获取用户信息失败:', error)
        appState.loggedIn = false
        loading.value = false
        tokenInvalid()
    }
}
</script>
