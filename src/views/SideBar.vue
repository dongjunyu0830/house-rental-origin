<script>
import '@/assets/icon-font/project/iconfont.css'

export default {
  name: 'SideBar',
  data () {
    return {
      transitionName: 'slide-left'
    }
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.meta.depth || 0
      const fromDepth = from.meta.depth || 0
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    }
  },
  methods: {
    headerClick () {
      if (this.$route.path !== '/' && this.$route.path !== '/PropertyIllustration') {
        this.$refs.menu.activeIndex = 'PropertyIllustration'
        this.$router.push('/PropertyIllustration')
      }
    }
  }
}
</script>

<template>
  <div class="sidebar">
    <div class="header">
      <div class="icon" @click="headerClick">
        <i class="el-icon-office-building" style="color: #ffd04f; font-size: 32px;"></i>
        <span class="header-text">安心好住:)</span>
      </div>
      <div class="text" @click="headerClick">
        找房
      </div>
    </div>
    <div class="main">
      <el-menu
        ref="menu"
        router
        default-active="PropertyIllustration"
        class="el-menu-vertical-demo"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="PropertyIllustration">
          <i class="el-icon-s-home"></i>
          <span slot="title">房源图示</span>
        </el-menu-item>
        <el-menu-item index="RealsceneAnalysis">
          <i class="el-icon-location"></i>
          <span slot="title">实景分析</span>
        </el-menu-item>
        <el-menu-item index="ThermalComparison">
          <i class="el-icon-platform-eleme"></i>
          <span slot="title">热力比较</span>
        </el-menu-item>
        <el-menu-item index="ExchangeSquare">
          <i class="el-icon-s-comment"></i>
          <span slot="title">交流广场</span>
        </el-menu-item>
        <el-menu-item index="PropertyComparison">
          <i class="el-icon-s-data"></i>
          <span slot="title">房源对比</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="footer">
      <span class="iconfont icon-tuichu exit">退出系统</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.sidebar {
  margin: 20px 10px 20px 10px;
  background: linear-gradient(135deg, #545c64 0%, #3a424a 100%);
  width: 15%;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.header {
  flex: 2;
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
  padding: 0 16px;
  transition: all 0.3s ease;

  .icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: "SimSun", "宋体", serif;
    font-weight: bold;
    transition: all 0.3s ease;

    .header-text {
      color: #ffd04f;
      font-size: 14px;
      margin-top: 4px;
      transition: all 0.3s ease;
    }
  }

  .text {
    font-family: "SimSun", "宋体", serif;
    font-weight: bold;
    font-size: 28px;
    color: #ffd04f;
    transition: all 0.3s ease;
    letter-spacing: 2px;
  }
}

.header:hover {
  transform: translateY(-1px);

  .header-text {
    color: #fff;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }

  .text {
    color: #fff;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
}

.main {
  flex: 7;
  width: 100%;
  background: transparent;
  padding: 0 8px;
}

.el-menu {
  border: none;
  background: transparent !important;

  .el-menu-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 56px;
    margin: 4px 0;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    i {
      margin-right: 16px;
      font-size: 18px;
      transition: all 0.3s ease;
    }

    span {
      flex: none;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    &.is-active {
      background: linear-gradient(135deg, #ffd04b 0%, #ffb347 100%) !important;
      box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);

      i, span {
        color: #2c3e50 !important;
        transform: translateX(2px);
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 24px;
        background: #2c3e50;
        border-radius: 0 2px 2px 0;
      }
    }

    &:not(.is-active):hover {
      background: rgba(255, 255, 255, 0.08) !important;
      transform: translateX(4px);

      i {
        transform: scale(1.1);
        color: #ffd04b;
      }

      span {
        color: #ffd04b;
      }
    }
  }
}

.footer {
  flex: 1;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .exit {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      color: #ffd04b;
      background: rgba(255, 255, 255, 0.05);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@media (max-height: 700px) {
  .header {
    margin-bottom: 16px;
    gap: 10px;

    .text {
      font-size: 24px;
    }

    .icon .header-text {
      font-size: 12px;
    }
  }

  .el-menu .el-menu-item {
    height: 52px;
    margin: 2px 0;

    i {
      margin-right: 12px;
      font-size: 16px;
    }

    span {
      font-size: 13px;
    }
  }

  .footer {
    padding: 12px;

    .exit {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
}
</style>
