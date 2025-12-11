<script>
import HeatPoint from '@/components/HeatPoint/index.vue'
import WishList from '@/components/WishList/index.vue'
import HouseDetail from '@/components/HouseDetail/index.vue'

export default {
  name: 'ThermalComparison',
  components: {
    HouseDetail,
    WishList,
    HeatPoint
  },
  data () {
    return {
      isWishListVisible: false,
      activeHeatTypeClass: 'comprehensive',
      floatingDetail: {
        visible: false,
        house: null
      }
    }
  },
  watch: {
  },
  methods: {
    toggleWishList () {
      this.isWishListVisible = !this.isWishListVisible
    },
    handleLocate (house) {
      if (!this.$refs.heatPoint || !this.$refs.heatPoint.map) {
        console.warn('！！！地图未初始化！！！')
        return
      }
      const point = new BMapGL.Point(house.longitude, house.latitude)
      this.$refs.heatPoint.map.centerAndZoom(point, 20)
      this.isDetailVisible = false
      this.isWishListVisible = false
    },
    switchHeatMap (type) {
      this.activeHeatTypeClass = type
      // this.$refs.heatPoint?.switchTo(type)
    },
    onShowHouseDetail (house) {
      if (house === undefined || house === null) return
      this.floatingDetail.visible = false
      setTimeout(() => {
        this.floatingDetail = {
          visible: true,
          house
        }
        this.handleLocate(house)
      }, 100)
    },
    floatCardAddToWishList () {
      if (this.floatingDetail.house === null || this.floatingDetail.house.length < 1) return
      this.$store.commit('addToWishList', this.floatingDetail.house)
      this.$notify.success({
        title: '提示',
        message: '已加入心愿单',
        duration: 2000,
        position: 'top-right',
        offset: 80
      })
      this.floatingDetail.visible = false
    },
    closeFloatingOnOutside (e) {
      if (e.target.closest('.floating-detail-card')) {
        return
      }
      if (e.target.closest('.wish-icon') || e.target.closest('.wish-list')) {
        return
      }
      this.floatingDetail.visible = false
    }
  }
}
</script>

<template>
  <div class="surround-facility" @click="closeFloatingOnOutside">
    <HeatPoint ref="heatPoint" class="map-layer" :heat-type="activeHeatTypeClass" @show-house-detail="onShowHouseDetail"></HeatPoint>
    <el-button class="wish-icon" circle @click="toggleWishList">
      <i class="el-icon-star-off" style="font-size: 24px; color: #ffd04b;"/>
    </el-button>
    <transition name="fade-scale">
      <div
        v-if="floatingDetail.visible"
        class="floating-detail-card"
        @click.stop
      >
        <HouseDetail :feature="floatingDetail.house"/>
        <div
          class="float-wish-icon"
          @click="floatCardAddToWishList"
        >
          <i class="el-icon-star-off" style="font-size: 24px; color: #ffd04b;"/>
        </div>
      </div>
    </transition>
    <wish-list v-if="isWishListVisible" @close="isWishListVisible = false" @locate="handleLocate"/>
    <div class="components">
      <h3 class="title">热力图切换</h3>
      <div class="tools">
        <div class="comprehensive">
          <el-button
            @click="switchHeatMap('comprehensive')"
            type="warning"
            :plain="activeHeatTypeClass !== 'comprehensive'"
            style="width: 100%"
          >
            综合便利度热力图
          </el-button>
          <ul class="description">
            <li>交通</li>
            <li>医疗</li>
            <li>教育</li>
            <li>商业</li>
            <li>休闲</li>
          </ul>
        </div>
        <div class="personalization">
          <h3>个性化需求匹配热力图</h3>
          <div class="button-group">
            <el-button @click="switchHeatMap('work')" class="work" type="warning" plain>上班族模式</el-button>
            <el-button @click="switchHeatMap('home')" class="home" type="warning" plain>家庭模式</el-button>
            <el-button @click="switchHeatMap('young')" class="young" type="warning" plain>年轻人模式</el-button>
            <el-button @click="switchHeatMap('elder')" class="elder" type="warning" plain>养老模式</el-button>
          </div>
        </div>
        <div class="day-parting">
          <h3>分时段活力热力图</h3>
          <div class="button-group">
            <el-button @click="switchHeatMap('daylight')" class="daylight" type="warning" plain>工作日白天</el-button>
            <el-button @click="switchHeatMap('daynight')" class="daynight" type="warning" plain>工作日晚间</el-button>
            <el-button @click="switchHeatMap('weekend')" class="weekend" type="warning" plain>周末全天</el-button>
            <el-button @click="switchHeatMap('holiday')" class="holiday" type="warning" plain>节假日</el-button>
          </div>
        </div>
        <div class="association">
          <h3>房价-便利度关联热力图</h3>
          <div class="button-group">
            <el-button
              @click="switchHeatMap('convenience')"
              class="convenience"
              type="warning"
              plain
              style="width: 100%;"
            >
              高便利度区域
            </el-button>
            <div class="description-line">高租金区域</div>
            <el-button
              @click="switchHeatMap('cost-performance')"
              class="cost-performance" type="warning"
              plain
              style="width: 100%;"
            >
              性价比区域
            </el-button>
            <div class="description-line">中等便利度但租金较低区域</div>
            <el-button
              @click="switchHeatMap('potential')"
              class="potential"
              type="warning"
              plain
              style="width: 100%;"
            >
              潜力区域
            </el-button>
            <div class="description-line">便利度中等但租金洼地区域</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.surround-facility {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
}

.map-layer {
  z-index: 1;
}

.floating-detail-card {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 640px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: auto;
  animation: floatIn 0.4s ease-out forwards;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 16px;
    height: 16px;
    background: white;
    box-shadow: -2px -2px 8px rgba(0, 0, 0, 0.1);
    z-index: -1;
  }

  .float-wish-icon {
    position: absolute;
    right: 0;
    top: 0;
    border-radius: 0 12px 0 12px;
    z-index: 9;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ffd04b;
    padding: 10px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
    }
  }
}

.wish-icon {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ffd04b;
  padding: 10px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
  }
}

.components {
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 2;
  width: 320px;
  height: 100%;
  top: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-left: 1px solid #e8e8e8;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(44, 62, 80, 0.3);
    border-radius: 10px;
    transition: background 0.3s;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(44, 62, 80, 0.5);
  }

  .title,
  h3 {
    color: #2c3e50;
    font-size: 18px;
    margin: 0 0 15px 0;
    text-align: center;
    font-weight: 600;
  }

  .tools {
    display: flex;
    flex-direction: column;
    gap: 30px;

    > div {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 15px;
      border-radius: 10px;
      background-color: rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
      transition: box-shadow 0.3s ease;

      &:hover {
        box-shadow: 0 6px 16px rgba(255, 208, 75, 0.4);
      }
    }

    .comprehensive {
      .description {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        list-style: none;
        padding: 0;
        margin: 10px 0 0 0;
        gap: 5px;

        li {
          font-size: 14px;
          color: #2c3e50;
          background-color: rgba(255, 208, 75, 0.1);
          padding: 5px 10px;
          border-radius: 20px;
          flex: 1;
          text-align: center;
          white-space: nowrap;
        }
      }
    }

    .personalization,
    .day-parting {
      .button-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        :deep(.el-button + .el-button) {
          margin-left: 0 !important;
        }
      }
    }

    .association {
      .button-group {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .description-line {
          font-size: 14px;
          color: #2c3e50;
          text-align: center;
          margin: -5px 0 5px 0;
          opacity: 0.8;
        }
      }
    }
  }

  .el-button {
    height: 40px;
    font-size: 14px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &[type="warning"] {
      border-color: #ffd04b;
      color: #2c3e50;

      &:hover,
      &:active,
      &.is-active {
        background-color: #ffd04b;
        color: #fff;
        box-shadow: 0 2px 8px rgba(255, 208, 75, 0.3);
      }
    }

    .personalization .button-group &,
    .day-parting .button-group & {
      width: 100%;
    }
  }
}
</style>
