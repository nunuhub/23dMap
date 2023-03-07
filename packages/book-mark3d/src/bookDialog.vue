<template>
  <div
    v-cardDrag
    class="sh-bookDialog"
    :class="{ dialog: true, diaShow: isOpen }"
  >
    <div class="dia_title el-card__header">
      <!-- <img src="../../assets/bookmark/icon_edit.png" alt="" /> -->
      <span class="title-l">
        <icon-svg icon-class="edit"></icon-svg>
        <span class="tt">{{ config.title }}</span>
      </span>
      <span class="dia_close" @click="isOpen = false">×</span>
    </div>
    <div class="dia_content">
      <div
        v-for="(item, index) in config.attrList"
        :key="index"
        :class="{ con_item: true, textarea: item.type == 'textarea' }"
      >
        <div class="item_l">
          <pre>{{ item.label }}</pre>
        </div>
        <!-- <div class="item_l">{{ item.label }}</div> -->
        <div class="item_r">
          <el-input
            v-if="item.type == 'input'"
            v-model="form[item.value]"
            type="text"
          />
          <el-switch
            v-if="item.type == 'switch'"
            v-model="form[item.value]"
            class="switch"
          ></el-switch>
          <textarea
            v-if="item.type == 'textarea'"
            v-model="form[item.value]"
          ></textarea>
          <el-input-number
            v-if="item.type == 'inputNum'"
            v-model="form[item.value]"
            controls-position="right"
            :precision="item.precision"
            :step="item.step"
            @change="changeNum"
          ></el-input-number>
        </div>
      </div>
    </div>
    <div class="dia_footer">
      <div class="diabtn dia_cancel" @click="isOpen = false">取消</div>
      <div class="diabtn dia_sub" @click="submit()">保存</div>
    </div>
  </div>
</template>

<script>
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import cardDrag from 'shinegis-client-23d/src/directives/export-card-drag';
export default {
  name: 'Dialog',
  directives: { cardDrag },
  components: {
    IconSvg: IconSvg
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isOpen: false,
      form: {
        name: ''
      }
    };
  },
  watch: {
    'form.heading'() {
      if (this.form.x) {
        this.form.heading = this.form.heading % 360;
        if (this.form.heading < 0) {
          this.form.heading = 360 + this.form.heading;
        }
      }
    }
  },
  mounted() {},
  methods: {
    open(data) {
      this.setForm(data);
      this.isOpen = true;
    },
    setForm(data) {
      if (data) {
        this.form = data;
      } else {
        this.form = {};
      }
    },
    setOpt(opt) {
      for (let key in opt) {
        this.form[key] = opt[key];
      }
    },
    submit() {
      this.$emit('getFormData', this.form);
      this.isOpen = false;
    },
    changeNum() {
      this.$emit('setCenteropt', this.form);
    }
  }
};
</script>
