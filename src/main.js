import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Element from 'element-ui'
import * as mapvthree from '@baidumap/mapv-three'

Vue.use(Element)
Vue.config.productionTip = false
Vue.prototype.$mapvthree = mapvthree
window.MAPV_BASE_URL = '/mapvthree'
console.log('MAPV_BASE_URL 配置:', window.MAPV_BASE_URL)
mapvthree.BaiduMapConfig.ak = 'Xeg4bBEw1i7zxUxefj6gwbb4qJZxDkWG'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
