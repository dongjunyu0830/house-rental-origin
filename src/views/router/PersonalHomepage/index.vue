<!-- src/views/router/exchangeSquare/PersonalHomepage.vue -->
<script>
/* eslint-disable */
export default {
  name: 'PersonalHomepage',
  data() {
    return {
      user: {
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        name: '重庆租房达人',
        bio: '专注渝中区优质房源分享 | 已帮助50+人找到心仪住所',
        posts: 42,
        followers: 1280,
        following: 89
      },
      tabs: ['帖子', '收藏', '点赞'],
      activeTab: '帖子',
      userPosts: [
        { id: 1, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', title: '解放碑江景房转租', likes: 312, comments: 68 },
        { id: 2, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', title: '洪崖洞旁精装公寓', likes: 256, comments: 45 },
        { id: 3, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', title: '学校旁温馨三居', likes: 189, comments: 32 },
        { id: 4, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', title: 'loft创意空间转租', likes: 320, comments: 72 }
      ]
    }
  }
}
</script>

<template>
  <div class="personal-homepage">
    <div class="profile-header">
      <div class="container">
        <img :src="user.avatar" alt="头像" class="avatar" />
        <div class="info">
          <h1 class="name">{{ user.name }}</h1>
          <p class="bio">{{ user.bio }}</p>
          <div class="stats">
            <div class="stat"><strong>{{ user.posts }}</strong> 帖子</div>
            <div class="stat"><strong>{{ user.followers }}</strong> 粉丝</div>
            <div class="stat"><strong>{{ user.following }}</strong> 关注</div>
          </div>
          <el-button round class="edit-btn">编辑资料</el-button>
        </div>
      </div>
    </div>

    <div class="tabs-bar">
      <div class="container tabs">
        <div
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </div>
      </div>
    </div>

    <div class="content">
      <div class="container">
        <div v-if="activeTab === '帖子'" class="grid">
          <div v-for="post in userPosts" :key="post.id" class="post">
            <img :src="post.image" :alt="post.title" />
            <div class="overlay">
              <div class="interactions">
                <span><i class="el-icon-thumb"></i> {{ post.likes }}</span>
                <span><i class="el-icon-chat-dot-round"></i> {{ post.comments }}</span>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else description="这里空空如也～" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.personal-homepage {
  background: #f9fafb;
  min-height: 100%;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0 40px;
  color: white;

  .container {
    display: flex;
    align-items: center;
    gap: 40px;
  }

  .avatar {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 6px solid rgba(255,255,255,0.3);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    object-fit: cover;
  }

  .info {
    .name {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 12px;
    }

    .bio {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 24px;
    }

    .stats {
      display: flex;
      gap: 48px;
      margin-bottom: 24px;

      .stat {
        strong { font-size: 26px; display: block; font-weight: 700; }
        font-size: 15px;
        opacity: 0.8;
      }
    }

    .edit-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.5);
      color: white;
      padding: 10px 32px;
      border-radius: 30px;
    }
  }
}

.tabs-bar {
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;

  .tabs {
    display: flex;

    .tab {
      flex: 1;
      padding: 18px 0;
      text-align: center;
      font-size: 17px;
      font-weight: 600;
      color: #999;
      cursor: pointer;

      &.active {
        color: #333;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background: #ffd04b;
          border-radius: 2px;
        }
      }
    }
  }
}

.content {
  padding: 40px 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
}

.post {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  aspect-ratio: 1;
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 36px rgba(0,0,0,0.14);

    .overlay {
      opacity: 1;
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    display: flex;
    align-items: flex-end;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.3s;

    .interactions {
      display: flex;
      gap: 24px;
      color: white;
      font-weight: 600;
      font-size: 16px;

      span {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }
}
</style>
