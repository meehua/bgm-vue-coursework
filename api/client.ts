// src/api/client.js
import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'https://api.bgm.tv', // API 根地址
  timeout: 15000                  // 超时时间 15 秒
})

// ------------------ 请求拦截器 ------------------
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('bgm_token')
  const url = String(config.url || '')
  const needsAuth = url.startsWith('/v0/') || url.startsWith('/collection')
  
  // 如果有 token 且请求需要授权，则在 headers 加上 Authorization
  if (token && needsAuth) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`
    }
  }
  return config
})

// ------------------ 响应拦截器 ------------------
instance.interceptors.response.use(
  (response) => response, // 成功直接返回
  async (error) => {
    const status = error?.response?.status
    const config = error?.config || {}
    const usedToken = !!localStorage.getItem('bgm_token')

    // 如果 401 或无响应，并且使用了 token，且尚未重试
    if ((status === 401 || !error.response) && usedToken && !config.__retryNoAuth) {
      config.__retryNoAuth = true
      if (config.headers) delete config.headers.Authorization
      try {
        return await instance.request(config) // 重新发请求（不带 token）
      } catch (e) {
        throw e
      }
    }

    throw error
  }
)

export default instance
