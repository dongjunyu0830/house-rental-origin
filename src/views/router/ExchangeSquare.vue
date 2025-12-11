<script>
import HouseDetail from '@/components/HouseDetail/index.vue'
import { mapState } from 'vuex' // 复用房源详情组件作为占位

export default {
  name: 'ExchangeSquare',
  components: { HouseDetail },
  data () {
    return {
      activeTab: 'houseList', // 默认激活tab
      houseList: [], // 占位房源列表数据，后期从API或Vuex获取
      selectedHouse: null, // 选中的房源，用于评论区dialog
      showPostDialog: false, // 发帖弹窗可见性
      userInfo: {} // 占位用户数据
    }
  },
  computed: {
    ...mapState(['houseDetail'])
  },
  mounted () {
    this.userInfo = {
      name: '用户名',
      posts: [], // 占位发帖列表
      comments: [], // 占位评论列表
      likes: [], // 占位点赞
      favorites: [] // 占位收藏房源
    }
  },
  methods: {
    openCommentDialog (house) {
      this.selectedHouse = house
      // 后期添加加载评论逻辑
    },
    submitComment () {
      // 占位提交评论逻辑
      this.$notify.success({
        title: '提示',
        message: '评论提交成功',
        duration: 2000,
        position: 'top-right',
        offset: 80
      })
    },
    submitPost () {
      // 占位提交帖子逻辑
      this.$notify.success({
        title: '提示',
        message: '帖子发布成功',
        duration: 2000,
        position: 'top-right',
        offset: 80
      })
      this.showPostDialog = false
    }
  }
}
</script>

<template>
  <div class="community-vitality">
    <el-tabs v-model="activeTab" type="card" class="main-tabs">
      <el-tab-pane label="房源广场" name="houseList">
        <div class="house-list">
          <el-input placeholder="搜索房源..." class="search-input"/>
          <div v-if="this.houseDetail.length > 0" class="main-content">
            <HouseDetail
              v-for="(item, index) in this.houseDetail"
              :key="index"
              :feature="item"
            />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="交流帖子" name="posts">
        <div class="posts-section">
          <el-button type="primary" @click="showPostDialog = true">发布帖子</el-button>
          <div class="posts-list">
            <el-card v-for="i in 5" :key="i" class="post-card">
              <div class="post-title">示例帖子标题 {{ i }}</div>
              <div class="post-content">帖子内容占位... 用户讨论租房经验、求租等。</div>
              <div class="post-actions">
                <el-button size="mini">点赞</el-button>
                <el-button size="mini">回复</el-button>
              </div>
            </el-card>
          </div>
        </div>

        <el-dialog v-model="showPostDialog" title="发布帖子">
          <el-form>
            <el-input placeholder="帖子标题"/>
            <el-input type="textarea" placeholder="帖子内容（支持房源链接、图片等）" rows="5"/>
            <el-tag>标签占位</el-tag>
          </el-form>
          <el-button type="primary" @click="submitPost">提交</el-button>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="我的账号" name="account">
        <div class="account-section">
          <el-card class="user-info-card">
            <h3>基本信息</h3>
            <p>用户名: {{ userInfo.name }}</p>
            <p>注册时间: 占位日期</p>
            <el-button size="small">编辑资料</el-button>
          </el-card>

          <el-card class="user-activity">
            <h3>我的发帖</h3>
            <ul>
              <li v-for="i in 3" :key="i">发帖占位 {{ i }}</li>
            </ul>
          </el-card>

          <el-card class="user-activity">
            <h3>我的评论</h3>
            <ul>
              <li v-for="i in 3" :key="i">评论占位 {{ i }}</li>
            </ul>
          </el-card>

          <el-card class="user-activity">
            <h3>点赞记录</h3>
            <ul>
              <li v-for="i in 3" :key="i">点赞占位 {{ i }}</li>
            </ul>
          </el-card>

          <el-card class="user-activity">
            <h3>收藏房源</h3>
            <ul>
              <li v-for="i in 3" :key="i">收藏房源占位 {{ i }}</li>
            </ul>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="selectedHouse" :title="selectedHouse ? selectedHouse.title + ' 评论区' : ''" width="60%">
      <div class="comment-section">
        <el-card class="publisher-self">
          <h4>发布者自述</h4>
          <p>自述内容占位：房源优点、注意事项等。</p>
        </el-card>

        <el-card class="user-comments">
          <h4>租客评论</h4>
          <div v-for="i in 4" :key="i" class="comment-item">
            <p>评论内容占位 {{ i }}</p>
            <el-rate disabled :value="3.5"/>
            <el-button size="mini">回复</el-button>
          </div>
          <el-input type="textarea" placeholder="发布你的评论..." rows="3"/>
          <el-button type="primary" @click="submitComment">提交评论</el-button>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.community-vitality {
  width: 100%;
  min-height: 100vh;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

.house-list,
.posts-section,
.account-section {
  padding: 10px;
}

.search-input {
  margin-bottom: 15px;
}

.main-content {
  width: 100%;
  background-color: #fff;
  overflow-y: auto;
  border-radius: 0 0 10px 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    transition: background 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}

.post-card,
.user-info-card,
.user-activity {
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(255, 208, 75, 0.4);
  }

  h3, h4 {
    color: #2c3e50;
    font-size: 16px;
    margin-bottom: 10px;
  }
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.comment-section {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .comment-item {
    border-bottom: 1px solid #f0f0f0;
    padding: 10px 0;
  }
}

.el-button[type="primary"] {
  background: #ffd04b;
  border-color: #ffd04b;
  color: #2c3e50;

  &:hover {
    background: #ffbc40;
    border-color: #ffbc40;
  }
}

h3, h4 {
  color: #2c3e50;
}

@media (max-width: 768px) {
  .community-vitality {
    padding: 10px;
  }

  .house-list,
  .posts-section,
  .account-section {
    padding: 5px;
  }
}
</style>
