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
const list = computed(() => posts.filter((p) => p.category === params.value.category))
</script>

# {{ $params.category }}

分类，共 {{ list.length }} 篇。

<PostList :posts="list" :show-category="false" />

[全部分类](/pages/categories/)
