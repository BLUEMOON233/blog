---
# 列表页：「最后更新」是本页源文件的 git 时间，与文章无关，不显示
lastUpdated: false
---

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
import PostList from '../../.vitepress/theme/components/PostList.vue'
const { params } = useData()
// 标签不区分大小写：路由参数是小写，显示文章里的原始写法
const list = computed(() => posts.filter((p) => (p.tags || []).some((t) => t.toLowerCase() === params.value.tag)))
const display = computed(() => list.value[0]?.tags.find((t) => t.toLowerCase() === params.value.tag) || params.value.tag)
</script>

# {{ display }}

标签，共 {{ list.length }} 篇。

<PostList :posts="list" />

[全部标签](/pages/tags/)
