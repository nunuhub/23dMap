<template>
  <div>
    <div class="property">
      <div class="form-config">
        标题：<input
          v-model="currentItem.title_txt"
          :class="inputClass"
          style="width: 220px"
        />
      </div>
      <div class="form-config">
        内容：<textarea
          v-model="currentItem.content_txt"
          style="
            height: 50px;
            width: 220px;
            background: transparent;
            border: 1px solid #cecdcd;
            border-radius: 5px;
            font-family: none;
          "
          :style="inputClass && currentTheme"
        ></textarea>
      </div>
    </div>
    <div style="margin-top: 10px">
      样式配置
      <hr />
      <div>
        <div class="form-config">
          标题文字颜色：<el-color-picker
            v-model="currentItem.theme.title_txt_color"
            show-alpha
            size="small"
          ></el-color-picker
          >&nbsp;&nbsp;标题背景色：<el-color-picker
            v-model="currentItem.theme.title_bgcolor"
            show-alpha
            size="small"
          ></el-color-picker>
        </div>
        <div class="form-config">
          标题文字大小：<input
            v-model="currentItem.theme.title_txt_size"
            type="number"
            :class="inputClass"
            style="width: 50px"
          />&nbsp;px
        </div>
        <div class="form-config">
          标题背景宽度：<input
            v-model="currentItem.theme.title_bgwidth"
            type="number"
            :class="inputClass"
            style="width: 50px"
          />&nbsp;px&nbsp;高度：<input
            v-model="currentItem.theme.title_bgheight"
            type="number"
            :class="inputClass"
            style="width: 50px"
          />&nbsp;px
        </div>
        <div class="form-config">
          内容文字颜色：<el-color-picker
            v-model="currentItem.theme.content_txt_color"
            show-alpha
            size="small"
          ></el-color-picker
          >&nbsp;&nbsp;内容背景色：<el-color-picker
            v-model="currentItem.theme.content_bgcolor"
            show-alpha
            size="small"
          ></el-color-picker>
        </div>
        <div class="form-config">
          内容文字大小：<input
            v-model="currentItem.theme.content_txt_size"
            type="number"
            :class="inputClass"
            style="width: 50px"
          />&nbsp;px
        </div>
        <div class="form-config">
          内容背景宽度：<input
            v-model="currentItem.theme.content_bgwidth"
            type="number"
            :class="inputClass"
            style="width: 50px"
          />&nbsp;px&nbsp;高度：<input
            v-model="currentItem.theme.content_bgheight"
            type="number"
            :class="inputClass"
            style="width: 50px"
          />&nbsp;px
        </div>
        <!-- <div class="form-config">
          内容背景图片<button @click="openWindow">
            选择图片<input
              id="myfileinput"
              type="file"
              style="display: none"
              multiple="multiple"
              :accept="acceptType"
              @change="readyUpload()"
            />
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { commonMethods } from './AnnoFormSetting.js';
import { commonStyle } from './AnnoFormSetting.js';
export default {
  name: 'PanelForm',
  mixins: [commonMethods, commonStyle],
  props: {
    propItem: {
      type: Object
    }
  },
  data() {
    return {
      useDom_theme: true,
      useSelf_define: false,
      currentItem: {},
      inputClass: {},
      acceptType: 'png, jpeg, jpg, svg'
    };
  },
  methods: {
    openWindow() {
      document.getElementById('myfileinput').click();
    },
    readyUpload() {
      // 获取上传的文件
      let fileInput = document.getElementById('myfileinput');
      // files 是一个 FileList 对象(类似于NodeList对象)
      let files = fileInput.files;
      if (files[0].size > 1024) {
        console.error('上传的图片大小不能超过1M');
        return;
      }
      let imgobj = new Image();
      let url = window.URL || window.webkitURL;
      // 手动创建一个Image对象
      imgobj.src = url.createObjectURL(files[0]); // 这里传的是File对象
      // img.onload 实现图片预加载方法
      imgobj.onload = () => {
        // 进行转码
        var imgBaseStr = this.annoInstance.image2base64(imgobj);
        this.currentItem.theme.content_bgimage = imgBaseStr;
      };
    }
  }
};
</script>

<style scoped lang="scss">
.form-config {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.Input {
  font-size: 10px;
  height: 25px;
  border-radius: 5px;
  border: 1px solid #cecdcd;
}
.lightInput {
  background: rgba(255, 255, 255, 0);
  color: black;
  @extend .Input;
}
.darkInput {
  background: transparent;
  color: white;
  @extend .Input;
}
.darkInput:focus {
  color: white;
}
</style>
