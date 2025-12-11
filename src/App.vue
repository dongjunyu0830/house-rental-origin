<script>
import SideBar from '@/views/SideBar.vue'
import { mapActions } from 'vuex'

export default {
  name: 'app',
  components: { SideBar },
  data () {
    return {
      transitionName: 'fade'
    }
  },
  mounted () {
    this.loadHouseData()
  },
  methods: {
    ...mapActions(['loadHouseData'])
  }
}
</script>

<template>
  <div id="app">
    <SideBar></SideBar>
    <div class="content">
      <transition :name="transitionName" mode="out-in">
        <keep-alive :include="['PropertyComparison', 'ExchangeSquare']">
          <router-view class="router-view" />
        </keep-alive>
      </transition>
    </div>
  </div>
</template>

<style lang="less">
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #fbdb91;
  justify-content: space-between;
}

.content {
  margin: 20px 10px 20px 10px;
  background-color: #fff;
  width: 85%;
  border-radius: 15px;
  overflow: hidden;
}

.router-view {
  width: 100%;
  height: 100%;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.slide-left-enter {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter {
  opacity: 0;
  transform: scale(0.9);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.el-button--primary {
  background-color: #ffd04b !important;
  border-color:     #ffd04b !important;
  color: #2c3e50 !important;

  &:hover,
  &:focus,
  &:active {
    background-color: #ffbc40 !important;
    border-color:     #ffbc40 !important;
  }

  &.is-plain {
    color: #ffd04b !important;
    background: rgba(255, 208, 75, 0.1) !important;
    border-color: #ffd04b !important;

    &:hover {
      background: #ffd04b !important;
      color: #2c3e50 !important;
    }
  }
}

.el-tabs__active-bar {
  background-color: #ffd04b !important;
}
.el-tabs__item.is-active {
  color: #ffd04b !important;
}
.el-tabs__item:hover {
  color: #ffd04b !important;
}
</style>
