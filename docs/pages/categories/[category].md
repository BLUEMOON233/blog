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
const cat = computed(() => params.value.category)
const list = computed(() => posts.filter(p => p.category === cat.value))
</script>

<div class="list-page">
  <PageHeader :title="cat" :note="`共 ${list.length} 篇`"><template #kicker><span lang="en">Section</span> · 分类</template></PageHeader>
  <PostList :posts="list" :heading-level="2" />
  <a class="list-back kicker" href="/pages/categories/">返回全部分类</a>
</div>
