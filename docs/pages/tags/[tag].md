<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
const { params } = useData()
// 标签不区分大小写：路由参数是小写，显示文章里的原始写法
const list = computed(() => posts.filter((p) => (p.tags || []).some((t) => t.toLowerCase() === params.value.tag)))
const display = computed(() => list.value[0]?.tags.find((t) => t.toLowerCase() === params.value.tag) || params.value.tag)
</script>

# 标签：#{{ display }}

共 {{ list.length }} 篇。

<ul>
<li v-for="p in list" :key="p.url"><a :href="withBase(p.url)">{{ p.title }}</a> · {{ p.date.iso }}</li>
</ul>

[全部标签](/pages/tags/)
