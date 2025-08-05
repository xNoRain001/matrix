import { useLogout } from '@/hooks'
import axios from 'axios'
import qs from 'querystring'

class HTTP {
  defaults: {
    baseURL: string
    timeout: number
    headers: Record<string, string>
    transformRequest: (data: any, headers: any) => any
  }

  constructor() {
    this.defaults = {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest(data, headers) {
        return headers['Content-Type'] === 'application/x-www-form-urlencoded'
          ? qs.stringify(data)
          : data
      }
    }
  }

  request(url, options: any = {}) {
    const { defaults } = this
    const instance = axios.create()
    const config = {
      ...defaults,
      url,
      ...options,
      headers: {
        ...defaults.headers,
        ...(options.headers || {})
      }
    }
    this.setInterceptor(instance)
    return instance(config)
  }

  setInterceptor(instance) {
    instance.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token')

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    instance.interceptors.response.use(
      response => {
        return response.data
      },
      async error => {
        const { response } = error

        if (response) {
          const { code, message } = response.data

          if (code === 401) {
            useLogout()
            location.href = '/login'
          }

          throw Error(message)
        } else {
          // 服务器连结果都没返回，要么是用户断网，要么是服务器故障
          if (navigator.onLine) {
            // 用户在线，说明是服务器奔溃
            throw Error('服务器故障')
          } else {
            // 用户断网
            throw Error('网络错误')
          }
        }
      }
    )
  }
}

export default new HTTP()
