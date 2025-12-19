<!-- src/views/router/exchangeSquare/PublishContent.vue -->
<script>
/* eslint-disable */
export default {
  name: 'PublishContent',
  data() {
    return {
      content: '',
      selectedImages: [],
      imagePreviews: [],
      uploading: false
    }
  },
  methods: {
    handleImageSelect(e) {
      const files = Array.from(e.target.files)
      if (this.selectedImages.length + files.length > 9) {
        this.$message.warning('最多只能上传9张图片')
        return
      }

      files.forEach(file => {
        if (!file.type.startsWith('image/')) {
          this.$message.error('只能上传图片文件')
          return
        }
        if (file.size > 20 * 1024 * 1024) {
          this.$message.error('单张图片不能超过20MB')
          return
        }

        this.selectedImages.push(file)
        const reader = new FileReader()
        reader.onload = (ev) => {
          this.imagePreviews.push(ev.target.result)
        }
        reader.readAsDataURL(file)
      })
      e.target.value = ''
    },
    removeImage(index) {
      this.selectedImages.splice(index, 1)
      this.imagePreviews.splice(index, 1)
    },
    async handlePublish() {
      if (!this.content.trim() && this.selectedImages.length === 0) {
        this.$message.warning('请填写内容或上传图片')
        return
      }

      this.uploading = true
      await new Promise(resolve => setTimeout(resolve, 1500))

      this.$notify.success({
        title: '发布成功',
        message: '你的帖子已发布到发现广场～',
        duration: 3000
      })

      this.content = ''
      this.selectedImages = []
      this.imagePreviews = []
      this.uploading = false
    }
  }
}
</script>

<template>
  <div class="publish-content">
    <div class="publish-card">
      <div class="header">
        <h2>发布新帖</h2>
        <p class="tip">分享你的租房心得、房源推荐或生活日常</p>
      </div>

      <div class="text-area">
        <el-input
          type="textarea"
          v-model="content"
          placeholder="说点什么吧...（支持描述房源、吐槽经历、求推荐等）"
          :rows="8"
          resize="none"
          maxlength="2000"
          show-word-limit
          class="modern-textarea"
        />
      </div>

      <div class="image-preview" v-if="imagePreviews.length">
        <div class="preview-grid">
          <div v-for="(preview, index) in imagePreviews" :key="index" class="preview-item">
            <img :src="preview" alt="预览" />
            <i class="el-icon-close remove-btn" @click.stop="removeImage(index)"></i>
          </div>
        </div>
        <div class="image-count">{{ imagePreviews.length }}/9</div>
      </div>

      <div class="action-bar">
        <div class="left-actions">
          <label class="upload-btn">
            <i class="el-icon-picture-outline"></i>
            <span>添加图片</span>
            <input type="file" accept="image/*" multiple @change="handleImageSelect" style="display: none" />
          </label>
          <span class="upload-hint">支持最多9张，每张不超过20MB</span>
        </div>

        <el-button
          type="primary"
          size="larger"
          class="publish-btn"
          :loading="uploading"
          @click="handlePublish"
        >
          {{ uploading ? '发布中...' : '发布' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.publish-content {
  height: 100%;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.publish-card {
  width: 95%;
  height: 90%;
  background: white;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 32px 40px 20px;
  border-bottom: 1px solid #f0f0f0;

  h2 {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .tip {
    font-size: 15px;
    color: #888;
  }
}

.text-area {
  padding: 20px 40px;
  flex: 1;
  overflow-y: auto;

  .modern-textarea /deep/ .el-textarea__inner {
    border: none;
    font-size: 17px;
    line-height: 1.7;
    padding: 0;
  }
}

.image-preview {
  padding: 0 40px 20px;

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  .preview-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    aspect-ratio: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.6);
      color: white;
      font-size: 18px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:hover {
        background: rgba(255,0,0,0.8);
      }
    }
  }

  .image-count {
    text-align: center;
    color: #999;
  }
}

.action-bar {
  padding: 20px 40px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;

  .upload-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #666;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      background: #f5f5f5;
    }

    i {
      font-size: 20px;
    }
  }

  .upload-hint {
    font-size: 13px;
    color: #aaa;
  }

  .publish-btn {
    min-width: 140px;
    height: 50px;
    border-radius: 25px;
    font-size: 17px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255,107,107,0.3);
    }
  }
}
</style>
