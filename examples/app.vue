<template>
  <div id="app" :class="{ 'is-component': isComponent }">
    <main-header v-if="!isPlayground"></main-header>
    <div class="main-cnt">
      <router-view></router-view>
    </div>
    <!-- <main-footer v-if="!isComponent"></main-footer> -->
  </div>
</template>

<script>
export default {
  name: 'App',

  computed: {
    isComponent() {
      return (
        /^component-/.test(this.$route.name || '') ||
        /^jsapi-/.test(this.$route.name || '') ||
        /^ga-/.test(this.$route.name || '') ||
        /^playground/.test(this.$route.name || '')
      );
    },
    isPlayground() {
      return /^playground/.test(this.$route.name || '');
    }
  }
};
</script>
