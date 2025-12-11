<script>
/* eslint-disable */
import axios from 'axios'
import OpenlayersIndex from '@/views/Openlayers.vue'
import HouseDetail from '@/components/HouseDetail/index.vue'
import { mapActions, mapState } from 'vuex'
import BaiduMap from '@/components/BMap/index.vue'
import WishList from '@/components/WishList/index.vue'

export default {
  name: 'PropertyIllustration',
  components: {
    WishList,
    BaiduMap,
    HouseDetail,
    OpenlayersIndex
  },
  data () {
    return {
      isWishListVisible: false,
      isDetailVisible: false,
      selectedHouse: null,
      feature: {},
      floatingDetail: {
        visible: false,
        house: null
      },
      filteredHouses: [],
      input: {
        rental_method: [
          {
            value: '整租',
            label: '整租'
          },
          {
            value: '合租',
            label: '合租'
          }
        ],
        house_size: [
          {
            value: '1室',
            label: '1室'
          },
          {
            value: '2室',
            label: '2室'
          },
          {
            value: '3室',
            label: '3室'
          },
          {
            value: '4室',
            label: '4室'
          },
          {
            value: '5室',
            label: '5室'
          },
          {
            value: '6室',
            label: '6室'
          },
          {
            value: '7室',
            label: '7室'
          }
        ],
        district: {
          result: [],
          state: '',
          timeout: null
        }
      },
      check: {
        rental_method: [],
        house_size: [],
        district: '',
        price: {
          min: '',
          max: ''
        }
      }
    }
  },
  computed: {
    ...mapState(['houseDetail']),
    priceRange () {
      if (!Array.isArray(this.houseDetail) || this.houseDetail.length === 0) {
        return {
          min: 0,
          max: 0
        }
      }
      const prices = this.houseDetail.map(item => {
        const price = parseFloat(item.price)
        return isNaN(price) ? 0 : price
      }).filter(price => price > 0)
      if (prices.length === 0) {
        return {
          min: 0,
          max: 0
        }
      }
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return {
        min,
        max
      }
    },
    priceOptions () {
      const {
        min,
        max
      } = this.priceRange
      if (min === 0 && max === 0) {
        return [{
          value: '不限',
          label: '不限'
        }]
      }
      const options = [{
        value: '不限',
        label: '不限'
      }]
      const step = Math.ceil((max - min) / 5)
      for (let i = 0; i <= 5; i++) {
        const start = min + i * step
        const end = min + (i + 1) * step
        if (start <= max) {
          const label = i === 5 ? start : end
          options.push({
            value: label,
            label: label
          })
        }
      }
      return options
    }
  },
  watch: {
    houseDetail: {
      handler (newVal) {
        this.filteredHouses = newVal
      },
      immediate: true
    },
    'check.price.min': function (newVal, oldVal) {
      this.validateMinPrice(newVal)
    },
    'check.price.max': function (newVal, oldVal) {
      this.validateMaxPrice(newVal)
    }
  },
  mounted () {
    if (!this.houseDetail.length) {
      this.$store.dispatch('loadHouseData')
    }
  },
  beforeDestroy () {
    if (this.$refs.baiduMap?.$el) {
      this.$refs.baiduMap.$el.removeEventListener('click', this.handleMapClick)
    }
  },
  methods: {
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
    handleMapClick (e) {
      if (e.target === this.$refs.baiduMap.$el) {
        this.floatingDetail.visible = false
      }
    },
    querySearchAsync (queryString, cb) {
      clearTimeout(this.input.district.timeout)
      this.input.district.timeout = setTimeout(() => {
        let filteredResults = []
        if (Array.isArray(this.houseDetail)) {
          if (queryString) {
            filteredResults = this.houseDetail.filter(this.createStateFilter(queryString))
          } else {
            filteredResults = [...this.houseDetail]
          }
        }
        this.input.district.result = filteredResults
        const uniqueMap = new Map()
        filteredResults.forEach(item => {
          if (!uniqueMap.has(item.building)) {
            uniqueMap.set(item.building, item)
          }
        })
        const formattedResults = Array.from(uniqueMap.values()).map(item => ({
          ...item,
          value: item.building
        }))
        cb(formattedResults)
      }, 300)
    },
    createStateFilter (queryString) {
      return (state) => {
        return (state.building.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
      }
    },
    validateMinPrice (newVal) {
      if (newVal === '不限' || this.check.price.max === '不限') {
        return
      }
      if (newVal && this.check.price.max) {
        const min = parseFloat(newVal)
        const max = parseFloat(this.check.price.max)
        if (!isNaN(min) && !isNaN(max) && min > max) {
          this.$nextTick(() => {
            this.check.price.max = newVal
          })
        }
      }
    },
    validateMaxPrice (newVal) {
      if (newVal === '不限' || this.check.price.min === '不限') {
        return
      }
      if (newVal && this.check.price.min) {
        const min = parseFloat(this.check.price.min)
        const max = parseFloat(newVal)
        if (!isNaN(min) && !isNaN(max) && min > max) {
          this.$nextTick(() => {
            this.check.price.min = newVal
          })
        }
      }
    },
    toggleWishList () {
      this.isWishListVisible = !this.isWishListVisible
    },
    handleLocate (house) {
      if (!this.$refs.baiduMap || !this.$refs.baiduMap.map) {
        this.$notify.error({
          title: '警告',
          message: '地图未初始化',
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
        return
      }
      const point = new BMapGL.Point(house.longitude, house.latitude)
      this.$refs.baiduMap.map.centerAndZoom(point, 20)
      this.isDetailVisible = false
      this.isWishListVisible = false
    },
    search () {
      let filtered = this.houseDetail
      if (this.check.rental_method.length > 0) {
        filtered = filtered.filter(item =>
          this.check.rental_method.some(method => item.description.includes(method))
        )
      }
      if (this.check.house_size.length > 0) {
        filtered = filtered.filter(item => {
          const rooms = item.room.split('室')[0] + '室'
          return this.check.house_size.includes(rooms)
        })
      }
      if (this.check.district) {
        filtered = filtered.filter(item =>
          item.building.toLowerCase().includes(this.check.district.toLowerCase())
        )
      }
      const minPrice = (this.check.price.min === '不限' || !this.check.price.min)
        ? -Infinity
        : parseFloat(this.check.price.min)
      const maxPrice = (this.check.price.max === '不限' || !this.check.price.max)
        ? Infinity
        : parseFloat(this.check.price.max)
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price)
        return !isNaN(price) && price >= minPrice && price <= maxPrice
      })
      this.filteredHouses = filtered
    },
    showDetail (house) {
      this.selectedHouse = house
      this.isDetailVisible = true
    },
    addToWishList () {
      if (this.selectedHouse === null || this.selectedHouse.length < 1) return
      this.$store.commit('addToWishList', this.selectedHouse)
      this.$notify.success({
        title: '提示',
        message: '已加入心愿单',
        duration: 2000,
        position: 'top-right',
        offset: 80
      })
    },
    floatCardAddToWishList () {
      this.selectedHouse = this.floatingDetail.house
      this.addToWishList()
      this.floatingDetail.visible = false
    }
  }
}
</script>

<template>
  <div class="house-map" @click="closeFloatingOnOutside">
    <BaiduMap
      ref="baiduMap"
      class="map-layer"
      @show-house-detail="onShowHouseDetail"
    ></BaiduMap>
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

    <el-button class="wish-icon" circle @click="toggleWishList">
      <i class="el-icon-star-off" style="font-size: 24px; color: #ffd04b;"/>
    </el-button>
    <transition name="slide-left">
      <wish-list v-if="isWishListVisible" @close="isWishListVisible = false" @locate="handleLocate" @click.stop/>
    </transition>
    <div class="components">
      <div class="tools">
        <div class="input rental-method">
          <el-select
            v-model="check.rental_method"
            multiple
            clearable
            collapse-tags
            default-first-option
            placeholder="请选择租房方式">
            <el-option
              v-for="(item, index) in input.rental_method"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="input house-size">
          <el-select
            v-model="check.house_size"
            multiple
            clearable
            collapse-tags
            default-first-option
            placeholder="请选择租房规格">
            <el-option
              v-for="(item, index) in input.house_size"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="input district">
          <el-autocomplete
            v-model="check.district"
            :fetch-suggestions="querySearchAsync"
            suffix-icon="el-icon-location"
            placeholder="请输入租房地点"
            clearable
            value-key="building"
          ></el-autocomplete>
        </div>
        <div class="input price">
          <el-select
            v-model="check.price.min"
            filterable
            allow-create
            default-first-option
            placeholder="最低"
            clearable
          >
            <el-option
              v-for="(item, index) in priceOptions"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select
            v-model="check.price.max"
            filterable
            allow-create
            default-first-option
            placeholder="最高"
            clearable
          >
            <el-option
              v-for="(item, index) in priceOptions"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="search-button" @click="search">
          <i class="el-icon-search"></i>
        </div>
      </div>
      <div class="main-content">
        <template v-if="filteredHouses.length > 0">
          <HouseDetail
            v-for="(item, index) in filteredHouses"
            :key="index"
            :feature="item"
            @clickOnDetail="showDetail"
          />
        </template>
        <div v-else class="no-data">
          没有找到符合条件的房源，请调整筛选条件重试。
        </div>
      </div>
    </div>
    <el-dialog
      :visible.sync="isDetailVisible"
      title="房源详情"
      width="60%"
      :destroy-on-close="true"
      :center="true"
      custom-class="house-detail-dialog"
      :append-to-body="true"
    >
      <div class="detail-content" v-if="selectedHouse">
        <div class="detail-header">
          <el-image :src="selectedHouse.pic_link" fit="cover" class="header-image"/>
          <div class="header-overlay">
            <h1 class="header-title">{{ selectedHouse.title }}</h1>
            <div class="header-price">
              <span class="price-amount">{{ selectedHouse.price }}</span>
              <span class="price-unit">{{ selectedHouse.unit }}</span>
            </div>
          </div>
        </div>
        <div class="detail-body">
          <div class="toolbar">
            <el-button type="warning" icon="el-icon-location" round @click="handleLocate(selectedHouse)" plain>定位
            </el-button>
            <el-button type="warning" icon="el-icon-star-off" round @click="addToWishList">加入心愿单</el-button>
          </div>
          <div class="info">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="标签">{{ selectedHouse.tag }}</el-descriptions-item>
              <el-descriptions-item label="户型">{{ selectedHouse.room }}</el-descriptions-item>
              <el-descriptions-item label="地址">{{ selectedHouse.address }}</el-descriptions-item>
              <el-descriptions-item label="楼盘">{{ selectedHouse.building }}</el-descriptions-item>
              <el-descriptions-item label="联系人">{{ selectedHouse.contact }}</el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">{{ selectedHouse.description }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
.house-map {
  width: 100%;
  height: 100%;
  background-color: #fbdb91;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
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

@keyframes floatIn {
  from {
    transform: translateX(-50%) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
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

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-left-enter-to,
.slide-left-leave {
  transform: translateX(0);
}

.components {
  width: 30%;
  height: 90%;
  position: absolute;
  top: 30px;
  right: 30px;
  z-index: 2;
  display: flex;
  flex-direction: column;

  .no-data {
    padding: 40px 20px;
    text-align: center;
    color: #999;
    font-size: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: relative;

    &::before {
      content: '\e6d9';
      font-family: 'element-icons';
      display: block;
      font-size: 48px;
      color: #ffd04b;
      margin-bottom: 20px;
    }
  }
}

.tools {
  width: 100%;
  height: 15%;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 3fr 3fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;

  .input {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);

      /deep/ .el-input__inner {
        border-color: #cbd5e1;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
    }

    /deep/ .el-select,
    /deep/ .el-autocomplete {
      width: 100%;

      .el-input__inner {
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
        color: #334155;
        font-size: 14px;
        height: 42px;
        line-height: 42px;
        transition: all 0.2s ease;

        &:focus {
          border-color: #ffd04f;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        &::placeholder {
          color: #94a3b8;
        }
      }
    }

    &.price {
      display: flex;
      gap: 8px;

      /deep/ .el-select {
        flex: 1;

        .el-input__inner {
          text-align: center;
          font-weight: 500;
        }
      }
    }
  }

  .search-button {
    grid-row: 1 / 3;
    grid-column: 3 / 4;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #ffd04b, #ffb347);
    border-radius: 10px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    color: #ffffff;
    box-shadow: 0 3px 10px rgba(255, 188, 64, 0.25);

    i {
      transition: transform 0.2s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 188, 64, 0.35);

      i {
        transform: scale(1.1);
      }
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(255, 188, 64, 0.25);
    }
  }
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

    &:hover {
      background: #94a3b8;
    }
  }
}

.house-detail-dialog {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden !important;

  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #ffd04b, #ffb347);
    color: white;
    padding: 16px 24px;
    border-radius: 12px 12px 0 0;
    font-size: 18px;
    font-weight: 600;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background: #ffffff;
  }

  :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: white;
    font-size: 20px;
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-header {
  position: relative;
  height: 220px;
  overflow: hidden;
  border-radius: 0 0 12px 12px;

  .header-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.85);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .header-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 24px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
    color: white;

    .header-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .header-price {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .price-amount {
        font-size: 28px;
        font-weight: bold;
      }
      .price-unit {
        font-size: 14px;
      }
    }
  }
}

.detail-body {
  display: flex;
  gap: 24px;
  padding: 24px;

  .toolbar {
    width: 140px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    :deep(.el-button + .el-button) {
      margin-left: 0 !important;
    }

    .el-button {
      width: 100%;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .info {
    flex: 1;

    :deep(.el-descriptions) {
      .el-descriptions-item__label {
        background: #f8f9fa;
        color: #606266;
        font-weight: 500;
      }
      .el-descriptions-item__content {
        color: #303133;
      }
    }
  }
}

@media (max-width: 768px) {
  .detail-body {
    flex-direction: column;

    .toolbar {
      width: 100%;
      flex-direction: row;
      gap: 16px;

      .el-button {
        flex: 1;
      }
    }
  }
}

@media (max-height: 700px) {
  .tools {
    padding: 10px;
    gap: 10px;

    .search-button {
      font-size: 20px;
    }
  }
}
</style>
