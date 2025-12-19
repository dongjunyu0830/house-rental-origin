import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Element from 'element-ui'

Vue.use(Element)
Vue.config.productionTip = false
window.MAPV_BASE_URL = '/mapvthree'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
