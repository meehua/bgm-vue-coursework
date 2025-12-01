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
import { defineComponent } from 'vue'
import { ElConfigProvider } from 'element-plus'
import HeaderComponent from './components/HeaderComponent.vue'

</script>
