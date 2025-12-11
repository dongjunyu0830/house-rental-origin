<script>
import { mapState } from 'vuex'

export default {
  name: 'PropertyComparison',
  data () {
    return {
      selectedHouses: [],
      compareData: [],
      viewTab: 'table',
      charts: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.compareData.length === 0 && this.wishList.length > 0) {
        this.selectedHouses = this.wishList.map(h => h.id)
        this.addToCompare(true) // 静默模式，不弹窗
        this.viewTab = 'chart'
        // this.$message.success(`已自动加载 ${this.wishList.length} 个心愿单房源到对比`)
        this.$notify.success({
          title: '自动加载完成',
          message: `已将 ${this.wishList.length} 个心愿单房源添加到对比`,
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
      }
      if (this.compareData.length > 0) {
        this.initAllCharts()
      }
    })
  },
  beforeDestroy () {
    this.clearCharts()
  },
  watch: {
    compareData: {
      handler (newVal) {
        if (newVal.length > 0) {
          this.$nextTick(() => {
            this.clearCharts()
            this.initAllCharts()
          })
        } else {
          this.clearCharts()
        }
      },
      deep: true
    },
    viewTab (newVal) {
      if (newVal === 'chart') {
        this.$nextTick(() => {
          this.charts.forEach(chart => chart && chart.resize())
        })
      }
    },
    '$route' (to, from) {
      if (to.name === 'PropertyComparison' || to.path.includes('comparison')) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.charts.forEach(chart => chart && chart.resize())
          }, 100)
        })
      }
    }
  },
  computed: {
    ...mapState(['wishList']),
    houseOptions () {
      return this.wishList.map(house => ({
        value: house.id,
        label: house.title || `房源 ${house.id}`
      }))
    }
  },
  methods: {
    addToCompare (silent = false) {
      if (this.selectedHouses.length === 0) {
        // this.$message.warning('请先选择要对比的房源')
        this.$notify.warning({
          title: '加载提示',
          message: '请先选择要对比的房源',
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
        return
      }
      let addedCount = 0
      this.selectedHouses.forEach(id => {
        const alreadyExists = this.compareData.some(item => item.id === id)
        if (alreadyExists) return
        const house = this.wishList.find(h => h.id === id)
        if (house) {
          const roomInfo = house.room || ''
          const roomParts = roomInfo.split('|')
          const layout = roomParts[0] ? roomParts[0].trim() : '未知户型'
          const area = roomParts[1] ? roomParts[1].trim() : '未知面积'
          const floorInfo = roomParts[2] ? roomParts[2].trim() : ''
          this.compareData.push({
            id: house.id,
            title: house.title || '未知房源',
            price: house.price ? `${house.price} ${house.unit || '元/月'}` : '未知价格',
            layout: layout,
            area: area,
            floor: floorInfo || '未知楼层',
            building: house.building || '未知楼盘',
            address: house.address || '未知位置',
            description: house.description || '',
            contact: house.contact || '',
            tag: house.tag || '',
            pic_link: house.pic_link || ''
          })
          addedCount++
        }
      })
      if (!silent) {
        if (addedCount > 0) {
          // this.$message.success(`成功添加 ${addedCount} 个房源到对比`)
          this.$notify.success({
            title: '添加成功',
            message: `成功添加 ${addedCount} 个房源到对比`,
            duration: 2000,
            position: 'top-right',
            offset: 80
          })
        } else {
          // this.$message.info('选中的房源已全部在对比列表中')
          this.$notify.info({
            title: '房源已添加',
            message: '选中的房源已全部在对比列表中',
            duration: 2000,
            position: 'top-right',
            offset: 80
          })
        }
      }
      if (addedCount === 0) {
        this.$notify.info({
          title: '房源已添加',
          message: '选中的房源已全部在对比列表中',
          duration: 2000,
          position: 'top-right',
          offset: 80
        })
      }
      this.selectedHouses = []
    },
    removeItem (index) {
      this.compareData.splice(index, 1)
      // this.$message.info('已移除该房源')
      this.$notify.info({
        title: '移除房源',
        message: '已移除该房源',
        duration: 2000,
        position: 'top-right',
        offset: 80
      })
    },
    clearCompare () {
      this.compareData = []
      this.selectedHouses = []
      // this.$message.info('已清除所有对比房源')
      this.$notify.info({
        title: '清除完成',
        message: '已清除所有对比房源',
        duration: 2000,
        position: 'top-right',
        offset: 80
      })
    },
    exportReport () {
      this.$message.info('导出 PDF/Excel 功能开发中...')
    },
    saveCompare () {
      this.$message.info('保存对比方案功能开发中...')
    },
    clearCharts () {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
        this.resizeHandler = null
      }
      this.charts.forEach(chart => chart && chart.dispose && chart.dispose())
      this.charts = []
    },
    initAllCharts () {
      if (typeof echarts === 'undefined') {
        console.warn('ECharts 未加载完成，500ms 后重试...')
        setTimeout(() => this.initAllCharts(), 500)
        return
      }
      this.clearCharts()
      this.initScatterChart()
      this.initRadarChart()
      this.initBarChart()
      this.resizeHandler = () => {
        this.charts.forEach(chart => chart && chart.resize())
      }
      window.removeEventListener('resize', this.resizeHandler)
      window.addEventListener('resize', this.resizeHandler)
    },
    extractArea (areaStr) {
      const match = areaStr.match(/[\d.]+/)
      return match ? parseFloat(match[0]) : 0
    },
    extractPrice (priceStr) {
      const match = priceStr.match(/[\d,]+/)
      return match ? parseFloat(match[0].replace(/,/g, '')) : 0
    },
    // 1. 性价比散点图
    initScatterChart () {
      const chartDom = this.$refs.scatterChart
      if (!chartDom || this.compareData.length === 0) return
      const myChart = echarts.init(chartDom)
      this.charts.push(myChart)
      const prices = this.compareData.map(h => this.extractPrice(h.price))
      const areas = this.compareData.map(h => this.extractArea(h.area))
      const maxPrice = Math.max(...prices) || 1000 // 防止空数组报错
      const maxArea = Math.max(...areas) || 50
      // 坐标轴留白：租金 +1000，面积 +50
      const yAxisMax = Math.ceil((maxPrice + 1000) / 1000) * 1000
      const xAxisMax = Math.ceil((maxArea + 10) / 20) * 20
      const data = this.compareData.map(house => {
        const area = this.extractArea(house.area)
        const price = this.extractPrice(house.price)
        const unitPrice = area > 0 ? (price / area).toFixed(1) : '0'
        return {
          name: house.title,
          value: [area, price],
          unitPrice,
          itemStyle: {
            color: price < 4000 ? '#67c23a' : price < 7000 ? '#e6a23c' : '#f56c6c',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        }
      })
      const option = {
        title: {
          text: '性价比分析（右下角越划算）',
          left: 'center',
          top: 10,
          textStyle: { fontSize: 17, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0,0,0,0.85)',
          borderWidth: 0,
          padding: [10, 15],
          textStyle: { color: '#fff', fontSize: 14 },
          position: function (pos, params, dom, rect, size) {
            const x = pos[0]
            const viewWidth = size.viewSize[0]
            const tipWidth = 260
            return [
              Math.min(x + 10, viewWidth - tipWidth - 10), // 向右展开，防超出右边界
              pos[1] - 150 // 向上展开，固定高度
            ]
          },
          formatter: params => {
            const d = params.data
            return `
          <div style="line-height:1.6">
            <strong style="font-size:15px">${d.name}</strong><br/>
            面积：<strong>${d.value[0]} ㎡</strong><br/>
            月租：<strong style="color:#f56c6c">${d.value[1]} 元</strong><br/>
            单价：<strong style="color:#e6a23c">${d.unitPrice} 元/㎡</strong>
          </div>
        `
          }
        },
        grid: { top: 80, left: 70, right: 70, bottom: 70 },
        xAxis: {
          name: '建筑面积（㎡）',
          type: 'value',
          min: 0,
          max: xAxisMax,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontWeight: 'bold' },
          axisLabel: { fontSize: 12 }
        },
        yAxis: {
          name: '月租金（元）',
          type: 'value',
          min: 0,
          max: yAxisMax,
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: { fontWeight: 'bold' },
          axisLabel: { fontSize: 12 }
        },
        series: [
          {
            type: 'scatter',
            data: data,
            symbolSize: 24,
            emphasis: { scale: 1.8 }
          },
          {
            name: '80元/㎡参考线',
            type: 'line',
            data: [[0, 0], [xAxisMax, xAxisMax * 80]],
            symbol: 'none',
            lineStyle: { color: '#e74c3c', width: 2.5, type: 'dashed' },
            tooltip: { show: false },
            markLine: {
              silent: false,
              label: { show: true, position: 'end', formatter: '80元/㎡ 性价比线' },
              lineStyle: { color: '#e74c3c', type: 'dashed', width: 2 }
            }
          }
        ]
      }
      myChart.setOption(option)
    },
    // 2. 雷达图
    initRadarChart () {
      const chartDom = this.$refs.radarChart
      if (!chartDom || this.compareData.length === 0) return
      const myChart = echarts.init(chartDom)
      this.charts.push(myChart)
      const indicator = [
        { name: '性价比', max: 100 },
        { name: '面积得分', max: 100 },
        { name: '楼层舒适', max: 100 },
        { name: '交通便利', max: 100 },
        { name: '装修程度', max: 100 }
      ]
      const seriesData = this.compareData.map(house => {
        const area = this.extractArea(house.area)
        const price = this.extractPrice(house.price)
        const areaScore = Math.min(100, area)
        const priceScore = Math.max(20, 100 - price / 100)
        const floorScore = /中楼层|低楼层/.test(house.floor) ? 95 : /高楼层/.test(house.floor) ? 70 : 50
        const trafficScore = /地铁|公交|交通便利/.test(house.address + house.tag) ? 95 : 65
        const decoScore = /精装|新装修|豪装|硬装/.test(house.description + house.tag) ? 95 : 65
        return {
          name: house.title.length > 7 ? house.title.slice(0, 7) + '…' : house.title,
          value: [priceScore, areaScore, floorScore, trafficScore, decoScore].map(Math.round)
        }
      })
      const option = {
        title: {
          text: '房源综合能力雷达图',
          left: 'center',
          top: 8,
          textStyle: { fontSize: 17, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `<strong>${params.name}</strong><br/>
                性价比：${params.value[0]}（租金越低越好）<br/>
                面积得分：${params.value[1]}（面积越大越好）<br/>
                楼层舒适：${params.value[2]}（中低楼层更佳）<br/>
                交通便利：${params.value[3]}（近地铁更高）<br/>
                装修程度：${params.value[4]}（精装更高）`
          }
        },
        radar: {
          indicator,
          radius: '62%',
          name: { textStyle: { color: '#333', fontSize: 13 } },
          splitNumber: 5
        },
        series: [{
          type: 'radar',
          data: seriesData,
          symbol: 'circle',
          symbolSize: 8,
          areaStyle: { opacity: 0.15 },
          lineStyle: { width: 3 },
          emphasis: {
            areaStyle: { opacity: 0.3 }
          }
        }]
      }
      myChart.setOption(option)
    },
    // 3. 柱状图
    initBarChart () {
      const chartDom = this.$refs.barChart
      if (!chartDom) return
      const myChart = echarts.init(chartDom)
      this.charts.push(myChart)
      const names = this.compareData.map(h => h.title.length > 10 ? h.title.substr(0, 10) + '...' : h.title)
      const prices = this.compareData.map(h => this.extractPrice(h.price))
      const areas = this.compareData.map(h => this.extractArea(h.area))
      const option = {
        title: { text: '租金与面积对比', left: 'center', top: 10 },
        tooltip: { trigger: 'axis' },
        legend: { top: 30 },
        grid: { top: 80, bottom: 70, left: 60, right: 80 },
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: { interval: 0, rotate: 25 }
        },
        yAxis: [
          {
            type: 'value',
            name: '月租金 (元)',
            position: 'left',
            axisLine: { show: true, lineStyle: { color: '#ff7675' } }
          },
          {
            type: 'value',
            name: '面积 (㎡)',
            position: 'right',
            axisLine: { show: true, lineStyle: { color: '#74b9ff' } }
          }
        ],
        series: [
          {
            name: '月租金',
            type: 'bar',
            data: prices,
            itemStyle: { color: '#ff7675' },
            barWidth: '20%'
          },
          {
            name: '面积',
            type: 'bar',
            yAxisIndex: 1,
            data: areas,
            itemStyle: { color: '#74b9ff' },
            barWidth: '20%'
          }
        ]
      }
      myChart.setOption(option)
    }
  }
}
</script>

<template>
  <div class="property-comparison">
    <div class="selection-area">
      <el-select
        v-model="selectedHouses"
        multiple
        filterable
        clearable
        placeholder="从心愿单选择房源进行对比（可多选）"
        style="flex: 1;"
      >
        <el-option
          v-for="item in houseOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button type="primary" @click="addToCompare">添加对比</el-button>
      <el-button @click="clearCompare">清除所有</el-button>
    </div>
    <!-- 对比视图 -->
    <el-tabs v-model="viewTab" class="compare-tabs">
      <!-- 表格对比 -->
      <el-tab-pane label="表格对比" name="table">
        <el-table
          v-if="compareData.length"
          :data="compareData"
          border
          stripe
          style="width: 100%; margin-top: 10px;"
        >
          <el-table-column prop="title" label="房源标题" width="300" fixed/>
          <el-table-column prop="price" label="租金" width="120"/>
          <el-table-column prop="layout" label="户型" width="120"/>
          <el-table-column prop="area" label="面积" width="100"/>
          <el-table-column prop="floor" label="楼层" width="140"/>
          <el-table-column prop="building" label="楼盘" width="180"/>
          <el-table-column prop="address" label="地址" min-width="220"/>
          <el-table-column prop="tag" label="标签" width="100"/>
          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="removeItem(scope.$index)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无对比房源，请从上方选择添加"/>
      </el-tab-pane>
      <!-- 卡片对比 -->
      <el-tab-pane label="卡片对比" name="card">
        <div class="card-view" v-if="compareData.length">
          <el-card
            v-for="(house, index) in compareData"
            :key="house.id"
            class="compare-card"
          >
            <div class="card-header">
              <img v-if="house.pic_link" :src="house.pic_link" alt="房源图片" class="house-img"/>
              <div class="tag" v-if="house.tag">{{ house.tag }}</div>
            </div>
            <h3>{{ house.title }}</h3>
            <p><strong>租金：</strong>{{ house.price }}</p>
            <p><strong>户型：</strong>{{ house.layout }}</p>
            <p><strong>面积：</strong>{{ house.area }}</p>
            <p><strong>楼层：</strong>{{ house.floor }}</p>
            <p><strong>楼盘：</strong>{{ house.building }}</p>
            <p><strong>地址：</strong>{{ house.address }}</p>
            <p><strong>描述：</strong>{{ house.description }}</p>
            <el-button size="small" type="danger" @click="removeItem(index)" style="margin-top: 10px;">
              移除对比
            </el-button>
          </el-card>
        </div>
        <el-empty v-else description="暂无对比房源"/>
      </el-tab-pane>
      <!-- 图表对比 -->
      <el-tab-pane label="图表对比" name="chart">
        <div class="chart-wrapper" v-if="compareData.length === 0">
          <el-empty
            description="暂无对比房源"
            :image-size="200"
            style="padding: 80px 0;">
            <p style="color: #999; margin-top: 20px;">
              请从上方「心愿单」中选择房源添加到对比后查看图表分析
            </p>
          </el-empty>
        </div>
        <div class="chart-wrapper" v-else>
          <el-row :gutter="20" style="margin: -10px;">
            <!-- 性价比散点图 -->
            <el-col :span="24" :lg="12" style="margin-bottom: 20px;">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="card-title">
                  <span>性价比分析（面积 vs 租金）</span>
                </div>
                <div ref="scatterChart" class="echart"></div>
              </el-card>
            </el-col>
            <!-- 综合雷达图 -->
            <el-col :span="24" :lg="12" style="margin-bottom: 20px;">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="card-title">
                  <span>综合能力雷达图</span>
                </div>
                <div ref="radarChart" class="echart"></div>
                <div style="padding: 12px 16px; color: #666; font-size: 13px; line-height: 1.6; background: #f9f9f9; border-radius: 8px;">
                  评分规则：性价比=100-租金/100，面积得分=实际面积（封顶100），楼层舒适中低楼层最高，交通便利含“地铁”关键词更高
                </div>
              </el-card>
            </el-col>
            <!-- 柱状图对比 -->
            <el-col :span="24">
              <el-card shadow="hover" class="chart-card">
                <div slot="header" class="card-title">
                  <span>租金与面积并排对比</span>
                </div>
                <div ref="barChart" class="echart" style="height: 500px;"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- 底部操作 -->
    <div class="actions" v-if="compareData.length">
      <el-button type="primary" @click="exportReport">导出对比报告</el-button>
      <el-button @click="saveCompare">保存对比方案</el-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.property-comparison {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-sizing: border-box;
  overflow-y: auto;
}

.selection-area {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
}

.compare-tabs {
  .card-view {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px 0;

    .compare-card {
      width: calc(33.33% - 20px);
      min-width: 320px;
      box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(255, 208, 75, 0.4);
      }

      .card-header {
        position: relative;

        .house-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px 8px 0 0;
        }

        .tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #42b883;
          color: #fff;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
      }

      h3 {
        color: #2c3e50;
        margin: 15px 0 10px;
        font-size: 16px;
      }

      p {
        margin: 6px 0;
        color: #555;
        font-size: 14px;
      }
    }
  }

  .chart-wrapper {
    padding: 10px 0;

    .chart-card {
      height: 100%;
      min-height: 586px;
      border-radius: 12px;
      overflow: hidden;

      .card-title {
        font-weight: bold;
        font-size: 16px;
        color: #2c3e50;
        padding: 0 10px;
      }

      .echart {
        width: 100%;
        height: 420px !important;
      }
    }
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
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

@media (max-width: 768px) {
  .selection-area {
    flex-direction: column;
    align-items: stretch;
  }

  .card-view .compare-card {
    width: 100%;
    min-width: unset;
  }
}
</style>
