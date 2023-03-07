// !!文件修改后需重启项目生效
const config = {
  // 配置服务来源类型 clientAdmin / geoplat
  your_admin_type: 'clientAdmin',
  // 服务地址
  your_admin_url: 'http://192.168.20.28:19599/adminserver/role/getResources',
  // 场景ID 注意必须选择加载所有组件 配置底图切换组件图层配置信息
  your_admin_scheme_id: 'c0ab2051-4a61-9413-db8e-71853e58d348',
  // 统一用户中心登录返回的token
  your_admin_token: '',
  // i查询示例方案一 需要配置至少一个可查询的图层
  identify_popup_scheme1: '82f5119c-6487-7a53-64b8-e18561e3a32b',
  // i查询示例方案二 需要配置至少一个配置查询外链的图层
  identify_popup_scheme2: 'e367ff48-6d47-7562-2d62-d18561e3f57a',
  // 开挖压平示例 服务类型：三维切片(3dtiles) 至少一个 不开启查询  最好是倾斜摄影类数据
  flatten_scheme: '63fce260-b914-7262-e3f6-318561e443da',
  // 裁切示例 服务类型：三维切片(3dtiles) 至少一个 不开启查询  最好是人工建模类数据
  clip_scheme: '9513e2ce-bc6d-368d-5097-c18561e4b9e2'
};

module.exports = config;
