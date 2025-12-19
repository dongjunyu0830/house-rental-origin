import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Element from 'element-ui'

Vue.use(Element)
Vue.config.productionTip = false
window.MAPV_BASE_URL = '/mapvthree'
console.log('MAPV_BASE_URL 配置:', window.MAPV_BASE_URL)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
