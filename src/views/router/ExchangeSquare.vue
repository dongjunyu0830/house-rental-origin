<script>
import { mapState } from 'vuex'

export default {
  name: 'ExchangeSquare',
  data () {
    return {
      activeMenu: 'FindNews'
    }
  },
  computed: {
    ...mapState(['houseDetail'])
  },
  methods: {
    handleMenuSelect (key) {
      this.activeMenu = key
      this.$router.push(key).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          throw err
        }
      })
    }
  }
}
</script>

<template>
  <div class="community-vitality">
    <!-- 左侧侧边栏 -->
    <div class="sidebar">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        @select="handleMenuSelect"
        background-color="rgba(255, 255, 255, 0.95)"
        text-color="#2c3e50"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="FindNews">
          <i class="el-icon-search"></i>
          <span>发现内容</span>
        </el-menu-item>
        <el-menu-item index="PublishContent">
          <i class="el-icon-edit"></i>
          <span>发布帖子</span>
        </el-menu-item>
        <el-menu-item index="PersonalHomepage">
          <i class="el-icon-user"></i>
          <span>个人主页</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="less">
.community-vitality {
  width: 100%;
  height: 100%;
  display: flex;
  background: #f8f9fa;
}

.sidebar {
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid #eee;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);

  .el-menu-vertical {
    border-right: none;
    height: 100%;
  }

  .el-menu-item {
    padding: 0 20px !important;
    font-size: 16px;
    height: 56px;
    line-height: 56px;

    i {
      margin-right: 12px;
      font-size: 20px;
    }

    &.is-active {
      background: rgba(255, 208, 75, 0.2);
      border-left: 4px solid #ffd04b;
    }
  }
}

.content {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 0 15px 15px 0;
}
</style>
