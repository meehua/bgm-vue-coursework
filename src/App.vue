<template>
    <el-config-provider>
        <el-container>
            <el-header>
                <HeaderComponent />
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-config-provider>
</template>

<script setup>
import { provide, reactive } from 'vue'
import { ElConfigProvider } from 'element-plus'
import HeaderComponent from './components/HeaderComponent.vue'


const appState=reactive({
    loginBoxIsShow:false,
})

provide('appState',appState)
</script>
