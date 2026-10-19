---
layout: page
---

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as posts } from '../../.vitepress/data/posts.data'
import PageHeader from '../../.vitepress/theme/components/PageHeader.vue'
import PostList from '../../.vitepress/theme/components/PostList.vue'
const { params } = useData()
const tag = computed(() => params.value.tag)
// 标签匹配忽略大小写，显示时用原始写法
const list = computed(() => posts.filter(p => (p.tags || []).some(t => t.toLowerCase() === tag.value)))
const display = computed(() => list.value[0]?.tags.find(t => t.toLowerCase() === tag.value) || tag.value)
</script>

<div class="list-page">
  <PageHeader :title="`#${display}`" :note="`共 ${list.length} 篇`"><template #kicker><span lang="en">Tag</span> · 标签</template></PageHeader>
  <PostList :posts="list" :heading-level="2" />
  <a class="list-back kicker" href="/pages/tags/">返回全部标签</a>
</div>
