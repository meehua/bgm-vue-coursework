<template>
    <el-row class="solid-border-bottom" justify="space-between" align="middle">
        <el-col :span="8">
            <router-link to="/" class="logo">
                <img src="../assets/logo_riff.png" alt="Logo" style="width: 120px;" />
            </router-link>
        </el-col>
        <el-col :span="12">
            <el-menu mode="horizontal" :default-active="$route.path" router>
                <el-menu-item index="/calendar">每日放送</el-menu-item>
                <el-menu-item index="/search">搜索</el-menu-item>
                <el-menu-item index="/collection">收藏夹</el-menu-item>
            </el-menu>
        </el-col>
        <el-col :span="4">
            <el-button type="info" @click="appState.loginBoxIsShow = !appState.loginBoxIsShow ">未登入</el-button>
        </el-col>
    </el-row>
    <LoginComponent/>
</template>
<script setup>
import LoginComponent from './LoginComponent.vue'
import { inject, ref } from 'vue'

const appState = inject('appState')

</script>
<style scoped>
.el-menu--horizontal.el-menu {
    border-bottom: none;
}

.solid-border-bottom {
    border-bottom: 1px solid #333 !important;
}
</style>