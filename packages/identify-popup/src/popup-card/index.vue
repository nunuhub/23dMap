<template>
  <GeneralCard
    ref="card"
    class="sh-popup-card"
    :class="{ bind: bindFeature, multi: layerList.length > 1 }"
    :drag-enable="!bindFeature"
    :berth="false"
    :style-config="styleConfig"
    :theme-style="themeStyle"
    :position="position"
    :img-src="imgSrc ? imgSrc : 'identify-popup'"
    :theme="theme"
    @change:isShow="onChange"
  >
    <template slot="title">
      <el-select
        v-if="layerList.length > 1"
        v-model="currentLayerId"
        class="select"
        placeholder="请选择图层"
        size="mini"
        :popper-append-to-body="false"
      >
        <template slot="prefix"
          ><IconSvg
            height="14px"
            width="14px"
            fillcolor="var(--primaryFontColor)"
            icon-class="layer-manager-layer"
            :style="{ margin: '9px 0' }"
        /></template>
        <el-option
          v-for="item in layerList"
          :key="item.id"
          :label="item.label"
          :value="item.id"
        >
          <span>{{ item.label }}</span>
          <el-badge size="small" class="mark" :max="99" :value="item.count" />
        </el-option>
      </el-select>
      <template v-else>{{ layerList[0] ? layerList[0].label : '' }}</template>
    </template>
    <template v-if="bindModeButton" slot="extBtn">
      <el-tooltip
        :content="bindFeature ? '不停靠' : '停靠'"
        placement="top"
        :open-delay="50"
      >
        <i
          class="connection-btn el-icon-connection"
          @click="onConnectModeChange"
        ></i>
      </el-tooltip>
    </template>
    <div class="info-container">
      <el-scrollbar class="table-scrollbar">
        <div class="attr-table">
          <el-table
            :stripe="stripe"
            :border="border"
            :highlight-current-row="false"
            :data="tableData"
            :show-header="false"
          >
            <el-table-column show-overflow-tooltip prop="key" label="属性">
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="data" label="数值">
              <template slot-scope="scope">
                <el-button
                  v-if="isLinkFied(scope.row.key)"
                  type="text"
                  size="small"
                  @click="onHrefClick(getLinkFiedUrl(scope.row.key))"
                  >{{ scope.row.data }}</el-button
                >
                <span v-else>{{ scope.row.data }}</span> </template
              >>
            </el-table-column>
          </el-table>
        </div>
      </el-scrollbar>
      <div v-if="$slots.default" class="extend"><slot></slot></div>
    </div>
    <el-pagination
      hide-on-single-page
      layout="prev, pager, next"
      :page-count="totalPage"
      :pager-count="5"
      :current-page.sync="currentPage"
    ></el-pagination>
    <div ref="footer" class="info-footer">
      <el-button
        v-if="!bindFeature"
        ref="zoomBtn"
        class="zoom"
        type="text"
        size="small"
        icon="el-icon-position"
        @click="onZoom"
        >缩放至</el-button
      >
      <div
        ref="links"
        class="links"
        :style="{ left: bindFeature ? '15px' : '85px' }"
      >
        <el-button
          v-for="(link, index) in links"
          :key="index"
          type="text"
          size="small"
          @click="onHrefClick(link.href)"
          >{{ link.name || '链接' }}</el-button
        >
      </div>
    </div>
  </GeneralCard>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralCard from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';

export default {
  name: 'ShPopupCard',
  components: {
    GeneralCard,
    IconSvg
  },
  mixins: [commom, emitter, generalCardProps],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    bindFeature: {
      type: Boolean,
      default: true
    },
    // 是否为斑马纹 table
    stripe: {
      type: Boolean,
      default: true
    },
    // 是否带有边框
    border: {
      type: Boolean,
      default: false
    },
    bindModeButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tableData: [],
      layerList: [],
      links: [],
      currentLayerId: '', // 当前图层id
      totalPage: 0,
      currentPage: 1 //当前页码
    };
  },
  computed: {
    // 以当前图层id+当前页码组成字符串标识当前feature
    currentFeatureId() {
      return this.currentLayerId + this.currentPage;
    },
    currentLayerResult() {
      return this.options.find(
        (ele) => this.queryId + ele.layerId === this.currentLayerId
      );
    },
    footerMode() {
      const { bindFeature, links } = this;
      return { bindFeature, links };
    },
    isLinkFied() {
      return (key) => {
        const currentResult =
          this.currentLayerResult?.results?.[this.currentPage - 1];
        if (
          currentResult &&
          Object.keys(currentResult.identifyField.fieldLink || {})?.length > 0
        ) {
          let realKey = key;
          const fieldAliases = currentResult.identifyField.fieldAliases;
          if (this.currentLayerResult.type === 'arcgis' && fieldAliases) {
            realKey = Object.keys(fieldAliases).find(
              (ele) => fieldAliases[ele] === key
            );
          }
          return Object.keys(currentResult.identifyField.fieldLink).includes(
            realKey
          );
        } else {
          return false;
        }
      };
    }
  },
  watch: {
    options: function (value) {
      this.$refs.card.changeShow(value.length > 0);
      /**
       * 加queryId为了防止当前后两次查询都是同一个图层则currentLayerId不变
       * 不能触发currentLayerId的watch
       */
      this.queryId = value.id;
      this.layerList = value.map((ele) => ({
        id: this.queryId + ele.layerId,
        label: ele.layerLabel,
        count: ele.results.length
      }));
      this.currentLayerId = this.layerList[0]?.id;
    },
    currentLayerId: function () {
      this.init();
    },
    currentPage: function () {
      this.tableData = this.getFeatureAttributes();
    },
    currentFeatureId: function () {
      this.$emit(
        'change:feature',
        this.currentLayerResult?.results[this.currentPage - 1]
      );
      this.configLinks();
    },
    footerMode: function () {
      this.$nextTick(() => {
        const zoomBtnHeight = this.$refs.zoomBtn?.$el?.clientHeight || 0;
        const linksHeight = this.$refs.links.clientHeight;
        this.$refs.footer.style.height =
          Math.max(zoomBtnHeight, linksHeight) + 'px';
      });
    }
  },
  methods: {
    init() {
      this.totalPage =
        this.options.find(
          (ele) => this.queryId + ele.layerId === this.currentLayerId
        )?.results.length || 0;
      this.currentPage = 1;
      this.tableData = this.getFeatureAttributes();
    },
    // 获取当前图形属性列表
    getFeatureAttributes() {
      const properties = [];
      const currentLayerResult = this.options.find(
        (ele) => this.queryId + ele.layerId === this.currentLayerId
      );
      if (!currentLayerResult) return [];
      const { attributes, identifyField } =
        currentLayerResult.results[this.currentPage - 1];
      const searchArray = identifyField?.search?.split(',') || [];
      const displayArray = identifyField?.display?.split(',') || [];
      const configInfo = identifyField?.config ? identifyField.config : [];

      if (displayArray.length === 0 || displayArray[0] === '') {
        for (let key in attributes) {
          if (key !== 'geometry') {
            properties.push({
              key: key,
              data: attributes[key]
            });
          }
        }
      } else {
        for (let i = 0; i < displayArray.length; i++) {
          let search = searchArray[i];
          let value = attributes[search];
          let decimalCount;
          if (!value || value.toString().toUpperCase() === 'NULL') {
            value = '';
          }
          /** ********处理枚举********/
          for (let item of configInfo) {
            if (item.search === search) {
              let enumData = item.enumData; // 拿到每个对应的枚举
              if (enumData && enumData.length > 0) {
                for (let list of enumData) {
                  if (value === list.enum) {
                    value = list.transEnum;
                  }
                }
              }
            }
          }
          /** ********处理枚举********/
          // 处理小数位
          if (typeof value === 'number') {
            for (let item of configInfo) {
              if (item.display === search) {
                decimalCount = item.num;
              }
            }
            let y = String(value).indexOf('.') + 1; // 获取小数点的位置
            let count = String(value).length - y; // 获取小数点后的个数
            // console.log(y,count);
            if (y > 0 && count > decimalCount && decimalCount !== false) {
              value =
                Math.round(value * Math.pow(10, decimalCount)) /
                Math.pow(10, decimalCount);
            }
          }
          properties.push({
            key: displayArray[i],
            data: value
          });
        }
      }
      return properties;
    },
    getRealLinkUrl(formalUrl, currentResult) {
      const url = formalUrl.replace(/\{(.+?)\}/g, (s0, s1) => {
        if (
          this.currentLayerResult.type === 'arcgis' &&
          currentResult.identifyField.fieldAliases
        ) {
          const alias = currentResult.identifyField.fieldAliases[s1];
          const targetValue = currentResult.attributes[alias];
          return targetValue;
        } else {
          const targetValue = currentResult.attributes[s1];
          return targetValue;
        }
      });

      return url;
    },
    configLinks() {
      this.links = [];
      const currentResult =
        this.currentLayerResult?.results?.[this.currentPage - 1];
      if (currentResult && currentResult.identifyField.formConfig?.length > 0) {
        const links = [];
        currentResult.identifyField.formConfig.forEach((config) => {
          const { formUrl, name } = config;
          links.push({
            name,
            href: this.getRealLinkUrl(formUrl, currentResult)
          });
        });

        this.links = links;
      }
    },
    getLinkFiedUrl(key) {
      const currentResult =
        this.currentLayerResult.results[this.currentPage - 1];
      let realKey = key;
      const fieldAliases = currentResult.identifyField.fieldAliases;
      if (this.currentLayerResult.type === 'arcgis' && fieldAliases) {
        realKey = Object.keys(fieldAliases).find(
          (ele) => fieldAliases[ele] === key
        );
      }
      const formalUrl = currentResult.identifyField.fieldLink[realKey];
      return this.getRealLinkUrl(formalUrl, currentResult);
    },
    onConnectModeChange() {
      this.$emit('change:connectMode');
    },
    onChange(value) {
      if (!value) {
        this.$emit('close');
      }
    },
    onZoom() {
      this.$emit('zoom');
    },
    onHrefClick(href) {
      window.open(href);
    }
  }
};
</script>
