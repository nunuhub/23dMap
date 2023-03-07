/**
 * 为vue绑定真实的ref，转发ref到BaseComponent
 * @param target 当前高阶组件真实实例
 * @param componnet 转发到指定的组件
 */
function bindRef(target, componnet) {
  let isBind = false;
  let current = target;
  while (current.$parent && !isBind) {
    current = current.$parent;
    let $refs = current.$refs;
    if ($refs) {
      Object.keys($refs).forEach((key) => {
        if ($refs[key] === target) {
          $refs[key] = componnet;
          isBind = true;
        }
      });
    }
  }
}

// HOC
export default function withConfigComponent(
  BaseComponent,
  { configName, transform } = {}
) {
  const hasPropsMixins = (BaseComponent.mixins || [])
    .filter((ele) => !!ele.props)
    .map((ele) => ({ props: ele.props }));
  return {
    name: BaseComponent.name,
    // 继承pros
    props: BaseComponent.props,
    mixins: hasPropsMixins,
    inject: {
      reactiveConfigInstance: {
        default: function () {
          return () => null;
        }
      }
    },
    data() {
      this.$configInfo = {};
      return {
        ready: false
      };
    },
    computed: {
      configInstance() {
        return this.reactiveConfigInstance();
      }
    },
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化组件配置信息，props.widgetInfo优先级高于configInstance
      async initConfig() {
        if (this.configInstance) {
          const componentName = this.$options.name.replace('Sh', '');
          let result = {};
          try {
            result = await this.configInstance.getWidgetInfoByTag(
              configName ? configName : componentName
            );
          } catch (error) {
            console.error(error);
            return;
          }
          if (!result.stat) {
            return;
          }
          if (typeof transform === 'function' && result.data) {
            result = transform(
              result.data,
              this.configInstance.widgetInfo.mapConfig,
              {
                url: this.configInstance.url.replace('/role/getResources', ''),
                schemeId: this.configInstance.params.schemeId
              }
            );
          } else {
            result = result.data;
          }
          this.$configInfo = {
            ...result
          };
        }
        this.ready = true;
      },
      forwordRef() {
        bindRef(this._self, this._self.$children[0]);
        this._self.$children[0]?.$emit('mounted', this._self.$children[0]);
      }
    },
    render(h) {
      // const slots = Object.keys(this.$slots).reduce(
      //   (acc, cur) => acc.concat(this.$slots[cur]),
      //   []
      // );
      let listeners;
      // 监听子组件mounted事件，做ref转发
      if (Object.keys(this.$listeners).includes('hook:mounted')) {
        listeners = {
          ...this.$listeners,
          'hook:mounted': [this.forwordRef].concat(
            this.$listeners['hook:mounted']
          )
        };
      } else {
        listeners = {
          ...this.$listeners,
          'hook:mounted': this.forwordRef
        };
      }

      return this.ready
        ? h(
            BaseComponent,
            {
              on: listeners,
              // 透传 scopedSlots
              scopedSlots: this.$scopedSlots,
              props: { ...this.$configInfo, ...this.$options.propsData },
              attrs: this.$attrs
            },
            this.$slots.default
          )
        : null;
    }
  };
}
