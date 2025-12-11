<script>
import axios from 'axios'

export default {
  name: 'HeatPoint',
  props: {
    heatType: {
      type: String,
      default: 'comprehensive'
    }
  },
  data () {
    return {
      map: null,
      view: null,
      comprehensiveLayer: null,
      rawData: {
        house: [],
        subway: [],
        bus: [],
        hospital: [],
        park: [],
        school: []
      }
    }
  },
  watch: {
    heatType (newType) {
      this.updateHeatMap(newType)
    }
  },
  mounted () {
    this.initMap()
  },
  beforeDestroy () {
    if (this.map) {
      this.map.destroy()
    }
    if (this.view) {
      this.view.destroy()
    }
  },
  methods: {
    async initMap () {
      BMapGL.coordType = 'bd09'
      this.map = new BMapGL.Map(this.$el, {
        enableRotate: true,
        enableTilt: true
      })
      const point = new BMapGL.Point(106.5778767, 29.5587398)
      this.map.centerAndZoom(point, 15.5)
      this.map.setTilt(45)
      this.map.enableScrollWheelZoom()

      this.view = new mapvgl.View({
        effects: [new mapvgl.BloomEffect({
          threshold: 0.0,
          blurSize: 0.2
        })],
        map: this.map,
        events: { click: true }
      })
      const [house, subway, bus, hospital, park, school] = await Promise.all([
        axios.get('/data/new_anjuke_yuzhong.json'),
        axios.get('/data/POIS/chongqing_yuzhong_subway_stations.json'),
        axios.get('data/POIS/chongqing_yuzhong_bus_stations.json'),
        axios.get('data/POIS/chongqing_yuzhong_hospitals.json'),
        axios.get('data/POIS/chongqing_yuzhong_parks.json'),
        axios.get('data/POIS/chongqing_yuzhong_schools.json')
      ])

      this.rawData.house = this.formatData2D(house.data)
      this.rawData.subway = this.formatData2D(subway.data)
      this.rawData.bus = this.formatData2D(bus.data)
      this.rawData.hospital = this.formatData2D(hospital.data)
      this.rawData.park = this.formatData2D(park.data)
      this.rawData.school = this.formatData2D(school.data)

      this.comprehensiveLayer = new mapvgl.HeatGridLayer({
        gridSize: 60,
        max: 200,
        min: 0,
        maxHeight: 1000,
        minHeight: 200,
        riseTime: 1500,
        altitude: 0,
        opacity: 0.8,
        gradient: this.getGradient('comprehensive')
      })
      this.view.addLayer(this.comprehensiveLayer)
      this.updateHeatMap(this.heatType)
      await this.initCluster()
    },
    async initCluster () {
      const res = await axios.get('/data/new_anjuke_yuzhong.json')
      const cluster = res.data
      const formattedData = this.formatData2D(cluster)
      this.clusterlayer = new mapvgl.ClusterLayer({
        color: ({ properties }) => properties.color,
        showText: true,
        minSize: 30,
        maxSize: 60,
        clusterRadius: 100,
        maxZoom: 16,
        minZoom: 14,
        gradient: {
          0.0: 'rgb(218,79,131)',
          1.0: 'rgba(191,7,82,1)'
        },
        textOptions: {
          fontSize: 12,
          fontFamily: 'Microsoft Yahei',
          margin: [5, 5],
          color: 'white',
          format: function (num) {
            return num
          }
        },
        shape: 'circle',
        enablePicked: true,
        altitude: (item) => {
          const count = item.children ? item.children.length : 1
          return 400 + count * 10
        },
        onClick: (e) => {
          if (!e || e.dataIndex === undefined || e.dataIndex === -1) return
          const { dataItem } = e
          const map = this.map
          const isCluster = dataItem.children && Array.isArray(dataItem.children) && dataItem.children.length > 0
          if (isCluster) {
            const [lng, lat] = dataItem.geometry.coordinates
            const center = new BMapGL.Point(lng, lat)
            const targetZoom = Math.min(map.getZoom() + 3, 20)
            map.centerAndZoom(center, targetZoom)
            setTimeout(() => {
              const first = dataItem.children[0]
              if (first?.properties?.feature) {
                this.$emit('show-house-detail', dataItem.properties.feature)
              }
            }, 450)
            return
          }
          if (dataItem.properties?.feature) {
            this.$emit('show-house-detail', dataItem.properties.feature)
          }
        }
      })
      this.view.addLayer(this.clusterlayer)
      this.clusterlayer.setData(formattedData)
    },
    multiplyPoints (pointArray, weight = 1) {
      if (!pointArray || weight <= 0) return []
      const result = []
      for (let i = 0; i < weight; i++) {
        result.push(...pointArray)
      }
      return result
    },
    getCombinedData (type) {
      let points = []
      switch (type) {
        case 'comprehensive': // 综合便利度：全面平衡，交通+医疗+教育+休闲
          points = [
            ...this.multiplyPoints(this.rawData.subway, 7), // 地铁最高（通勤核心）
            ...this.multiplyPoints(this.rawData.hospital, 6), // 医疗次高
            ...this.multiplyPoints(this.rawData.school, 6), // 教育同等重要
            ...this.multiplyPoints(this.rawData.bus, 5), // 公交补充
            ...this.multiplyPoints(this.rawData.park, 4) // 公园休闲
          ]
          break
        case 'work': // 上班族：地铁通勤绝对优先，其他弱化
          points = [
            ...this.multiplyPoints(this.rawData.subway, 18),
            ...this.multiplyPoints(this.rawData.bus, 4)
          ]
          break

        case 'home': // 家庭模式：医疗 + 学校 + 公园（孩子教育与活动）
          points = [
            ...this.multiplyPoints(this.rawData.hospital, 12),
            ...this.multiplyPoints(this.rawData.school, 12),
            ...this.multiplyPoints(this.rawData.park, 8),
            ...this.multiplyPoints(this.rawData.bus, 5)
          ]
          break

        case 'young': // 年轻人：公交灵活 + 公园休闲娱乐
          points = [
            ...this.multiplyPoints(this.rawData.bus, 12),
            ...this.multiplyPoints(this.rawData.park, 12),
            ...this.multiplyPoints(this.rawData.subway, 6)
          ]
          break

        case 'elder': // 养老模式：医院 > 公园（散步、活动） > 地面公交
          points = [
            ...this.multiplyPoints(this.rawData.hospital, 15),
            ...this.multiplyPoints(this.rawData.park, 12),
            ...this.multiplyPoints(this.rawData.bus, 8),
            ...this.multiplyPoints(this.rawData.school, 2), // 学校需求低
            ...this.multiplyPoints(this.rawData.subway, 2) // 地铁台阶多，不友好
          ]
          break

        case 'daylight': // 工作日白天：通勤 + 上学
          points = [
            ...this.multiplyPoints(this.rawData.subway, 12),
            ...this.multiplyPoints(this.rawData.bus, 10),
            ...this.multiplyPoints(this.rawData.school, 8)
          ]
          break
        case 'daynight': // 工作日晚间：夜间活动 + 公园夜景 + 急诊
          points = [
            ...this.multiplyPoints(this.rawData.park, 12),
            ...this.multiplyPoints(this.rawData.hospital, 10),
            ...this.multiplyPoints(this.rawData.bus, 10)
          ]
          break
        case 'weekend': // 周末全天：休闲为主，公园 + 学校活动减少
          points = [
            ...this.multiplyPoints(this.rawData.park, 15),
            ...this.multiplyPoints(this.rawData.bus, 10),
            ...this.multiplyPoints(this.rawData.subway, 8),
            ...this.multiplyPoints(this.rawData.hospital, 4)
          ]
          break
        case 'holiday': // 节假日：公园出行爆棚，交通高负荷
          points = [
            ...this.multiplyPoints(this.rawData.park, 18),
            ...this.multiplyPoints(this.rawData.subway, 12),
            ...this.multiplyPoints(this.rawData.bus, 12)
          ]
          break
        case 'convenience': // 高便利度区域：所有设施都发达，权重均衡高
          points = [
            ...this.multiplyPoints(this.rawData.subway, 12),
            ...this.multiplyPoints(this.rawData.bus, 10),
            ...this.multiplyPoints(this.rawData.hospital, 12),
            ...this.multiplyPoints(this.rawData.school, 12),
            ...this.multiplyPoints(this.rawData.park, 10)
          ]
          break
        case 'cost-performance': // 性价比区域：公交 + 公园 + 学校发达（生活成本低），地铁和顶级医院少
          points = [
            ...this.multiplyPoints(this.rawData.bus, 14),
            ...this.multiplyPoints(this.rawData.park, 12),
            ...this.multiplyPoints(this.rawData.school, 10),
            ...this.multiplyPoints(this.rawData.hospital, 6),
            ...this.multiplyPoints(this.rawData.subway, 3)
          ]
          break
        case 'potential': // 潜力区域：地铁规划 + 学校 + 公园
          points = [
            ...this.multiplyPoints(this.rawData.subway, 16),
            ...this.multiplyPoints(this.rawData.school, 10),
            ...this.multiplyPoints(this.rawData.park, 10),
            ...this.multiplyPoints(this.rawData.bus, 6)
          ]
          break
        default:
          points = this.getCombinedData('comprehensive')
      }
      return points
    },
    getGradient (type) {
      const gradients = {
        comprehensive: { // 青绿色（综合便利）
          0.0: 'rgb(32, 178, 170)',
          1.0: 'rgb(0, 100, 100)'
        },
        work: { // 橙红（上班通勤，活力感）
          0.0: 'rgb(255, 90, 30)',
          1.0: 'rgb(165, 20, 130)'
        },
        home: { // 蓝紫（家庭医疗，安心感）
          0.0: 'rgb(30, 180, 255)',
          1.0: 'rgb(40, 40, 160)'
        },
        young: { // 黄橙（年轻人，活力明亮）
          0.0: 'rgb(255, 245, 180)',
          1.0: 'rgb(255, 120, 20)'
        },
        elder: { // 养老模式：柔和绿（健康、自然、宁静）
          0.0: 'rgb(100, 220, 100)',
          1.0: 'rgb(0, 120, 0)'
        },
        daylight: { // 工作日白天：明亮黄（阳光、活跃）
          0.0: 'rgb(255, 240, 100)',
          1.0: 'rgb(200, 150, 0)'
        },
        daynight: { // 工作日晚间：深蓝紫（夜生活、低调）
          0.0: 'rgb(80, 80, 220)',
          1.0: 'rgb(40, 40, 140)'
        },
        weekend: { // 周末全天：暖橙（休闲、放松）
          0.0: 'rgb(255, 160, 80)',
          1.0: 'rgb(200, 80, 0)'
        },
        holiday: { // 节假日：喜庆红（热闹、节日感）
          0.0: 'rgb(255, 80, 80)',
          1.0: 'rgb(180, 0, 0)'
        },
        convenience: { // 高便利度区域：金黄（高端、贵）
          0.0: 'rgb(255, 220, 100)',
          1.0: 'rgb(200, 140, 0)'
        },
        'cost-performance': { // 性价比区域：亮绿（价值高、划算）
          0.0: 'rgb(150, 255, 80)',
          1.0: 'rgb(60, 180, 0)'
        },
        potential: { // 潜力区域：紫粉（未来发展、潜力）
          0.0: 'rgb(180, 120, 255)',
          1.0: 'rgb(100, 40, 180)'
        }
      }
      return gradients[type] || gradients.comprehensive
    },
    updateHeatMap (type) {
      if (!this.comprehensiveLayer) return
      const data = this.getCombinedData(type)
      this.comprehensiveLayer.setData(data)
      const estimatedMax = data.length > 0 ? Math.ceil(data.length / 40) : 100
      this.comprehensiveLayer.setOptions({
        max: estimatedMax < 50 ? 100 : estimatedMax,
        gradient: this.getGradient(type)
      })
    },
    formatData2D (features) {
      return features.map(feature => ({
        geometry: {
          type: 'Point',
          coordinates: [feature.longitude, feature.latitude]
        },
        properties: {
          id: feature.uid || feature.id || feature._id || Date.now(),
          feature: feature
        }
      }))
    }
  }
}
</script>

<template>
  <div style="width: 100%; height: 100%;"></div>
</template>

<style scoped lang="less">
div {
  width: 100%;
  height: 100%;
}
</style>
