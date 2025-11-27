<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWebDAV, type WebDAVConfig as IWebDAVConfig } from '../composables/useWebDAV'
import WebDAVConfig from './WebDAVConfig.vue'

// 类型定义
interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

type FilterType = 'all' | 'active' | 'completed'

// WebDAV 钩子
const { syncStatus, loadConfig, clearConfig, readFromWebDAV, writeToWebDAV, loadFromCache } = useWebDAV()

// 状态
const todos = ref<TodoItem[]>([])
const newTodoText = ref('')
const filter = ref<FilterType>('all')
const webdavConfig = ref<IWebDAVConfig | null>(null)
const showConfig = ref(false)

// 生成唯一 ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 计算属性：过滤后的任务
const filteredTodos = computed(() => {
  if (filter.value === 'active') {
    return todos.value.filter(t => !t.completed)
  }
  if (filter.value === 'completed') {
    return todos.value.filter(t => t.completed)
  }
  return todos.value
})

// 计算属性：统计数据
const stats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(t => t.completed).length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, active: total - completed, completionRate }
})

// 加载数据
const loadTodos = async () => {
  if (!webdavConfig.value) return

  // 先从缓存加载
  const cached = loadFromCache<TodoItem[]>()
  if (cached) {
    todos.value = cached
  }

  // 然后从 WebDAV 同步
  const data = await readFromWebDAV<TodoItem[]>(webdavConfig.value)
  if (data) {
    todos.value = data
  } else if (!cached) {
    // 如果既没有云端数据也没有缓存，初始化为空数组
    todos.value = []
  }
}

// 保存数据
const saveTodos = async () => {
  if (!webdavConfig.value) return
  await writeToWebDAV(webdavConfig.value, todos.value)
}

// 监听 todos 变化自动保存
watch(todos, () => {
  if (webdavConfig.value) {
    saveTodos()
  }
}, { deep: true })

// 添加任务
const addTodo = () => {
  const text = newTodoText.value.trim()
  if (!text) return

  const newTodo: TodoItem = {
    id: generateId(),
    text,
    completed: false,
    createdAt: Date.now()
  }

  todos.value.unshift(newTodo)
  newTodoText.value = ''
}

// 切换完成状态
const toggleTodo = (id: string) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

// 删除任务
const deleteTodo = (id: string) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

// 清空已完成
const clearCompleted = () => {
  if (stats.value.completed === 0) return
  if (confirm(`确定要删除 ${stats.value.completed} 个已完成任务吗？`)) {
    todos.value = todos.value.filter(t => !t.completed)
  }
}

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60 * 1000) {
    return '刚刚'
  }
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))} 分钟前`
  }
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化同步时间
const formatSyncTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 配置完成处理
const handleConfigured = async (config: IWebDAVConfig) => {
  webdavConfig.value = config
  showConfig.value = false
  await loadTodos()
}

// 重新配置
const handleReconfigure = () => {
  if (confirm('重新配置将清除当前连接信息，是否继续？')) {
    clearConfig()
    webdavConfig.value = null
    showConfig.value = true
  }
}

// 手动同步
const handleManualSync = async () => {
  if (webdavConfig.value) {
    await loadTodos()
  }
}

// 初始化
onMounted(() => {
  const config = loadConfig()
  if (config) {
    webdavConfig.value = config
    loadTodos()
  } else {
    showConfig.value = true
  }
})
</script>

<template>
  <div class="todo-container">
    <!-- WebDAV 配置界面 -->
    <WebDAVConfig
      v-if="showConfig"
      @configured="handleConfigured"
    />

    <!-- Todo 主界面 -->
    <template v-else>
      <!-- 同步状态栏 -->
      <div class="sync-status">
        <div class="status-info">
          <span v-if="syncStatus.syncing" class="status-badge syncing">
            🔄 同步中...
          </span>
          <span v-else-if="syncStatus.error" class="status-badge error">
            ⚠️ {{ syncStatus.error }}
          </span>
          <span v-else-if="syncStatus.lastSync" class="status-badge success">
            ✅ 已同步 {{ formatSyncTime(syncStatus.lastSync) }}
          </span>
          <span v-else class="status-badge">
            ⏳ 等待同步
          </span>
        </div>

        <div class="status-actions">
          <button
            class="icon-btn"
            :disabled="syncStatus.syncing"
            @click="handleManualSync"
            title="手动同步"
          >
            🔄
          </button>
          <button
            class="icon-btn"
            @click="handleReconfigure"
            title="重新配置"
          >
            ⚙️
          </button>
        </div>
      </div>

      <!-- 统计面板 -->
      <div class="stats-panel">
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总任务</div>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">✅</span>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⏳</span>
          <div class="stat-content">
            <div class="stat-value">{{ stats.active }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📈</span>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>
      </div>

      <!-- 添加任务 -->
      <div class="add-todo">
        <input
          v-model="newTodoText"
          type="text"
          placeholder="添加新任务...（按回车添加）"
          class="todo-input"
          @keyup.enter="addTodo"
        />
        <button class="add-btn" @click="addTodo">
          <span class="btn-icon">➕</span>
          添加
        </button>
      </div>

      <!-- 筛选器 -->
      <div class="filter-bar">
        <div class="filter-buttons">
          <button
            :class="['filter-btn', { active: filter === 'all' }]"
            @click="filter = 'all'"
          >
            📋 全部 ({{ stats.total }})
          </button>
          <button
            :class="['filter-btn', { active: filter === 'active' }]"
            @click="filter = 'active'"
          >
            ⏳ 进行中 ({{ stats.active }})
          </button>
          <button
            :class="['filter-btn', { active: filter === 'completed' }]"
            @click="filter = 'completed'"
          >
            ✅ 已完成 ({{ stats.completed }})
          </button>
        </div>
        <button
          v-if="stats.completed > 0"
          class="clear-btn"
          @click="clearCompleted"
        >
          🗑️ 清空已完成
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="todo-list">
        <div
          v-if="filteredTodos.length === 0"
          class="empty-state"
        >
          <span class="empty-icon">{{ filter === 'completed' ? '🎉' : '📝' }}</span>
          <p class="empty-text">
            {{ filter === 'completed' ? '还没有完成的任务' : '暂无任务，添加一个吧！' }}
          </p>
        </div>

        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="['todo-item', { completed: todo.completed }]"
        >
          <label class="todo-checkbox">
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="toggleTodo(todo.id)"
            />
            <span class="checkmark"></span>
          </label>

          <div class="todo-content">
            <p class="todo-text">{{ todo.text }}</p>
            <span class="todo-time">{{ formatDate(todo.createdAt) }}</span>
          </div>

          <button
            class="delete-btn"
            @click="deleteTodo(todo.id)"
            title="删除任务"
          >
            🗑️
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.todo-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 同步状态栏 */
.sync-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
}

.status-info {
  flex: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
}

.status-badge.syncing {
  color: var(--vp-c-brand-1);
  animation: pulse 2s infinite;
}

.status-badge.success {
  color: #10b981;
}

.status-badge.error {
  color: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.status-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  padding: 0.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  transform: scale(1.1);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 统计面板 */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

/* 添加任务 */
.add-todo {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.todo-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  transition: all 0.2s;
}

.todo-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-rgb, 59, 130, 246), 0.1);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-icon {
  font-size: 1rem;
}

/* 筛选器 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 0.75rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.clear-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 任务列表 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-2);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  margin: 0;
}

/* 任务项 */
.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.todo-item:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--vp-c-text-3);
}

/* 复选框 */
.todo-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.todo-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.checkmark::after {
  content: '✓';
  color: white;
  font-size: 1rem;
  font-weight: bold;
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s;
}

.todo-checkbox input:checked ~ .checkmark {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.todo-checkbox input:checked ~ .checkmark::after {
  opacity: 1;
  transform: scale(1);
}

.todo-checkbox:hover .checkmark {
  border-color: var(--vp-c-brand-1);
}

/* 任务内容 */
.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-text {
  margin: 0 0 0.25rem 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  line-height: 1.5;
  word-break: break-word;
}

.todo-time {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

/* 删除按钮 */
.delete-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.2);
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }

  .add-todo {
    flex-direction: column;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-buttons {
    width: 100%;
  }

  .filter-btn {
    flex: 1;
    text-align: center;
  }

  .clear-btn {
    width: 100%;
  }

  .sync-status {
    flex-direction: column;
    gap: 0.75rem;
  }

  .status-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
