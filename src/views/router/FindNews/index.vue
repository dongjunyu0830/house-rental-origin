<script>
import NewsCard from '@/components/NewsCard/index.vue'

export default {
  name: 'FindNews',
  components: { NewsCard },
  data () {
    return {
      searchQuery: ''
    }
  },
  computed: {
    posts () {
      return this.$store.state.houseDetail.map((house, index) => ({
        id: house.id || Date.now() + index,
        image: house.pic_link || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: house.title || '优质房源',
        description: house.description || '暂无详细描述',
        room: house.room || '',
        building: house.building || '',
        address: house.address || '',
        price: house.price || '面议',
        contact: house.contact || '未知',
        tag: house.tag || '',
        author: house.publisher || '匿名用户',
        likes: Math.floor(Math.random() * 400) + 50,
        comments: Math.floor(Math.random() * 80) + 10
      }))
    }
  },
  methods: {
    handleSearch () {
      console.log('搜索：', this.searchQuery)
    }
  },
  mounted () {
    if (this.$store.state.houseDetail.length === 0) {
      this.$store.dispatch('loadHouseData')
    }
  }
}
</script>

<template>
  <div class="find-news">
    <div class="search-wrapper">
      <el-input
        v-model="searchQuery"
        placeholder="搜索房源、帖子或用户..."
        clearable
        size="large"
        class="modern-search"
        @keyup.enter.native="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <div class="posts-grid">
      <news-card v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <el-empty v-if="posts.length === 0" description="暂无房源帖子～" />
  </div>
</template>

<style scoped lang="less">
.find-news {
  background: #f8f9fa;
  min-height: 100%;
}

.search-wrapper {
  display: flex;
  width: 80%;
  margin: 0 auto 20px auto;

  .modern-search {
    height: 60px;
    border-radius: 60px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);

    /deep/ .el-input__inner {
      height: 60px;
      line-height: 60px;
      border: none;
      font-size: 17px;
      padding-left: 60px;
    }

    .search-icon {
      font-size: 20px;
      color: #999;
      left: 22px;
      top: 50%;
      transform: translateY(-50%);
    }

    /deep/ .el-input-group__append {
      background: linear-gradient(135deg, #ffd04b, #ffb347);
      border: none;
      border-radius: 0 30px 30px 0;
    }
  }

  /deep/ .el-button {
    border-radius: 0 30px 30px 0;
  }
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}
</style>
