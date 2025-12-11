<script>
/* eslint-disable */
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import 'ol/ol.css'
import { OSM, XYZ, Cluster } from 'ol/source'
import VectorSource from 'ol/source/Vector'
import { GeoJSON } from 'ol/format'
import VectorLayer from 'ol/layer/Vector'
import TileLayer from 'ol/layer/Tile'
import { fromLonLat } from 'ol/proj'
import { Fill, Stroke, Style, Text } from 'ol/style'
import { Feature, Overlay } from 'ol'
import { Point, Polygon } from 'ol/geom'
import CircleStyle from 'ol/style/Circle'
import HouseDetail from '@/components/HouseDetail/index.vue'
import Vue from 'vue'

export default {
  name: 'OpenlayersIndex',
  components: { HouseDetail },
  data () {
    return {
      center: [106.5778767, 29.5547398],
      popupElement: null, // 信息框DOM元素
      popupOverlay: null // 信息框覆盖层
    }
  },
  methods: {
    initMap () {
      this.loadLayers()
      this.view = new View({
        center: this.center,
        zoom: 15,
        maxZoom: 18,
        minZoom: 14,
        projection: 'EPSG:4326'
      })

      this.initPopup()

      this.clusterLayer.setVisible(false)
      this.map = new Map({
        target: 'map',
        layers: [
          this.gaodeVectorLayer,
          this.gaodeLabelLayer,
          this.buildingslayer,
          this.clusterLayer
        ],
        view: this.view
      })

      this.addClickEvent()

      this.map.on('moveend', () => {
        const zoom = this.map.getView().getZoom()
        if (zoom < 16) {
          this.clusterLayer.setVisible(true)
          this.buildingslayer.setVisible(false)
        } else {
          this.clusterLayer.setVisible(false)
          this.buildingslayer.setVisible(true)
        }
      })
    },
    loadLayers () {
      this.gaodeVectorSource = new XYZ({
        url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        attributions: '© 高德地图',
        crossOrigin: 'anonymous'
      })

      this.gaodeLabelSource = new XYZ({
        url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        attributions: '© 高德地图',
        crossOrigin: 'anonymous'
      })
      this.houseDetailSource = new VectorSource({
        loader: (extent, resolution, projection) => {
          fetch('/data/anjuke_yuzhong.json')
            .then(response => response.json())
            .then(data => {
              const features = data.anjuke_yuzhong.map(item => {
                return new Feature({
                  geometry: new Point([
                    parseFloat(item.longitude),
                    parseFloat(item.latitude)
                  ]),
                  id: item.id,
                  title: item.title,
                  tag: item.tag,
                  room: item.room,
                  address: item.address,
                  building: item.building,
                  description: item.description,
                  contact: item.contact,
                  price: item.price,
                  unit: item.unit,
                  create_time: item.create_time
                })
              })
              this.houseDetailSource.addFeatures(features)
            })
            .catch(error => {
              console.error('加载数据失败:', error)
            })
        }
      })
      // 创建聚合源
      this.clusterSource = new Cluster({
        source: this.houseDetailSource, // 原始点数据源
        distance: 100, // 聚合距离（像素）
        minDistance: 20 // 最小聚合距离
      })
      this.gaodeVectorLayer = new TileLayer({
        source: this.gaodeVectorSource
      })
      this.gaodeLabelLayer = new TileLayer({
        source: this.gaodeLabelSource
      })
      this.buildingslayer = new VectorLayer({
        source: this.houseDetailSource,
        style: new Style({
          image: new CircleStyle({
            radius: 6, // 点的大小
            fill: new Fill({
              color: 'rgb(236,111,158)' // 填充颜色
            }),
            stroke: new Stroke({
              color: 'rgb(180,80,120)', // 边框颜色
              width: 2 // 边框宽度
            })
          })
        })
      })
      this.clusterLayer = new VectorLayer({
        source: this.clusterSource,
        style: this.clusterStyleFunction
      })
    },
    clusterStyleFunction (feature) {
      const size = feature.get('features').length
      const radius = Math.min(8 + Math.log(size) * 2, 20)
      let color = 'rgba(216,156,178,0.8)'

      if (size > 10) color = 'rgba(202,100,141,0.8)'
      if (size > 50) color = 'rgba(232,0,97,0.8)'

      return new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({ color: color }),
          stroke: new Stroke({
            color: 'white',
            width: 2
          })
        }),
        text: new Text({
          text: size > 1 ? size.toString() : '',
          fill: new Fill({ color: 'white' }),
          font: 'bold 12px sans-serif'
        })
      })
    },
    initPopup () {
      this.popupElement = document.createElement('div')
      this.popupElement.className = 'ol-popup'
      this.popupElement.style.backgroundColor = 'white'
      this.popupElement.style.border = "1px solid #f3f4fb"

      const contentElement = document.createElement('div')
      contentElement.className = 'ol-popup-content'

      this.popupElement.appendChild(contentElement)

      this.popupOverlay = new Overlay({
        element: this.popupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
      })
    },

    addClickEvent () {
      this.map.on('singleclick', (evt) => {
        this.popupOverlay.setPosition(undefined)

        const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          return feature
        })

        if (feature && feature.get('id')) {
          this.showHouseInfo(feature, evt.coordinate)
        }
      })
    },

    showHouseInfo (feature, coordinate) {
      const houseData = {
        title: feature.get('title') || '未知标题',
        price: feature.get('price') || '未知',
        unit: feature.get('unit') || '元/月',
        room: feature.get('room') || '未知',
        address: feature.get('address') || '未知',
        building: feature.get('building') || '未知',
        description: feature.get('description') || '无描述',
        contact: feature.get('contact') || '未知',
        create_time: feature.get('create_time') || '未知',
        tag: feature.get('tag') || ''
      }

      const HouseDetailComponent = Vue.extend(HouseDetail)
      const houseDetailInstance = new HouseDetailComponent({
        propsData: {
          feature: houseData
        }
      })

      houseDetailInstance.$mount()

      this.popupElement.querySelector('.ol-popup-content').innerHTML = ''
      this.popupElement.querySelector('.ol-popup-content').appendChild(houseDetailInstance.$el)

      this.popupOverlay.setPosition(coordinate)
    }
  },
  mounted () {
    this.initMap()
    if (this.map && this.popupOverlay) {
      this.map.addOverlay(this.popupOverlay)
    }
  },
  update () {
  }
}
</script>

<template>
  <div class="map" id="map">
  </div>
</template>

<style scoped lang="less">
#map {
  width: 100%;
  height: 100%;
}
</style>
