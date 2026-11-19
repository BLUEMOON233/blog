<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
const { params } = useData()
const list = computed(() => posts.filter((p) => p.category === params.value.category))
</script>

# 分类：{{ $params.category }}

共 {{ list.length }} 篇。

<ul>
<li v-for="p in list" :key="p.url"><a :href="withBase(p.url)">{{ p.title }}</a> · {{ p.date.iso }}</li>
</ul>

[全部分类](/pages/categories/)
