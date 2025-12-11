<script>
import axios from 'axios'

export default {
  name: 'BaiduMap',
  data () {
    return {
      map: null,
      view: null,
      layer: null,
      clusterlayer: null,
      center: [106.5778767, 29.5587398]
    }
  },
  mounted () {
    this.initMap()
  },
  beforeDestroy () {
    if (this.layer) {
      this.layer.destroy()
    }
    if (this.clusterlayer) {
      this.clusterlayer.destroy()
    }
    if (this.view) {
      this.view.destroy()
    }
    if (this.map) {
      this.map.destroy()
    }
  },
  methods: {
    initMap () {
      BMapGL.coordType = 'bd09'
      this.map = new BMapGL.Map('map', {
        enableRotate: true,
        enableTilt: true
      })
      const point = new BMapGL.Point(106.5778767, 29.5587398)
      this.map.centerAndZoom(point, 16)
      this.map.setTilt(45)
      this.map.enableScrollWheelZoom()
      this.view = new mapvgl.View({
        map: this.map,
        events: { click: true }
      })
      // this.initGLMap()
      this.initCluster()
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
          0.0: 'rgb(228,154,183)',
          0.2: 'rgb(214,121,160)',
          0.4: 'rgb(218,79,131)',
          0.6: 'rgba(214,7,92,0.8)',
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
    async initGLMap () {
      const res = await axios.get('http://146.56.245.149:3000/buildings.geojson')
      const features = res.data.features
      const formattedData = this.formatData3D(features)
      this.layer = new mapvgl.ShapeLayer({
        color: ({ properties }) => properties.color,
        style: 'normal',
        enablePicked: true,
        selectedColor: 'rgba(255, 208, 75, 0.9)',
        autoSelect: true,
        riseTime: 800,
        onClick: (e) => {
          console.log(e)
        }
      })
      this.view.addLayer(this.layer)
      this.layer.setData(formattedData)
    },
    formatData2D (features) {
      return features.map(feature => ({
        geometry: {
          type: 'Point',
          coordinates: [feature.longitude, feature.latitude]
        },
        properties: {
          id: feature.uid || feature.id || feature._id || Date.now(),
          feature: feature,
          color: 'rgba(255, 208, 75, 0.9)'
        }
      }))
    },
    formatData3D (features) {
      return features.map(feature => ({
        geometry: {
          type: 'Polygon',
          coordinates: [feature.geometry.coordinates[0][0].map(coord => [
            coord[0],
            coord[1]
          ])]
        },
        properties: {
          height: feature.properties.height,
          color: 'rgba(200, 200, 255, 0.9)'
        }
      }))
    }
  }
}
</script>

<template>
  <div id="map" ref="map"></div>
</template>

<style scoped lang="less">
#map {
  width: 100%;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
}
</style>
