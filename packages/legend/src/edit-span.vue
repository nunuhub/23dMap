<template>
  <span
    contenteditable="true"
    @input="changeText"
    @focus="onFocus"
    @blur="onBlur"
  >
    {{ value }}
  </span>
</template>

<script>
export default {
  name: 'EditSpan',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editText: ''
    };
  },
  created() {
    this.editText = this.value;
  },
  methods: {
    // 文本改变时事件
    changeText(event) {
      let reg = /<.*>.*<\/.*>/gi;
      let reg1 = /<.*>/gi;
      if (event.target.innerHTML.match(reg)) {
        event.target.innerHTML = event.target.innerHTML.replace(reg, '');
      }
      if (event.target.innerHTML.match(reg1)) {
        event.target.innerHTML = event.target.innerHTML.replace(reg1, '');
      }

      this.editText = event.target.innerHTML;
    },
    onFocus() {
      this.editText = this.value;
    },
    onBlur() {
      this.$emit('input', this.editText);
    }
  }
};
</script>
