<script>
export default {
  name: 'HouseDetail',
  props: {
    feature: {
      type: Object,
      default: () => ({
        id: '',
        title: '',
        pic_link: '',
        price: '',
        unit: '元/月',
        room: '',
        address: '',
        building: '',
        description: '',
        contact: '',
        create_time: '',
        tag: ''
      })
    }
  },
  emits: ['clickOnDetail'],
  methods: {
    addClickEvent () {
      this.$emit('clickOnDetail', this.feature)
    }
  }
}
</script>

<template>
  <div class="main" @click="addClickEvent">
    <div class="picture">
      <img :src=this.feature.pic_link alt="">
    </div>
    <div class="main-content">
      <div class="title">
        <span>
          {{ feature.title }}
        </span>
      </div>
      <div class="location">
        <span>
          {{ feature.room + feature.building + feature.address }}
        </span>
      </div>
      <div class="description">
        <span>{{ feature.description }}</span>
      </div>
      <div class="contact">
        <i class="el-icon-user-solid"></i>
        <span>{{ feature.contact }}</span>
      </div>
      <div class="price">
        <span>{{ feature.price }}</span>
        <span>元/月</span>
      </div>
      <div class="tag">
        <span>{{ feature.tag }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.single-line-text() {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.main {
  max-width: 100%;
  max-height: 142px;
  margin: 5px;
  display: flex;
  gap: 5px;
}

//.main:hover {
//  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//  transform: translateY(-1px);
//  transition: box-shadow 0.3s ease, transform 0.3s ease;
//}

.picture {
  width: 120px;
  height: 142px;
  flex: none;
  overflow: hidden;
}

.main-content {
  flex: 4;
  display: grid;
  grid-template-columns: 0.7fr 0.2fr 0.1fr;
  grid-template-rows: auto auto auto auto;
  grid-template-areas:
    "row1 col1 col2"
    "row2 col1 col2"
    "row3 col1 col2"
    "row4 col1 col2";
}

.title,
.location,
.description,
.contact,
.price {
  .single-line-text();
}

.title {
  grid-area: row1;
  font-weight: bold;
}

.location {
  grid-area: row2;
  color: gray;
}

.description {
  grid-area: row3;
  color: #9ea7b1;

  span {
    background-color: #f3f4fb;
    margin: 2px;
    padding-left: 2px;
    padding-right: 2px;
  }
}

.contact {
  grid-area: row4;
  color: #545c64;
  cursor: pointer;
}

.price {
  grid-area: col1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #d25b4c;
  font-weight: bold;
}

.tag {
  grid-area: col2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #42b883;
  font-weight: bold;
}
</style>
