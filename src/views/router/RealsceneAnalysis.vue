<script>
import AnalysisIndex from '@/components/Analysis/index.vue'
import '@/assets/icon-font/project/iconfont.css'
import WishList from '@/components/WishList/index.vue'
import HouseDetail from '@/components/HouseDetail/index.vue'

export default {
  name: 'RealsceneAnalysis',
  components: {
    HouseDetail,
    WishList,
    AnalysisIndex
  },
  data () {
    return {
      isWishListVisible: false,
      checkboxGroup: ['公园'],
      planningMethods: ['驾车'],
      origin: '',
      destination: '',
      centerPoint: '',
      chooseLayer: '',
      selectMode: '',
      floatingDetail: {
        visible: false,
        house: null
      },
      routeInfos: [], // 接收路径信息
      showRoutePanel: false, // 控制弹窗显示
      showIsochroneTip: false,
      showIsochroneLegend: false, // 控制图例弹窗
      isochroneLayersCount: 0, // 记录实际绘制的层数
      thresholdColors: ['#ff4d4f', '#ffa940', '#ffdb5c', '#4caf50', '#2196f3'] // 等时圈配色方案
    }
  },
  mounted () {
  },
  watch: {
    // 当选择等时圈设施类型时，自动勾选对应图层（确保数据已加载）
    chooseLayer (newVal) {
      if (newVal && !this.checkboxGroup.includes(newVal)) {
        this.checkboxGroup = [...this.checkboxGroup, newVal]
        this.$notify.success({
          title: '加载完成',
          message: `已加载 ${newVal} 图层，用于等时圈分析`,
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
      }
    }
  },
  computed: {},
  methods: {
    toggleWishList () {
      this.isWishListVisible = !this.isWishListVisible
    },
    handleLocate (house) {
      const point = new BMapGL.Point(house.longitude, house.latitude)
      this.$refs.analysisIndex.map.centerAndZoom(point, 17)
      this.isDetailVisible = false
      this.isWishListVisible = false
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
        title: '添加成功',
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
      this.isWishListVisible = false
    },
    selectPoint (mode) {
      this.selectMode = mode
    },
    planRoute () {
      if (this.$refs.analysisIndex && typeof this.$refs.analysisIndex.drawRoutes === 'function') {
        this.$refs.analysisIndex.drawRoutes(this.origin, this.destination, this.planningMethods)
      } else {
        this.$notify.error({
          title: '警告',
          message: '地图未初始化',
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
      }
    },
    onRouteInfoUpdate (infos) {
      this.routeInfos = infos
      this.showRoutePanel = infos.length > 0
    },
    // 点击“点击绘制”按钮
    drawSynchrone () {
      if (!this.chooseLayer) {
        this.$notify.warning({
          title: '提示',
          message: '请选择设施点类型',
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
        return
      }
      if (!this.centerPoint) {
        this.$notify.warning({
          title: '提示',
          message: '请先选择中心点',
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
        return
      }
      if (this.$refs.customIsochroneTip) {
        this.$refs.customIsochroneTip.show()
      }
      this.$refs.analysisIndex.drawIsochrone(this.centerPoint, this.chooseLayer)
    },
    // 清除等时圈
    clearSynchrone () {
      if (this.$refs.analysisIndex && typeof this.$refs.analysisIndex.clearIsochrones === 'function') {
        this.$refs.analysisIndex.clearIsochrones()
        this.$notify.info({
          title: '提示',
          message: '等时圈已清除',
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
        this.showIsochroneLegend = false
      }
    },
    onIsochroneComplete (layerCount) {
      this.isochroneLayersCount = layerCount
      this.showIsochroneLegend = true
      this.showIsochroneTip = false
    }
  }
}
</script>

<template>
  <div class="house-viewing" @click="closeFloatingOnOutside">
    <AnalysisIndex
      ref="analysisIndex"
      class="map-layer"
      :checkboxGroup="checkboxGroup"
      :origin="origin"
      :destination="destination"
      :planning-methods="planningMethods"
      :chooseLayer="chooseLayer"
      :selectMode="selectMode"
      @show-house-detail="onShowHouseDetail"
      @update:origin="origin = $event"
      @update:destination="destination = $event"
      @update:selectMode="selectMode = $event"
      @update:centerPoint="centerPoint = $event"
      @route-info-update="onRouteInfoUpdate"
      @isochrone-loading="showIsochroneTip = $event"
      @isochrone-complete="onIsochroneComplete"
    />
    <!-- 顶部房源信息弹窗 -->
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

    <!-- 顶部路径信息弹窗 -->
    <transition name="fade">
      <div v-if="showRoutePanel" class="route-info-panel">
        <div class="panel-header">
          <span class="title">路径规划结果</span>
          <i class="el-icon-close" @click="showRoutePanel = false"></i>
        </div>
        <div class="panel-content">
          <div v-for="info in routeInfos" :key="info.type" class="route-item">
            <span class="type"
                  :style="{ color: info.type === '驾车' ? '#e74c3c' : info.type === '公共交通' ? '#3498db' : '#27ae60' }">
              {{ info.type }}：
            </span>
            <span>{{ info.distance }}，预计 {{ info.duration }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 自定义等时圈加载提示弹窗 -->
    <transition name="fade-scale">
      <div
        v-if="showIsochroneTip"
        ref="customIsochroneTip"
        class="custom-isochrone-loading"
        @click.stop
      >
        <div class="loading-content">
          <i class="el-icon-loading" style="font-size: 32px; color: #ffd04b; margin-bottom: 12px;"></i>
          <div class="text" style="font-size: 16px; font-weight: 600; color: #333;">
            正在计算驾车时间
          </div>
          <div class="subtext" style="font-size: 14px; color: #666; margin-top: 8px;">
            分析 {{ chooseLayer }} 等时圈 · 预计 10-30 秒
          </div>
          <div class="progress-hint" style="margin-top: 16px; font-size: 13px; color: #999;">
            可继续操作地图，稍后自动完成
          </div>
        </div>
      </div>
    </transition>

    <!-- 等时圈图例弹窗 -->
    <transition name="slide-down">
      <div v-if="showIsochroneLegend" class="isochrone-legend-card">
        <div class="legend-header">
          <span class="title">驾车等时圈分析结果</span>
          <i class="el-icon-close" @click="clearSynchrone"></i>
        </div>
        <div class="legend-body">
          <div
            v-for="(time, idx) in ['0-5分钟', '5-10分钟', '10-15分钟', '15-20分钟', '20-30分钟']"
            :key="idx"
            class="legend-item"
            :class="{ disabled: idx >= isochroneLayersCount }"
          >
        <span
          class="color-block"
          :style="{ backgroundColor: thresholdColors[idx] }"
        ></span>
            <span class="time-text">{{ time }}</span>
          </div>
        </div>
      </div>
    </transition>

    <el-button class="wish-icon" circle @click="toggleWishList">
      <i class="el-icon-star-off" style="font-size: 24px; color: #ffd04b;"/>
    </el-button>
    <wish-list v-if="isWishListVisible" @close="isWishListVisible = false" @locate="handleLocate"/>

    <div class="components">
      <div class="tools">
        <div class="add-layers">
          <span class="title">加载设施点图层</span>
          <div class="layers">
            <el-checkbox-group v-model="checkboxGroup" size="small">
              <el-checkbox-button v-for="(item, index) in ['公园', '学校', '商场', '医院']" :label="item" :key="index">
                {{ item }}
              </el-checkbox-button>
            </el-checkbox-group>
          </div>
        </div>
        <div class="analysis-tools">
          <div class="route-planning">
            <span class="title">路径规划</span>
            <div class="setting">
              <div class="point-to-point">
                <el-checkbox-group v-model="planningMethods" size="small">
                  <el-checkbox-button v-for="(item, index) in ['驾车', '公共交通', '步行']" :label="item" :key="index">
                    {{ item }}
                  </el-checkbox-button>
                </el-checkbox-group>
                <el-input placeholder="点击右侧按钮选择起点" v-model="origin">
                  <template slot="prepend">起点</template>
                  <template slot="append">
                    <el-button class="iconfont icon-zuobiao" @click.native="selectPoint('origin')"></el-button>
                  </template>
                </el-input>
                <el-input placeholder="点击右侧按钮选择终点" v-model="destination">
                  <template slot="prepend">终点</template>
                  <template slot="append">
                    <el-button class="iconfont icon-zuobiao" @click.native="selectPoint('destination')"></el-button>
                  </template>
                </el-input>
              </div>
              <div class="submit-btn">
                <el-button type="primary" style="width: 100%" @click="planRoute">
                  <i class="iconfont icon-zuobiao">点击规划</i>
                </el-button>
              </div>
            </div>
          </div>
          <div class="synchrone">
            <span class="title">出行分级等时圈</span>
            <div class="drow-synchrone">
              <div class="choose-layer">
                <el-select v-model="chooseLayer" placeholder="请选择设施点" style="width: 100%">
                  <el-option
                    v-for="(item, index) in ['公园', '学校', '商场', '医院']"
                    :key="index"
                    :label="item"
                    :value="item">
                  </el-option>
                </el-select>
                <el-input placeholder="点击右侧按钮选择中心" v-model="centerPoint">
                  <template slot="prepend"><i class="iconfont icon-shizhongxin"></i></template>
                  <template slot="append">
                    <el-button class="iconfont icon-zuobiao" @click.native="selectPoint('centerPoint')"></el-button>
                  </template>
                </el-input>
              </div>
              <!-- 绘制按钮 -->
              <div class="submit-btn">
                <el-button type="primary" style="width: 100%" @click="drawSynchrone">
                  <i class="iconfont icon-huizhi">点击绘制</i>
                </el-button>
              </div>
              <!-- 清除按钮 -->
              <div class="submit-btn" style="margin-top: 8px;">
                <el-button type="primary" style="width: 100%" @click="clearSynchrone">
                  <i class="iconfont icon-qingchu">清除等时圈</i>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="legend">
        <div class="title">
          <span>设施点图例</span>
        </div>
        <div class="icon">
          <i class="iconfont icon-a-065_gongyuan park"> 公园 </i>
          <i class="iconfont icon-xuexiao1 school"> 学校 </i>
          <i class="iconfont icon-gouwu mall"> 商场 </i>
          <i class="iconfont icon-yiyuan hospital"> 医院 </i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.house-viewing {
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
  position: absolute;
  top: 20px;
  left: 40%;
  transform: translateX(-50%);
  width: 640px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: auto;
  animation: floatInCard 0.4s ease-out forwards;

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

@keyframes floatInCard {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-scale-enter,
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.route-info-panel {
  position: absolute;
  top: 20px;
  left: 40%;
  transform: translateX(-50%);
  width: 420px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #ffd04b;
  padding: 16px;
  backdrop-filter: blur(10px);
  z-index: 200;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 600;
    font-size: 16px;
    color: #2c3e50;

    .el-icon-close {
      cursor: pointer;
      font-size: 18px;
      color: #999;
      &:hover { color: #ff4d4f; }
    }
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .route-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #333;

    .type {
      font-weight: 600;
      min-width: 70px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.custom-isochrone-loading {
  position: absolute;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
  width: 320px;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid #ffd04b44;
  backdrop-filter: blur(12px);
  z-index: 300;
  text-align: center;
  pointer-events: none;
  animation: floatInCard 0.5s ease-out;

  .loading-content {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
}

.isochrone-legend-card {
  position: absolute;
  top: 20px;
  left: 40%;
  transform: translateX(-50%);
  width: 280px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #ffd04b44;
  backdrop-filter: blur(12px);
  z-index: 400;
  overflow: hidden;
  animation: slideDown 0.6s ease-out;

  .legend-header {
    padding: 16px 20px 12px;
    background: linear-gradient(135deg, #ffb347, #ffd04b);
    color: white;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .el-icon-close {
      cursor: pointer;
      font-size: 18px;
      &:hover { opacity: 0.8; }
    }
  }

  .legend-body {
    padding: 16px 20px;

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      opacity: 1;
      transition: opacity 0.3s;

      &.disabled { opacity: 0.3; }

      .color-block {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        margin-right: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .time-text {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-30px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px);
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
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-left: 1px solid #e8e8e8;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);

  .tools {
    flex: 1;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
  }
}

.add-layers,
.route-planning,
.synchrone {
  margin-bottom: 20px;

  .title {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.analysis-tools {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .setting,
  .drow-synchrone {
    .point-to-point,
    .choose-layer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
    }
  }
}

.el-input {
  border-radius: 6px;

  .el-input__inner {
    height: 36px;
    line-height: 36px;
  }

  .el-input-group__prepend,
  .el-input-group__append {
    background-color: #f5f7fa;
    border: none;
    color: #606266;
    padding: 0 12px;

    .el-button {
      border: none;
      background: transparent;
      color: #ffd04b;
      padding: 8px;
      &:hover { color: #ffd04b; }
    }
  }
}

.submit-btn .el-button {
  width: 100%;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 500;
  font-size: 16px;
  background: linear-gradient(135deg, #ffb347, #ffd04b);
  border: none;
  transition: all 12px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 188, 64, 0.3);
  }

  .iconfont {
    margin-right: 4px;
    font-size: 12px;
  }
}

.legend {
  flex-shrink: 0;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid #f0f0f0;

  .title {
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 12px;
    text-align: center;
  }

  .icon {
    display: flex;
    flex-direction: column;
    gap: 8px;

    i {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 6px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      font-size: 16px;

      &:hover {
        transform: translateX(2px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }

      &::before { margin-right: 6px; font-size: 16px; }
    }

    .park    { color: #18B14EFF; }
    .school  { color: #DC2D07FF; }
    .mall    { color: #F19D00FF; }
    .hospital{ color: #0E7BA8FF; }
    .house   { color: #DC568CFF; }
  }
}

@media (max-height: 800px) {
  .components {
    width: 300px;

    .tools { padding: 16px 12px; }
  }

  .add-layers,
  .route-planning,
  .synchrone {
    margin-bottom: 16px;
  }

  .legend {
    padding: 12px;
  }
}
</style>
