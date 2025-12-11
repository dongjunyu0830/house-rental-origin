import Vue from 'vue'
import Vuex from 'vuex'
// import request from '@/api/request'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    wishList: [],
    center: [106.5778767, 29.5547398],
    BMAP_COORD_GCJ02: 'gcj02',
    houseDetail: [],
    parks: [],
    malls: [],
    hospitals: [],
    schools: []
  },
  getters: {
    getHouseDetail (state) {
      return state.houseDetail
    }
  },
  mutations: {
    SET_HOUSEDETAIL (state, data) {
      state.houseDetail = data
    },
    addToWishList (state, house) {
      if (!state.wishList.find(item => item.id === house.id)) {
        state.wishList.push(house)
      }
    },
    removeFromWishList (state, id) {
      state.wishList = state.wishList.filter(item => item.id !== id)
    }
  },
  actions: {
    async loadHouseData ({ commit }) {
      const res = await axios.get('/data/new_anjuke_yuzhong.json')
      commit('SET_HOUSEDETAIL', res.data)
    }
  },
  modules: {}
})
