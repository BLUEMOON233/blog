<script setup lang="ts">
import { ref } from 'vue'
import { useWebDAV, type WebDAVConfig as IWebDAVConfig } from '../composables/useWebDAV'

const emit = defineEmits<{
  'configured': [config: IWebDAVConfig]
}>()

const { testConnection, saveConfig } = useWebDAV()

const form = ref<IWebDAVConfig>({
  url: '',
  username: '',
  password: '',
  filePath: '/todos.json'
})

const testing = ref(false)
const testResult = ref<'success' | 'failed' | null>(null)
const saving = ref(false)

const handleTest = async () => {
  testing.value = true
  testResult.value = null

  const success = await testConnection(form.value)

  testResult.value = success ? 'success' : 'failed'
  testing.value = false
}

const handleSave = async () => {
  if (!form.value.url || !form.value.username || !form.value.password) {
    alert('请填写完整信息')
    return
  }

  // 先测试连接
  saving.value = true
  const success = await testConnection(form.value)

  if (!success) {
    alert('连接失败，请检查配置')
    saving.value = false
    return
  }

  // 保存配置
  saveConfig(form.value)
  saving.value = false

  emit('configured', form.value)
}
</script>

<template>
  <div class="webdav-config">
    <div class="config-header">
      <h3>⚙️ 配置 WebDAV 存储</h3>
      <p class="config-desc">
        连接到你的云盘，实现多设备数据同步
      </p>
    </div>

    <form class="config-form" @submit.prevent="handleSave">
      <div class="form-group">
        <label for="url">
          <span class="label-icon">🌐</span>
          WebDAV 服务器地址
        </label>
        <input
          id="url"
          v-model="form.url"
          type="url"
          placeholder="https://dav.example.com"
          required
          class="form-input"
        />
        <span class="form-hint">例如: https://dav.jianguoyun.com/dav/</span>
      </div>

      <div class="form-group">
        <label for="username">
          <span class="label-icon">👤</span>
          用户名
        </label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          placeholder="your-username"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="password">
          <span class="label-icon">🔑</span>
          密码/应用密码
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="your-password"
          required
          class="form-input"
        />
        <span class="form-hint">建议使用应用专用密码，而不是账户主密码</span>
      </div>

      <div class="form-group">
        <label for="filePath">
          <span class="label-icon">📁</span>
          文件路径
        </label>
        <input
          id="filePath"
          v-model="form.filePath"
          type="text"
          placeholder="/todos.json"
          required
          class="form-input"
        />
        <span class="form-hint">数据将保存在此文件中</span>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="test-btn"
          :disabled="testing"
          @click="handleTest"
        >
          <span v-if="testing">测试中...</span>
          <span v-else>🔍 测试连接</span>
        </button>

        <button
          type="submit"
          class="save-btn"
          :disabled="saving || testing"
        >
          <span v-if="saving">保存中...</span>
          <span v-else>💾 保存配置</span>
        </button>
      </div>

      <div v-if="testResult" class="test-result">
        <div v-if="testResult === 'success'" class="result-success">
          ✅ 连接成功！
        </div>
        <div v-else class="result-failed">
          ❌ 连接失败，请检查配置是否正确
        </div>
      </div>
    </form>

    <div class="config-tips">
      <h4>💡 提示</h4>
      <ul>
        <li>支持大多数 WebDAV 服务（坚果云、Nextcloud、Synology NAS 等）</li>
        <li>配置信息加密存储在浏览器本地</li>
        <li>首次配置后会自动同步数据</li>
        <li>如需更换服务器，请先导出数据备份</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.webdav-config {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
}

.config-header {
  text-align: center;
  margin-bottom: 2rem;
}

.config-header h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.config-desc {
  color: var(--vp-c-text-2);
  margin: 0;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
}

.label-icon {
  font-size: 1rem;
}

.form-input {
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-rgb, 59, 130, 246), 0.1);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.test-btn,
.save-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.test-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.test-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.save-btn {
  background: var(--vp-c-brand-1);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.test-btn:disabled,
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-result {
  margin-top: 0.5rem;
}

.result-success,
.result-failed {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.result-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.result-failed {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.config-tips {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 0.5rem;
}

.config-tips h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.config-tips ul {
  margin: 0;
  padding-left: 1.5rem;
}

.config-tips li {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.config-tips li:last-child {
  margin-bottom: 0;
}
</style>
