<script>
/* eslint-disable */
import axios from 'axios'

export default {
  name: 'AnalysisIndex',
  data () {
    return {
      map: null,
      view: null,
      layer: {
        parks: null,
        malls: null,
        hospitals: null,
        schools: null,
        houses: null
      },
      // 路径规划相关
      driving: null,
      routes: {
        driving: null,
        transit: null,
        walking: null
      },
      markers: {
        start: null,
        end: null
      },
      overlays: [],
      routeInfos: [],
      // 等时圈相关
      isochronePolygons: [], // 保存等时圈多边形
      isochroneCenter: null, // 当前中心点 BMapGL.Point
      timeThresholds: [300, 600, 900, 1200, 1800], // 5/10/15/20/30分钟（秒）
      thresholdColors: ['#ff4d4f', '#ffa940', '#ffdb5c', '#4caf50', '#2196f3'],
      drivingInstance: null, // 独立的DrivingRoute实例
      currentFacilityType: '', // 保存当前选择的设施类型
      isDrawingIsochrone: false,
      facilityDataReady: false
    }
  },
  props: {
    checkboxGroup: {
      type: Array,
      default: () => []
    },
    origin: {
      type: String,
      default: ''
    },
    destination: {
      type: String,
      default: ''
    },
    selectMode: {
      type: String,
      default: ''
    },
    chooseLayer: {
      type: String,
      default: ''
    },
    planningMethods: {
      type: Array,
      default: () => ['驾车']
    }
  },
  mounted () {
    this.createAllLayers()
    this.initMap()
  },
  beforeDestroy () {
  },
  watch: {
    checkboxGroup: {
      handler () {
        this.updateLayerVisibility()
      },
      deep: true,
      immediate: true
    },
    selectMode: {
      handler (newVal) {
        if (!this.map) return
        if (newVal !== '') {
          this.map.addEventListener('click', this.handleMapClick)
        } else {
          this.map.removeEventListener('click', this.handleMapClick)
        }
      },
      immediate: true
    }
  },
  methods: {
    initMap () {
      this.map = new BMapGL.Map('map', {
        enableRotate: true,
        enableTilt: true
      })
      const point = new BMapGL.Point(106.5778767, 29.5587398)
      this.map.centerAndZoom(point, 15.5)
      this.map.enableScrollWheelZoom()
      this.view = new mapvgl.View({
        map: this.map,
        events: { click: true }
      })
      // 驾车
      this.routes.driving = new BMapGL.DrivingRoute(this.map, {
        renderOptions: { map: null },
        onSearchComplete: (results) => {
          if (results && results.getPlan(0)) {
            const plan = results.getPlan(0)
            const route = plan.getRoute(0)
            const pts = route.getPath()
            const polyline = new BMapGL.Polyline(pts, {
              strokeColor: '#e74c3c',
              strokeWeight: 6,
              strokeOpacity: 0.8
            })
            this.map.addOverlay(polyline)
            this.overlays.push(polyline)
            const distance = plan.getDistance(true)
            const duration = plan.getDuration(true)
            this.addRouteInfo('驾车', distance, duration)
          }
        }
      })
      // 公共交通
      this.routes.transit = new BMapGL.TransitRoute(this.map, {
        renderOptions: { map: null },
        onSearchComplete: (results) => {
          if (results && results.getNumPlans() > 0) {
            const plan = results.getPlan(0)
            let allPts = []
            for (let j = 0; j < plan.getNumLines(); j++) {
              const line = plan.getLine(j)
              if (line.getPath) {
                allPts = allPts.concat(line.getPath())
              }
            }
            if (allPts.length > 0) {
              const polyline = new BMapGL.Polyline(allPts, {
                strokeColor: '#3498db',
                strokeWeight: 6,
                strokeOpacity: 0.8
              })
              this.map.addOverlay(polyline)
              this.overlays.push(polyline)
            }
            const distance = plan.getDistance(true) || '未知'
            const duration = plan.getDuration(true) || '未知'
            this.addRouteInfo('公共交通', distance, duration)
          }
        }
      })
      // 步行
      this.routes.walking = new BMapGL.WalkingRoute(this.map, {
        renderOptions: { map: null },
        onSearchComplete: (results) => {
          if (results && results.getPlan(0)) {
            const plan = results.getPlan(0)
            const route = plan.getRoute(0)
            const pts = route.getPath()
            const polyline = new BMapGL.Polyline(pts, {
              strokeColor: '#27ae60',
              strokeWeight: 6,
              strokeOpacity: 0.8
            })
            this.map.addOverlay(polyline)
            this.overlays.push(polyline)

            const distance = plan.getDistance(true)
            const duration = plan.getDuration(true)
            this.addRouteInfo('步行', distance, duration)
          }
        }
      })
      this.loadPOIS()
    },
    createAllLayers() {
      // 提前创建所有设施图层
      this.layer.parks = new mapvgl.PointLayer({
        size: 10,
        color: 'rgb(24,177,78)',
        blend: 'lighter',
        style: 'normal',
        enablePicked: true,
        autoSelect: true,
        riseTime: 800,
        onClick: (e) => {
          console.log(e)
        }
      })// 公园
      this.layer.malls = new mapvgl.PointLayer({
        size: 10,
        color: 'rgb(241,157,0)',
        blend: 'lighter',
        style: 'normal',
        enablePicked: true,
        autoSelect: true,
        riseTime: 800,
        onClick: (e) => {
          console.log(e)
        }
      })// 商场
      this.layer.hospitals = new mapvgl.PointLayer({
        size: 10,
        color: 'rgb(14,123,168)',
        blend: 'lighter',
        style: 'normal',
        enablePicked: true,
        autoSelect: true,
        riseTime: 800,
        onClick: (e) => {
          console.log(e)
        }
      })// 医院
      this.layer.schools = new mapvgl.PointLayer({
        size: 10,
        color: 'rgb(220,45,7)',
        blend: 'lighter',
        style: 'normal',
        enablePicked: true,
        autoSelect: true,
        riseTime: 800,
        onClick: (e) => {
          console.log(e)
        }
      })// 学校
      this.layer.houses = new mapvgl.PointLayer({
        size: 10,
        color: 'rgb(220,86,140)',
        blend: 'lighter',
        style: 'normal',
        enablePicked: true,
        autoSelect: true,
        riseTime: 800,
        onClick: (e) => {
          if (!e || e.dataIndex === undefined || e.dataIndex === -1) return
          const { dataItem } = e
          setTimeout(() => {
            if (dataItem.properties?.feature) {
              this.$emit('show-house-detail', dataItem.properties.feature)
            }
          }, 300)
        }
      })// 房源
      // 提前加入 view
      this.view?.addLayer?.(this.layer.parks)
      this.view?.addLayer?.(this.layer.malls)
      this.view?.addLayer?.(this.layer.hospitals)
      this.view?.addLayer?.(this.layer.schools)
      this.view?.addLayer?.(this.layer.houses)
    },
    drawRoutes (origin, destination, methods) {
      if (!origin || !destination) {
        this.$message.warning('请设置起点和终点')
        return
      }
      if (!methods || methods.length === 0) {
        this.$message.warning('请选择出行方式')
        return
      }
      this.clearAllRoutes()
      const [startLat, startLng] = origin.split(',').map(Number)
      const [endLat, endLng] = destination.split(',').map(Number)
      const start = new BMapGL.Point(startLng, startLat)
      const end = new BMapGL.Point(endLng, endLat)
      methods.forEach(method => {
        if (method === '驾车') this.routes.driving.search(start, end)
        if (method === '公共交通') this.routes.transit.search(start, end)
        if (method === '步行') this.routes.walking.search(start, end)
      })
      this.map.setViewport([start, end])
    },
    // 添加路径信息并通知父组件
    addRouteInfo (type, distance, duration) {
      this.routeInfos.push({
        type,
        distance,
        duration
      })
      this.$emit('route-info-update', this.routeInfos.slice())
    },
    // 清除所有
    clearAllRoutes () {
      this.overlays.forEach(overlay => this.map.removeOverlay(overlay))
      this.overlays = []
      this.markers.start = null
      this.markers.end = null
      this.routeInfos = []
      this.$emit('route-info-update', [])
      Object.values(this.routes).forEach(r => r?.clearResults?.())
    },
    async loadPOIS () {
      const [parks, malls, hospitals, schools, house] = await Promise.all([
        axios.get('/data/POIS/chongqing_yuzhong_parks.json'),
        axios.get('/data/POIS/chongqing_yuzhong_malls.json'),
        axios.get('/data/POIS/chongqing_yuzhong_hospitals.json'),
        axios.get('/data/POIS/chongqing_yuzhong_schools.json'),
        axios.get('/data/new_anjuke_yuzhong.json')
      ])
      //
      const parkFormat = this.formatData2D(parks.data)
      const mallsFormat = this.formatData2D(malls.data)
      const hospitalsFormat = this.formatData2D(hospitals.data)
      const schoolsFormat = this.formatData2D(schools.data)
      const housesFormat = this.formatData2D(house.data)
      //
      this.layer.parks.setData(parkFormat)
      this.layer.malls.setData(mallsFormat)
      this.layer.hospitals.setData(hospitalsFormat)
      this.layer.schools.setData(schoolsFormat)
      this.layer.houses.setData(housesFormat)
      this.facilityDataReady = true
      this.updateLayerVisibility()
      this.$message.success('设施点数据加载完成')
    },
    formatData2D (features) {
      return features.map(feature => ({
        geometry: {
          type: 'Point',
          coordinates: [feature.longitude, feature.latitude]
        },
        properties: {
          feature: feature
        }
      }))
    },
    updateLayerVisibility () {
      if (!this.view || !this.checkboxGroup || !Array.isArray(this.checkboxGroup)) {
        return
      }
      const layersToControl = {
          '公园': this.layer.parks,
          '学校': this.layer.schools,
          '商场': this.layer.malls,
          '医院': this.layer.hospitals
        }
      ;['公园', '学校', '商场', '医院'].forEach(type => {
        const layer = layersToControl[type]
        if (!layer) return
        const shouldShow = this.checkboxGroup.includes(type)
        const isAdded = this.view.getAllLayers().includes(layer)
        if (shouldShow && !isAdded) {
          this.view.addLayer(layer)
        } else if (!shouldShow && isAdded) {
          this.view.removeLayer(layer)
        }
      })
      if (this.layer.houses && !this.view.getAllLayers().includes(this.layer.houses)) {
        this.view.addLayer(this.layer.houses)
      }
    },
    handleMapClick (e) {
      const mcLng = e.point.lng
      const mcLat = e.point.lat
      const convertor = new BMapGL.Convertor()
      const pointList = [new BMapGL.Point(mcLng, mcLat)]
      convertor.translate(pointList, 6, 5, (data) => {
        if (data.status === 0 && data.points && data.points.length > 0) {
          const point = data.points[0]
          const lng = point.lng
          const lat = point.lat
          const coord = `${lat.toFixed(6)},${lng.toFixed(6)}`
          if (this.selectMode === 'origin') {
            this.$emit('update:origin', coord)
          } else if (this.selectMode === 'destination') {
            this.$emit('update:destination', coord)
          } else if (this.selectMode === 'centerPoint') {
            this.$emit('update:centerPoint', coord)
          }
          this.$emit('update:selectMode', '')
        } else {
          console.error('坐标转换失败', data)
          this.$message.error('坐标转换失败，请重试')
        }
      })
    },
    // 带并发限制的任务队列处理器
    async runWithConcurrencyLimit(tasks, limit = 3) {
      const results = []
      const executing = []

      for (const task of tasks) {
        const p = task().then(res => {
          executing.splice(executing.indexOf(p), 1)
          return res
        })
        results.push(p)
        executing.push(p)

        if (executing.length >= limit) {
          await Promise.race(executing)
        }
      }
      return Promise.all(results)
    },
    // 父组件调用绘制等时圈
    drawIsochrone(centerCoord, facilityType) {
      const [lat, lng] = centerCoord.split(',').map(Number)
      this.isochroneCenter = new BMapGL.Point(lng, lat)
      this.currentFacilityType = facilityType
      this.calculateIsochrones()
    },
    // 清除等时圈
    clearIsochrones() {
      this.isochronePolygons.forEach(overlay => this.map.removeOverlay(overlay))
      this.isochronePolygons = []
    },
    // 主计算函数
    async calculateIsochrones() {
      if (this.isDrawingIsochrone) return
      this.isDrawingIsochrone = true
      this.$emit('isochrone-loading', true)
      try {
        if (!this.isochroneCenter || !this.currentFacilityType) {
          this.$message.warning('参数缺失，无法绘制等时圈')
          return
        }
        const layerMap = { '公园': this.layer.parks, '学校': this.layer.schools, '商场': this.layer.malls, '医院': this.layer.hospitals }
        const targetLayer = layerMap[this.currentFacilityType]
        if (!targetLayer || !targetLayer.getData?.()?.length) {
          this.$message.warning('数据加载中，请稍后重试...')
          return
        }
        const data = targetLayer.getData()
        const facilities = data
          .map(item => {
            const lng = item.geometry?.coordinates?.[0]
            const lat = item.geometry?.coordinates?.[1]
            return (typeof lng === 'number' && typeof lat === 'number') ? { lng, lat } : null
          })
          .filter(Boolean)
        if (facilities.length < 3) {
          this.$message.warning('有效设施点不足3个，无法生成等时圈')
          return
        }
        this.clearIsochrones()
        this.drivingInstance = new BMapGL.DrivingRoute(this.map, {
          renderOptions: { autoViewport: false }
        })
        const boundaryGroups = this.timeThresholds.map(() => [])
        const tasks = facilities.map(fac => {
          const endPoint = new BMapGL.Point(fac.lng, fac.lat)
          return async () => {
            let result = null
            for (let i = 0; i < 3; i++) {
              result = await this.searchDrivingRoute(this.isochroneCenter, endPoint)
              if (result && result.getPlan(0)) break
              if (i < 2) await new Promise(r => setTimeout(r, 300 * (i + 1))) // 渐进式等待
            }
            if (!result || !result.getPlan(0)) return null
            const plan = result.getPlan(0)
            const route = plan.getRoute(0)
            if (!route?.getPath?.()?.length) return null
            const totalSeconds = plan.getDuration(false) || 999999
            this.timeThresholds.forEach((threshold, idx) => {
              if (totalSeconds <= threshold) {
                boundaryGroups[idx].push(endPoint)
              } else if (idx > 0 && totalSeconds > this.timeThresholds[idx - 1]) {
                const ratio = this.timeThresholds[idx - 1] / totalSeconds
                const interpolated = this.interpolateOnRoute(route, ratio, totalSeconds)
                if (interpolated) boundaryGroups[idx].push(interpolated)
              }
            })
          }
        })
        await this.runWithConcurrencyLimit(tasks, 3)
        boundaryGroups.reverse().forEach((points, reverseIdx) => {
          const idx = boundaryGroups.length - 1 - reverseIdx
          const validPoints = points.filter(p => p && typeof p.lng === 'number' && typeof p.lat === 'number')
          if (validPoints.length < 3) return
          const hull = this.computeConvexHull(validPoints)
          if (hull.length < 3) return
          const polygon = new BMapGL.Polygon(hull, {
            strokeColor: this.thresholdColors[idx],
            fillColor: this.thresholdColors[idx],
            fillOpacity: 0.15 + idx * 0.05,
            strokeWeight: 3,
            strokeOpacity: 0.9
          })
          this.map.addOverlay(polygon)
          this.isochronePolygons.push(polygon)
        })
        const centerMarker = new BMapGL.Marker(this.isochroneCenter, {
          icon: new BMapGL.Icon('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 1024 1024"><path fill="%23ff4d4f" d="M512 64C334.336 64 192 206.336 192 384c0 275.456 320 576 320 576s320-300.544 320-576C832 206.336 689.664 64 512 64z"/></svg>', new BMapGL.Size(30, 30))
        })
        this.map.addOverlay(centerMarker)
        this.isochronePolygons.push(centerMarker)

        const count = this.isochronePolygons.filter(o => o instanceof BMapGL.Polygon).length
        if (count > 0) {
          this.$message.success(`等时圈绘制完成！共 ${count} 层`)
          // 关键：通知父组件显示图例信息
          this.$emit('isochrone-complete', count)
        } else {
          this.$message.info('未生成有效等时圈，可能设施点太远或不可达')
          this.$emit('isochrone-complete', 0)
        }
      } catch (err) {
        console.error(err)
        this.$message.error('绘制等时圈失败，请重试')
      } finally {
        this.isDrawingIsochrone = false
        this.$emit('isochrone-loading', false)
      }
    },
    // 封装搜索
    searchDrivingRoute (start, end) {
      return new Promise(resolve => {
        let resolved = false
        const handler = (results) => {
          if (!resolved) {
            resolved = true
            if (this.drivingInstance.getStatus() === 0) {
              resolve(results)
            } else {
              resolve(null)
            }
          }
        }
        this.drivingInstance.setSearchCompleteCallback(handler)
        this.drivingInstance.search(start, end)
        // 超时保护 8秒
        setTimeout(() => {
          if (!resolved) {
            resolved = true
            resolve(null)
          }
        }, 8000)
      })
    },
    // 时间比例插值点
    interpolateOnRoute (route, ratio, totalSeconds) {
      const path = route.getPath()
      if (!path || path.length < 2) return null
      const targetTime = totalSeconds * ratio
      let accumulated = 0
      for (let i = 1; i < path.length; i++) {
        const p1 = path[i - 1]
        const p2 = path[i]
        const dist = this.map.getDistance(p1, p2)
        if (dist <= 0) continue
        const segTime = dist / 8.33  // m/s
        if (accumulated + segTime >= targetTime) {
          const r = (targetTime - accumulated) / segTime
          return new BMapGL.Point(
            p1.lng + (p2.lng - p1.lng) * r,
            p1.lat + (p2.lat - p1.lat) * r
          )
        }
        accumulated += segTime
      }
      const last = path[path.length - 1]
      return last ? new BMapGL.Point(last.lng, last.lat) : null
    },
    // 凸包算法（Graham Scan）
    computeConvexHull (points) {
      // 严格过滤无效点
      const validPoints = points.filter(p => p && typeof p.lng === 'number' && typeof p.lat === 'number')
      if (validPoints.length < 3) return validPoints
      let pts = validPoints.slice()
      let minIdx = 0
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].lat < pts[minIdx].lat || (pts[i].lat === pts[minIdx].lat && pts[i].lng < pts[minIdx].lng)) {
          minIdx = i
        }
      }
      const start = pts[minIdx]
      pts.splice(minIdx, 1)
      pts.sort((a, b) => {
        const angleA = Math.atan2(a.lat - start.lat, a.lng - start.lng)
        const angleB = Math.atan2(b.lat - start.lat, b.lng - start.lng)
        if (angleA !== angleB) return angleA - angleB
        // 距离排序，防止共线点干扰
        const distA = (a.lng - start.lng) ** 2 + (a.lat - start.lat) ** 2
        const distB = (b.lng - start.lng) ** 2 + (b.lat - start.lat) ** 2
        return distA - distB
      })
      pts.unshift(start)
      const hull = [pts[0]]
      for (let i = 1; i < pts.length; i++) {
        while (hull.length >= 2 &&
        this.crossProduct(hull[hull.length - 2], hull[hull.length - 1], pts[i]) <= 0) {
          hull.pop()
        }
        hull.push(pts[i])
      }
      return hull
    },
    crossProduct (o, a, b) {
      if (!o || !a || !b) return 0
      return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng)
    }
  }
}
</script>

<template>
  <div id="map" ref="map" :class="{ 'selecting-point': selectMode !== '' }"></div>
</template>

<style scoped lang="less">
#map {
  width: 100%;
  height: 100%;
  cursor: default !important;

  &.selecting-point {
    cursor: crosshair !important;
  }
}
</style>
