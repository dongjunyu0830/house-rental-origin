import Vue from 'vue'
import VueRouter from 'vue-router'
import PropertyIllustration from '@/views/router/PropertyIllustration.vue'
import RealsceneAnalysis from '@/views/router/RealsceneAnalysis.vue'
import ThermalComparison from '@/views/router/ThermalComparison.vue'
import ExchangeSquare from '@/views/router/ExchangeSquare.vue'
import PropertyComparison from '@/views/router/PropertyComparison.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/PropertyIllustration'
  },
  {
    path: '/PropertyIllustration',
    component: PropertyIllustration,
    meta: { depth: 1 }
  },
  {
    path: '/RealsceneAnalysis',
    component: RealsceneAnalysis,
    meta: { depth: 2 }
  },
  {
    path: '/ThermalComparison',
    component: ThermalComparison,
    meta: { depth: 3 }
  },
  {
    path: '/ExchangeSquare',
    component: ExchangeSquare,
    meta: { depth: 4 }
  },
  {
    path: '/PropertyComparison',
    component: PropertyComparison,
    meta: { depth: 5 }
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
