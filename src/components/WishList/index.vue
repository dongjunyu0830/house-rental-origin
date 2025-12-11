<script>
import { mapState, mapMutations } from 'vuex' // 假设 Vuex 有 wishList state 和 mutations

export default {
  name: 'WishList',
  computed: {
    ...mapState(['wishList']) // 假设 Vuex 有 wishList 数组，存储收藏房源对象
  },
  methods: {
    ...mapMutations(['removeFromWishList']), // 假设 mutation 移除
    locateHouse (house) {
      // 后期实现：切换地图视图至该房源（emit 事件或 Vuex action）
      this.$emit('locate', house) // 假设 parent 处理地图定位
    },
    contactPerson (contact) {
      // 后期实现：联系联系人（e.g., open dialog or tel: link）
      alert(`联系: ${contact}`) // 占位
    },
    removeHouse (id) {
      this.removeFromWishList(id) // 调用 mutation 移除
    }
  }
}
</script>

<template>
  <div class="wish-list" @click.stop>
    <h3 class="title">我的心愿单</h3>
    <el-empty v-if="!wishList.length" description="暂无收藏房源"/>
    <el-table v-else :data="wishList" border stripe>
      <el-table-column prop="title" label="房源名称" width="180"/>
      <el-table-column prop="contact" label="联系人" width="120"/>
      <el-table-column prop="price" label="租金 (元/月)"/>
      <el-table-column prop="room" label="房屋规格 (㎡)"/>
      <el-table-column label="操作" width="110" align="center">
        <template #default="scope">
          <div class="action-buttons">
            <el-button
              class="action-btn locate-btn"
              size="small" icon="el-icon-location"
              @click="locateHouse(scope.row)"
            ></el-button>
            <el-button
              class="action-btn contact-btn"
              size="small"
              icon="el-icon-phone"
              @click="contactPerson(scope.row.contact)"
            ></el-button>
            <el-button
              class="action-btn remove-btn"
              size="small"
              icon="el-icon-delete"
              @click="removeHouse(scope.row.id)"
            ></el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="less">
.wish-list {
  position: absolute;
  left: 0;
  top: 0;
  width: 60%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid #e8e8e8;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  z-index: 2;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;

  .title {
    color: #2c3e50;
    font-size: 18px;
    text-align: center;
    margin-bottom: 20px;
  }

  .el-table {
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;

      :deep(.el-button + .el-button) {
        margin-left: 0 !important;
      }
    }

    .action-buttons .action-btn {
      height: 32px;
      padding: 0 12px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: 16px;
      color: #2c3e50;
      background: #ffd04b;
      box-shadow: 0 2px 6px rgba(255, 208, 75, 0.4);
      transition: all 0.2s ease;

      &:hover {
        background: #ffc218;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(255, 208, 75, 0.6);
      }
    }
  }
}
</style>
