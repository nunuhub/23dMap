import {
  getFromAdmin,
  parseResult
} from 'shinegis-client-23d/src/utils/httprequest';
import { formatConversion } from 'shinegis-client-23d/src/utils/common';
import { Message } from 'element-ui';

function formatComponentName(name) {
  return `sh-${formatConversion(name)}`;
}

class ConfigManager {
  constructor(url, params, { token, applicationId }) {
    this.url = url;
    this.params = params;
    this.token = token;
    this.applicationId = applicationId;
    this.isLoading = false;
    this.widgetInfo = undefined;
    // 仅进行一次请求，保留promise
    if (params) {
      this.promise_ = this._request();
    }
  }

  static getInstance(url, params, { token, applicationId }) {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(url, params, {
        token,
        applicationId
      });
    }
    return ConfigManager.instance;
  }

  // 请求后端获取config
  _request() {
    return new Promise((resolve, reject) => {
      getFromAdmin(this.url, {
        params: this.params,
        token: this.token,
        applicationId: this.applicationId
      })
        .then((res) => {
          let result = parseResult(res);
          if (result.success) {
            let data = this._parseWidgetInfo(result.data);
            resolve(data);
          } else {
            Message.error('运维端获取数据失败:' + result.message);
            reject(result.message);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
  // 解析参数
  _parseWidgetInfo(data) {
    const result = data;
    const toolBar = result.components.find((item) => item.name === 'ToolBar');
    if (toolBar) {
      const toorBarConfig = this.getTreeData(result.components, toolBar.id);
      toolBar.stat = toorBarConfig.length ? true : false;
      toolBar.config = toorBarConfig;
    }
    // 添加基础组件的配置信息
    result.components = result.components.concat([
      {
        stat: true,
        name: 'Map'
      },
      {
        stat: true,
        name: 'Earth'
      },
      {
        stat: true,
        name: 'MapEarth'
      }
    ]);

    return result;
  }

  async getWidgetInfos() {
    if (!this.widgetInfo) {
      if (this.promise_) {
        try {
          this.widgetInfo = await this.promise_;
        } catch (error) {
          console.error('获取运维端配置信息失败:', error);
        }
      }
    }
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
    const widgetInfos = await this.getWidgetInfos();
    const result = {
      stat: false,
      data: {}
    };

    const target = widgetInfos?.components?.find(
      (item) => item.name === componentTag
    );

    if (target) {
      result.stat = target.stat;
      result.data = target;
      if (componentTag === 'LayerManager') {
        result.data.layersInfo = this.widgetInfo.tocs;
      }
    }

    // if (widgetInfos?.components) {
    //   if (widgetInfos?.components?.[componentTag]?.stat) {
    //     if (widgetInfos.config) {
    //       let fileUrl = '';
    //       for (let item of widgetInfos.config) {
    //         if (item.key === 'spatial_data_governance') {
    //           fileUrl = item.value;
    //           break;
    //         }
    //       }

    //       if (componentTag === 'FileImport') {
    //         widgetInfos.components[componentTag].url =
    //           fileUrl + 'geofile/' + 'import';
    //       } else if (componentTag === 'FileExport') {
    //         widgetInfos.components[componentTag].url =
    //           fileUrl + 'geofile/' + 'export';
    //       }
    //     }

    //     result.data = widgetInfos.components[componentTag];
    //     if (componentTag === 'Toc') {
    //       result.data.layersInfo = this.widgetInfo.actualToc;
    //     }
    //     result.stat = true;
    //   } else {
    //     result.stat = false;
    //   }
    // } else {
    //   result.stat = true;
    // }
    return result;
  }

  // async getMaskOptions() {
  //   let mask;
  //   let result = await this.getWidgetInfoByTag('Mask');
  //   if (result.stat && result.data.config) {
  //     let maskConfig = JSON.parse(result.data.config);
  //     mask = {
  //       layer: {
  //         url: maskConfig.url,
  //         visibleLayers: maskConfig.layerName,
  //         selectLayer: maskConfig.layerName,
  //         type: maskConfig.type
  //       },
  //       where: maskConfig.where
  //     };
  //   }
  //   return mask;
  // }

  getTreeData(list, parentId = 0) {
    const parentObj = {};
    list.forEach((ele) => {
      parentObj[ele.id] = ele;
    });
    if (!parentId) {
      return list
        .filter((o) => !parentObj[o.parent])
        .map((o) => {
          const ele = {
            key: formatComponentName(o.name),
            name: o.label,
            sort: o.sort
          };
          const children = this.getTreeData(list, o.id);
          if (children.length) {
            ele.children = children;
          }
          return ele;
        })
        .sort((a, b) => {
          return a.sort - b.sort;
        });
    } else {
      return list
        .filter((o) => o.parentId === parentId)
        .map((o) => {
          const ele = {
            key: formatComponentName(o.name),
            name: o.label,
            sort: o.sort
          };
          const children = this.getTreeData(list, o.id);
          if (children.length) {
            ele.children = children;
          }
          return ele;
        })
        .sort((a, b) => {
          return a.sort - b.sort;
        });
    }
  }
}

export default ConfigManager;
