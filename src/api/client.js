import axios from 'axios'

/**
 * 创建 BGM.tv API 客户端
 * @param {Object} options - 配置选项
 * @param {string} [options.baseURL='https://api.bgm.tv'] - API 基础 URL
 * @param {number} [options.timeout=15000] - 请求超时时间
 * @returns {Object} axios 实例
 */
const createApiClient = (options = {}) => {
    const {
        baseURL = 'https://api.bgm.tv',
        timeout = 5000,
    } = options

    const instance = axios.create({
        baseURL,
        timeout,
    })

    /**
     * 请求拦截器 - 根据调用方配置添加认证头
     */
    instance.interceptors.request.use((config) => {
        const { useToken = false } = config

        if (useToken) {
            const token = localStorage.getItem('bgm_token')
            if (token) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`
                }
            }
        }

        return config
    })

    /**
     * 响应拦截器 - 处理认证失败重试
     */
    instance.interceptors.response.use(
        (response) => {
            // 成功响应直接返回
            return response
        },
        async (error) => {
            const { config, response } = error

            // 如果配置了使用 token 且响应状态为 401（未授权）
            if (config?.useToken && response?.status === 401 && !config._retried) {
                config._retried = true

                // 创建重试配置（不使用 token）
                const retryConfig = {
                    ...config,
                    useToken: false,
                    headers: {
                        ...config.headers,
                        Authorization: undefined
                    }
                }

                delete retryConfig._retried

                // 使用无 token 的方式重试
                try {
                    return await instance.request(retryConfig)
                } catch (retryError) {
                    return Promise.reject(retryError)
                }
            }

            // 其他错误直接抛出
            return Promise.reject(error)
        }
    )

    return instance
}

// 创建默认客户端（不带自动 token 功能）
const defaultClient = createApiClient()

export { createApiClient }
export default defaultClient