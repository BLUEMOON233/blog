// docs/.vitepress/theme/composables/useWebDAV.ts

import { ref } from 'vue'
import { createClient, WebDAVClient } from 'webdav'

export interface WebDAVConfig {
  url: string
  username: string
  password: string
  filePath: string
}

export interface SyncStatus {
  syncing: boolean
  lastSync: number | null
  error: string | null
}

const WEBDAV_CONFIG_KEY = 'vitepress-webdav-config'
const LOCAL_CACHE_KEY = 'vitepress-todos-cache'

export function useWebDAV() {
  const syncStatus = ref<SyncStatus>({
    syncing: false,
    lastSync: null,
    error: null
  })

  let client: WebDAVClient | null = null

  // 加载配置
  const loadConfig = (): WebDAVConfig | null => {
    try {
      const stored = localStorage.getItem(WEBDAV_CONFIG_KEY)
      if (stored) {
        // 简单的解密（实际应用中应使用更安全的方式）
        return JSON.parse(atob(stored))
      }
    } catch (error) {
      console.error('Failed to load WebDAV config:', error)
    }
    return null
  }

  // 保存配置
  const saveConfig = (config: WebDAVConfig) => {
    try {
      // 简单的加密（实际应用中应使用更安全的方式）
      const encrypted = btoa(JSON.stringify(config))
      localStorage.setItem(WEBDAV_CONFIG_KEY, encrypted)
    } catch (error) {
      console.error('Failed to save WebDAV config:', error)
      throw error
    }
  }

  // 删除配置
  const clearConfig = () => {
    localStorage.removeItem(WEBDAV_CONFIG_KEY)
    client = null
  }

  // 初始化客户端
  const initClient = (config: WebDAVConfig) => {
    client = createClient(config.url, {
      username: config.username,
      password: config.password
    })
  }

  // 测试连接
  const testConnection = async (config: WebDAVConfig): Promise<boolean> => {
    try {
      const testClient = createClient(config.url, {
        username: config.username,
        password: config.password
      })

      // 尝试列出目录
      await testClient.getDirectoryContents('/')
      return true
    } catch (error) {
      console.error('WebDAV connection test failed:', error)
      return false
    }
  }

  // 从 WebDAV 读取数据
  const readFromWebDAV = async <T>(config: WebDAVConfig): Promise<T | null> => {
    if (!client) {
      initClient(config)
    }

    syncStatus.value.syncing = true
    syncStatus.value.error = null

    try {
      const contents = await client!.getFileContents(config.filePath, {
        format: 'text'
      })

      syncStatus.value.lastSync = Date.now()
      syncStatus.value.syncing = false

      const data = JSON.parse(contents as string)

      // 同时缓存到本地
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data))

      return data
    } catch (error: any) {
      console.error('Failed to read from WebDAV:', error)

      // 如果是 404 错误，说明文件不存在，返回 null
      if (error.response?.status === 404) {
        syncStatus.value.syncing = false
        return null
      }

      // 其他错误，尝试使用本地缓存
      syncStatus.value.error = '读取失败，使用本地缓存'
      syncStatus.value.syncing = false

      try {
        const cached = localStorage.getItem(LOCAL_CACHE_KEY)
        return cached ? JSON.parse(cached) : null
      } catch {
        return null
      }
    }
  }

  // 写入到 WebDAV
  const writeToWebDAV = async <T>(config: WebDAVConfig, data: T): Promise<boolean> => {
    if (!client) {
      initClient(config)
    }

    syncStatus.value.syncing = true
    syncStatus.value.error = null

    try {
      const content = JSON.stringify(data, null, 2)

      await client!.putFileContents(config.filePath, content, {
        overwrite: true
      })

      syncStatus.value.lastSync = Date.now()
      syncStatus.value.syncing = false

      // 同时缓存到本地
      localStorage.setItem(LOCAL_CACHE_KEY, content)

      return true
    } catch (error) {
      console.error('Failed to write to WebDAV:', error)
      syncStatus.value.error = '同步失败'
      syncStatus.value.syncing = false

      // 写入失败时仍然保存到本地缓存
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data))

      return false
    }
  }

  // 从本地缓存加载
  const loadFromCache = <T>(): T | null => {
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to load from cache:', error)
      return null
    }
  }

  return {
    syncStatus,
    loadConfig,
    saveConfig,
    clearConfig,
    testConnection,
    readFromWebDAV,
    writeToWebDAV,
    loadFromCache
  }
}
