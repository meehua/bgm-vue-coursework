<template>
    <el-dialog v-model="appState.loginBoxIsShow">
        <el-form label-width="120px" style="max-width:980px">
            <!-- <el-form-item label="Access Token">
                <el-input v-model="form.token" placeholder="输入或粘贴访问令牌" />
                <div style="margin-top:6px">
                    <el-button size="small" type="primary" @click="saveToken">保存令牌</el-button>
                    <el-link style="margin-left:8px" href="https://next.bgm.tv/demo/access-token"
                        target="_blank">获取令牌</el-link>
                </div>
            </el-form-item> -->
        </el-form> <!-- <template>
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogVisible = false">
                    Confirm
                </el-button>
</template> -->
    </el-dialog>
</template>

<script setup>
import { ref,inject } from 'vue'
const appState = inject('appState')


</script>
