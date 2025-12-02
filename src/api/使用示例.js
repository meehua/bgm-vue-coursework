// bangumi 接口文档在这里：https://bangumi.github.io/api/
// 按照文档说明的请求方式，使用封装好的客户端去请求数据。

// 这个客户端在 ./clienti.js 里。
// 你只需要引入它，然后调用它提供的方法即可。
// 函数返回的是一个 axios 实例。
// 拿到这个东西后要如何用，可以直接去看 axios 的官方文档。
// 本文里也介绍了两个：获取 http-code 、获取响应内容。
// 按理说，知道这俩就足够完成本作业了。



import api from './clienti.js'

// 获取番剧详情（不需要 token）
async function getSubjectDetail() {
    try {
        const response = await api.get('/v0/subjects/123')

        // 获取 HTTP 状态码
        const statusCode = response.status  // 例如: 200

        // 获取响应头
        const headers = response.headers

        // 获取响应数据
        const data = response.data

        console.log(`状态码: ${statusCode}`)
        console.log('数据:', data)

        return data
    } catch (error) {
        console.error('请求失败:', error.message)

        // 获取错误响应的状态码和数据
        if (error.response) {
            console.error('错误状态码:', error.response.status)
            console.error('错误响应:', error.response.data)
        }

        throw error
    }
}

// 获取用户信息（需要 token）
async function getUserInfo() {
    try {
        const response = await api.get('/v0/me', { useToken: true })

        // 响应处理
        const data = response.data
        console.log('用户信息:', data)
        return data
    } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
    }
}