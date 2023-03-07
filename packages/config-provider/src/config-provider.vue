<template>
  <div class="sh-config-provider">
    <div v-if="loading" v-loading="loading" class="loading"></div>
    <slot v-if="!loading" />
  </div>
</template>

<script>
import ConfigManager from './ConfigManager';
import ConfigManagerGt from './ConfigManagerGt';

export default {
  name: 'ShConfigProvider',
  provide() {
    return {
      reactiveConfigInstance: () => this.configInstance,
      reactiveShinegaUrl: () => this.realShinegaUrl,
      token: this.token,
      generalCardThemeStyle: this.generalCardThemeStyle,
      generalBarThemeStyle: this.generalBarThemeStyle,
      shinegaInitData: this.shinegaInitData,
      fastApplicationId: this.fastApplicationId
    };
  },
  props: {
    url: {
      type: String
    },
    schemeId: {
      type: String
    },
    // 目前支持clientAdmin,geoplat,默认值clientAdmin
    type: {
      type: String,
      default: 'clientAdmin'
    },
    // 国土的参数
    applicationId: {
      type: String
    },
    shinegaUrl: {
      type: String
    },
    token: {
      type: String
    },
    //全局面板样式
    generalCardThemeStyle: {
      type: Object
    },
    //全局工具条样式
    generalBarThemeStyle: {
      type: Object
    },
    //初始化的业务数据
    shinegaInitData: {
      type: Object
    },
    // 应用id-快速构建平台使用
    fastApplicationId: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      configInstanceShinegaUrl: ''
    };
  },
  computed: {
    configParams() {
      const { type, url, applicationId, token, schemeId } = this.$props;
      return { type, url, applicationId, token, schemeId };
    },
    configInstance() {
      // 使用运维端配置的情况
      if (this.type && this.url) {
        if (this.type === 'geoplat') {
          const { url, applicationId, token } = this.$props;
          return new ConfigManagerGt(url, {
            resourceApplicationId: applicationId,
            'X-Gisq-Token': token
          });
        } else {
          const { url, schemeId, token, fastApplicationId } = this.$props;
          let param = {
            schemeId
          };
          return new ConfigManager(url, param, {
            token,
            applicationId: fastApplicationId
          });
        }
      }
      return null;
    },
    realShinegaUrl() {
      return this.shinegaUrl ? this.shinegaUrl : this.configInstanceShinegaUrl;
    }
  },
  watch: {
    configParams() {
      this.executeRequest();
    }
  },
  mounted() {
    this.executeRequest();
  },
  methods: {
    executeRequest() {
      if (this.configInstance) {
        this.loading = true;
        this.configInstance.getWidgetInfos().then((e) => {
          this.configInstanceShinegaUrl =
            e.mapConfig?.['spatial_data_governance'];
          this.loading = false;
        });
      }
    }
  }
};
</script>
