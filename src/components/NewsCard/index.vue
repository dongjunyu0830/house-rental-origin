<script>
export default {
  name: 'NewsCard',
  props: {
    post: { type: Object, required: true }
  },
  computed: {
    tags () {
      return this.post.tag ? this.post.tag.split(',').map(t => t.trim()).filter(t => t) : []
    }
  }
}
</script>

<template>
  <div class="news-card">
    <div class="image-wrapper">
      <img :src="post.image" :alt="post.title" class="cover-image" loading="lazy" />
      <div class="image-overlay"></div>
    </div>

    <div class="content-wrapper">
      <h3 class="title">{{ post.title }}</h3>
      <p class="description">{{ post.description }}</p>

      <div class="info-grid">
        <div class="info-item">
          <i class="el-icon-office-building"></i>
          <span>{{ post.room }} · {{ post.building }}</span>
        </div>
        <div class="info-item">
          <i class="el-icon-location"></i>
          <span>{{ post.address }}</span>
        </div>
        <div class="info-item price">
          <i class="el-icon-coin"></i>
          <span class="price-value">{{ post.price }} 元/月</span>
        </div>
      </div>

      <div class="tags-wrapper" v-if="tags.length">
        <el-tag v-for="(tag, i) in tags" :key="i" size="mini" effect="plain" class="tag-item">
          {{ tag }}
        </el-tag>
      </div>

      <div class="footer">
        <div class="author">
          <i class="el-icon-user-solid"></i>
          <span>{{ post.contact }}</span>
        </div>
        <div class="interactions">
          <span class="like"><i class="el-icon-thumb"></i> {{ post.likes }}</span>
          <span class="comment"><i class="el-icon-chat-dot-round"></i> {{ post.comments }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.news-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 36px rgba(0,0,0,0.14);
  }
}

.image-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  &:hover .cover-image {
    transform: scale(1.08);
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.3), transparent 60%);
  }
}

.content-wrapper {
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  font-size: 13px;
  color: #888;

  .info-item {
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 15px;
      color: #ffd04b;
    }

    &.price {
      color: #e74c3c;
      font-weight: 600;

      .price-value {
        font-size: 16px;
      }
    }
  }
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .tag-item {
    font-size: 12px;
    padding: 0 10px;
    height: 22px;
    line-height: 22px;
    border-radius: 11px;
    background: #f0f4ff;
    color: #4a6cf7;
  }
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px dashed #eee;
  font-size: 14px;
  color: #999;

  .author {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .interactions {
    display: flex;
    gap: 18px;

    span {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
}
</style>
