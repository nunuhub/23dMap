import { get } from 'shinegis-client-23d/src/utils/httprequest';
import { Message } from 'element-ui';
class ConfigManager {
  constructor(url, params) {
    this.url = url;
    this.params = params;
    this.token = params.token;
    this.isLoading = false;
    this.widgetInfo = undefined;
    // 仅进行一次请求，保留promise
    if (params) {
      this.promise_ = this._request(url, params);
    }
  }

  static getInstance(url, params) {
    if (!ConfigManager.instance) {
      // console.log('getInstance create')
      ConfigManager.instance = new ConfigManager(url, params);
    }
    /* else {
          if (map){
              ConfigManager.instance.setMap(map)
          }
        }*/
    return ConfigManager.instance;
  }

  // 请求后端获取config
  _request(url, params) {
    /*if (!params.schemeId) {
      params.schemeId = '96bbb4a163c007911bf1c96123d732a7';
    }*/
    return new Promise((resolve) => {
      get(url, params).then((response) => {
        if (response.code === 200) {
          let data = this._parseWidgetInfo(response.data);
          resolve(data);
        } else {
          if (response.code === 201) {
            Message('请检查国土平台登录的token');
          }
          resolve({});
        }
      });
      this.params.schemeId = this.params.resourceApplicationId;
    });
  }
  // 解析参数
  _parseWidgetInfo(data) {
    let result = Object.assign({}, data);
    if (data.components) {
      result.components = {};
      for (let component of data.components) {
        if (component.code === 'BaseMap') {
          component.code = '23D-base-map';
        }
        result.components[component.code] = component;
      }
    }
    if (data.componentDir) {
      result.components.ToolBar = {
        stat: JSON.parse(data.componentDir)[0].isShowToolbar,
        name: 'ToolBar',
        config: data.componentDir
      };
    }

    return result;
  }

  async getWidgetInfos() {
    if (!this.widgetInfo) {
      if (this.promise_) {
        this.widgetInfo = await this.promise_;
        this.widgetInfo.components.map = {
          stat: true,
          name: 'map'
        };
        this.widgetInfo.components.earth = {
          stat: true,
          name: 'earth'
        };
        this.widgetInfo.components.mapEarth = {
          stat: true,
          name: 'mapEarth'
        };
        this.widgetInfo.config = [];
        if (this.widgetInfo.custom && this.widgetInfo.custom.length > 0) {
          this.treeConvertToArr(this.widgetInfo.custom);
        } else if (
          this.widgetInfo.already &&
          this.widgetInfo.already.length > 0
        ) {
          this.treeConvertToArr(this.widgetInfo.already);
        }
        if (this.widgetInfo?.application?.basicConfiguration) {
          let basicConfiguration = JSON.parse(
            this.widgetInfo.application.basicConfiguration
          );
          this.widgetInfo.config.push({
            key: 'spatial_data_governance',
            value: basicConfiguration.GovernAddress
          });
        }
      }
    }
    // console.log(this.widgetInfo)
    return this.widgetInfo ? this.widgetInfo : {};
  }
  async getConfigByKey(key) {
    let widgetInfos = await this.getWidgetInfos();
    if (widgetInfos.config) {
      for (let item of widgetInfos.config) {
        if (item.key === key) {
          return item.value;
          // break;
        }
      }
    } else {
      return '';
    }
  }

  async getWidgetInfoByTag(componentTag) {
    let widgetInfos = await this.getWidgetInfos();
    let result = {
      stat: true,
      data: {}
    };
    if (widgetInfos?.components) {
      if (widgetInfos.config) {
        let fileUrl = '';
        for (let item of widgetInfos.config) {
          if (item.key === 'spatial_data_governance') {
            fileUrl = item.value;
            break;
          }
        }

        if (componentTag === 'FileImport') {
          widgetInfos.components[componentTag].url =
            fileUrl + 'geofile/' + 'import';
        } else if (componentTag === 'FileExport') {
          widgetInfos.components[componentTag].url =
            fileUrl + 'geofile/' + 'export';
        }
      }

      result.data = widgetInfos.components[componentTag];
      if (componentTag === 'Toc') {
        result.data.layersInfo = this.flatLayerdata;
      }
      result.stat = true;
    } else {
      result.stat = true;
    }
    return result;
  }

  async getSchemeById(sid) {
    let scheme;
    let result = await this.getWidgetInfoByTag('LayerScheme');
    if (result.stat) {
      let config = JSON.parse(result.data.config);
      scheme = config.find((item) => {
        return item.id === sid;
      });
    }
    return scheme;
  }

  async getMaskOptions() {
    let mask;
    let result = await this.getWidgetInfoByTag('Mask');
    if (result.stat && result.data.config) {
      let maskConfig = JSON.parse(result.data.config);
      mask = {
        layer: {
          url: maskConfig.url,
          visibleLayers: maskConfig.layerName,
          selectLayer: maskConfig.layerName,
          type: maskConfig.type
        },
        where: maskConfig.where
      };
    }
    return mask;
  }

  // 将数据修改为平层
  treeConvertToArr(data) {
    // 重置扁平化数组数据
    this.flatLayerdata = [];
    this.baseLayerIds = [];
    this.recursionFun(data);
  }
  recursionFun(source) {
    // 递归函数
    source.forEach((el) => {
      el.authkey = JSON.parse(sessionStorage.getItem('authkeytoken'));
      this.flatLayerdata.push(el);
      if (el.isBaseLayer) {
        this.baseLayerIds.push(el.id);
      }
      el.child && el.child.length > 0 ? this.recursionFun(el.child) : ''; // 子级递归
    });
  }
}

export default ConfigManager;
