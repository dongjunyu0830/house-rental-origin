import Vue from 'vue'
import VueRouter from 'vue-router'
import PropertyIllustration from '@/views/router/PropertyIllustration.vue'
import RealsceneAnalysis from '@/views/router/RealsceneAnalysis.vue'
import ThermalComparison from '@/views/router/ThermalComparison.vue'
import ExchangeSquare from '@/views/router/ExchangeSquare.vue'
import PropertyComparison from '@/views/router/PropertyComparison.vue'
import FindNews from '@/views/router/FindNews/index.vue'
import PublishContent from '@/views/router/PublishContent/index.vue'
import PersonalHomepage from '@/views/router/PersonalHomepage/index.vue'

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
    children: [
      {
        path: '',
        redirect: 'FindNews'
      },
      {
        path: 'FindNews',
        name: 'FindNews',
        component: FindNews
      },
      {
        path: 'PublishContent',
        name: 'PublishContent',
        component: PublishContent
      },
      {
        path: 'PersonalHomepage',
        name: 'PersonalHomepage',
        component: PersonalHomepage
      }
    ],
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
