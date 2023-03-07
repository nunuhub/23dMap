## 更新日志

### 2.0.1

_2023-02-16_

#### 新特性

- file-export
  - 导出国土资源部标准格式文件时添加带号 ([05c9d06](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/05c9d069b0e7bb31ab08d69d4122108f60494c36))

#### Bug 修复

- map
  - 修复组件未读取运维端地图配置信息的问题 ([a51152c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/a51152ca22691c299efcc3cebbf8a58e15f528bf))
- map-earth
  - 修复组件未读取运维端地图配置信息的问题 ([fc74dfb](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/fc74dfb9072384e59b42615fa9712b53f04e9db9))
- earth
  - 修复组件未读取运维端地图配置信息的问题 ([abaf26e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/abaf26e1c2872c1a23cdf67573dffbf40245fbab))
- layer-switcher
  - 修复纯三维模式下地形卡片图片未展示的问题 ([40944df](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/40944df82decd1b9a71d29d6d98b7f48f5b396db))

#### 其他

- 提供三维 webpack 配置文件导出 ([e1aecec0](http://192.168.1.132/gis-dev-project/shinegis-client-23d/-/commit/e5af001608a664207b19ee11294b85caa49aee5c))

### 2.0.0

_2023-01-13_

#### 非兼容性更新

- map
  - controls 属性中 MousePosition 属性修改为 Geolocation
- earth
  - 移除 earthConfig 属性
- map-earth
  - 移除 mapOptions 和 earthOptions 属性
  - change:viewMode 事件名称修改为 change:view
- layer-switcher
  - options 属性结构变更
- tdt-layer-switcher
  - 移除天地图底图切换组件
- place-search
  - noFrom 属性改名为 label
- general-card
  - 移除面板停靠功能
- config-provider
  - 移除 userId 属性

#### 新特性

- map
  - 控件样式统一化 ([d860230](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d86023040c7d933df2bb217d864e5b4669926cc5))
  - 新增全图控件 ([fc8484a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/fc8484a5e195be10e108f8f0282b453eb4201928))
  - 鼠标位置控件修改为地理位置控件 ([e3428fb](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/e3428fbda771c7067e1345de34555c39172a13b3))
  - 默认地图初始位置修改 ([0a6917e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0a6917ec962d1d5c77ac75a025fded4dfe8ae14e))
- earth
  - 添加控件配置属性 ([5941e2d](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/5941e2d68a8e642698447bd08343c64f8a80934b))
- map-earth
  - 新增初始视图控制参数 ([a82d2f0](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/a82d2f0618a9af6fa93d216950ab701b012a8361))
  - 新增二三维地图位置控制、交互控制等相关属性 ([978b1b3](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/978b1b3c46b97c1235e7fda57e9fce4d22358e02))
- scheme-layer
  - 添加默认选中参数(default) ([4cc8665](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4cc8665b1d38175194339eace6e95055ccf8bfa9))
- place-search
  - 新增 locatePoint 方法 ([99863e5](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/99863e58a0d015e354aeb4df049a7dd2bd8cfe0d))
- layer-switcher
  - 组件重构，优化样式和交互 ([7f36fd6](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/7f36fd658b09cfd418b1defc4e36b6818cbe4b87))
  - 添加地下空间控件 ([e7f89c6](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/e7f89c6cbe3fd6d82c752dc416e5155e668edf39))
- general-bar
  - 优化：当子菜单在当前视图下全部隐藏时则父级菜单也自动隐藏 ([348ce3c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/348ce3c1fa7b3df4b6cdab3b8eef31efb21a9962))
- general-mask
  - 掩膜组件二三维样式同步 ([d4bbed3](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d4bbed3fc731adc277992cecaf8ddce7d232e295))
- identify-popup
  - 新增强制不弹窗属性 ([be5d6fc](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/be5d6fc85e51d8fb3163114e3545f67597d38c8a))
  - 新增查询结果切换事件 ([0022582](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0022582550f25d7a19d234063e5786e1a3a03269))
- layer-manager
  - 支持复合图层类型数据加载 ([c5c3ebb](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/c5c3ebb3bf3e42c5242a17006920303ca9cdb693))
  - 图层标识的图标移动到图层名称前，双击图层节点添加图层定位能力 ([d31bfc4](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d31bfc46fd03b37d89d7f8ce3af8b603e4ff5759))
- draw-tool
  - 新增移除图形、设置图形样式等方法 ([42e47a2](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/42e47a2ad79721dce08f2e32cebf479fb4fca3ad))
- draw-tool3d
  - 新增移除图形、设置图形样式方法 ([70c8895](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/70c8895a5dfac703f21f4bf890ce5fa7ec11a7ce))
- navigate
  - 修改 xzqLayer 为动态属性 ([aabb6c4](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/aabb6c4c705f9cad25fa24a7159fdb9e2383a6b2))
- legend
  - 图例组件添加 isEdit 参数，可以关闭编辑模式 ([0575bd7](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0575bd73c365fa81bcd9ed074b712a0b5ddca036))

#### Bug 修复

- flatten-tools
  - 解决图层树节点全选，开挖关联图层获取不到问题 ([4edc27e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4edc27e9f665d98aa3577b4ebf2044849a1916b0))
- navigate
  - 修复三维定位 multiPolygon 渲染混乱问题 ([5dc95c8](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/5dc95c86a96b8fdce93ceec7a91b56df7c7e6b7c))
- map-measure
  - 修复距离测量时出现平方千米单位的问题 ([995777f](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/995777f3ac0c8c42521d70474060cd8ba7362174))
- spatial-analysis3d
  - 修复剖面分析在无地形时删除失败的问题 ([9d2a273](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/9d2a273c7a552f31cac255d0b6555630e137233f))
- edit-tool
  - 修复线图层编辑时,无法退出编辑状态的缺陷 ([99b9f5f](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/99b9f5f3484858aedef61da5efe4a3131ec5dca9))

### 1.3.11

_2023-02-03_

#### 新特性

- layer-manager
  - 二维图层定位位置可以通过 initExtent 配置 ([2aeeb83](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/2aeeb83978de531bc2997a2db5ff02d15e048b05))
- legend
  - 图例组件添加 isEdit 参数，可以关闭编辑模式 ([0575bd7](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0575bd73c365fa81bcd9ed074b712a0b5ddca036))
  - 图例组件修改为二三维通用组件 ([081cfd3](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/081cfd303e9788572fad30df6bc49e0968b62a25))
- general-mask
  - 新增删除三维掩膜的方法(remove3DMask) ([63d808e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/63d808ecc33a4ff97da43c5477628a4804ba733a))
- map-earth
  - 新增初始视图类型设置功能 ([c87c121](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/c87c1213ffeba4d099aa5f4da19a747d1500129a))

#### Bug 修复

- general-mask
  - 修复掩膜多次加载时,会重复加载的缺陷 ([204f42c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/204f42ca7f909e0f88d860f7e2d34d6534374377))
### 1.3.10

_2023-01-04_

#### Bug 修复

- identify-popup
  - 修复三维模式下 Arcgis 和 GeoServer 图层查询点出现偏移的问题 ([7126d1e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/7126d1e560e21e17afc9e3b2ad7c7d86050765e3))

### 1.3.9

_2022-12-29_

#### 新特性

- draw-tool
  - loadGeoJson 方法添加返回数据 ([aaae94b](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/aaae94b17c4b4eed876323f3804e87b1379c2c09))
- general-mask
  - 新增掩膜组件 ([d2b1e3b](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d2b1e3b9ad05d2f6eca30312821dc731008cb550))
- config-provider
  - 服务地址配置等属性修改为动态属性 ([af28a33](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/af28a3368e9ef775d6f35ac29e721922bb3c1158))

#### Bug 修复

- map-measure3d
  - 修复方位测量无法删除辅助线的问题 ([8e73851](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/8e73851fadfc8f504cb644aef6e141d0e3aaf9cc))

### 1.3.8

_2022-12-16_

#### 新特性

- identify-popup
  - 新增查询结果切换事件(change:feature) ([0022582](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0022582550f25d7a19d234063e5786e1a3a03269))

#### Bug 修复

- core
  - 修复配置地址中带 token 的 arcgis 服务不能加载的问题 ([c4b7dc9](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/c4b7dc957339e4e3a1de92573bc8e04b7934ba33))
- identify-popup
  - 修复三维图层查询卡顿问题 ([e13b87e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/e13b87eb1114e669f4f6c7ae7e1ab97e1655689c))
- draw-tool3d
  - 修复 remove 和 removeAll 失效的问题 ([bce7f07](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/bce7f07be59536121f37ecb54c41efbc03255ba8))

### 1.3.7

_2022-11-25_

#### 新特性

- file-import
  - importSuccess 事件添加了返回参数 importFile,为导入的文件 ([d0c2629](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d0c26291f491764c2841bdc35344981c59ae1a93))
- config-provider
  - shinegaUrl 修改为动态属性 ([445bf29](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/445bf29948ebd2bb28ccea7d651624c0f9a09fc6))

#### Bug 修复

- roller-blind
  - 修复卷帘不支持图层组的问题 ([384b569](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/384b5698d45cdefada0f6a5bc9abab27ac41dd6d))

### 1.3.6

_2022-11-07_

#### 新特性

- identify-popup
  - 缓冲区查询面板功能重构，增加属性控制查询面板相关配置 ([f91f3a4](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/f91f3a421ed62e210e56de8d3ca91f2932564865))
- place-search
  - 添加定位方法 locatePoint,提供带带号的坐标定位 ([99863e5](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/99863e58a0d015e354aeb4df049a7dd2bd8cfe0d))
- roller-blind
  - 卷帘功能提取为组件 ([1a43412](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1a434128701925d56e1f36e590b21ed7c8a19973))
- file-import
  - 新增支持根据 GA 后端获取面积的能力 ([cb40f67](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/cb40f67e866a678d559b037ca129f4aab4f22887))
  - 新增支持 MDB/GDB 格式 ([bdf477f](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/bdf477fbe73a5cba8af7a04f73efd455b3221d59))
- map
  - 新增指北针组件的图标配置参数 ([4d8fa1f](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4d8fa1f0c3e6f7bbafa4de62a7d1fa6c6672db78))
- general-bar
  - 修改暗色模式默认背景色为#555E67 ([707289e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/707289e56010a459c9a4866c4f63ede5a1ae9385))
- config-provider
  - 添加 shinegaInitData 参数,用于配置保存和删除的前置条件 ([1ea511a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1ea511a68a6ae59aec9862c7833fd71e3525c4a7))

#### Bug 修复

- draw-tool3d
  - 修复坐标的微调按钮无效问题 ([9e3ea1c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/9e3ea1c7d2b57b61ea21c7ff21d9dfda33286e36))
- map
  - 修复 search 方法查询二三维服务平台代理后的 wms 服务无法成功的问题 ([c042a6e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/c042a6ea3ba60ef2230befd559728bb9ec05cb67))
- base-control3d
  - 修复点击雨量时，对雪量面板进行重置的缺陷。 ([9d33360](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/9d333603d172ba6a6e130adfca16fab2ed8e4e7c))
- file-import
  - 解决导入的自然资源部标准格式的实例无法保存问题 ([89a3c14](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/89a3c145193dbfbd6b1cfe1c68a09a3d7532e9ab))
  - 修复导入组件销毁后,对应的弹窗无法关闭的缺陷 ([d9beec1](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d9beec1bfd7e0b543c9dd3ef602257ff47f4e185))
- place-search
  - 修复一键搜索组件 Arcgis 服务限定范围的查询无结果的缺陷 ([1e89496](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1e89496077ba3643a97d82a8b78aeae8873854cf))

#### 优化

- identify-popup
  - 当移除所有查询结果时自动关闭查询弹窗 ([afe6751](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/afe6751ebbdd8ff8db4b3960af27c9acea5418e2))
- general-bar
  - 当子菜单在当前视图下全部隐藏时则父级菜单也自动隐藏 ([348ce3c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/348ce3c1fa7b3df4b6cdab3b8eef31efb21a9962))
- tool-bar
  - 优化配置读取逻辑 ([72bfa95](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/72bfa9566434804b42968ccf259ee5bf28e57f50))

### 1.3.5

_2022-10-28_

#### 新特性

- layer-manager
  - 图层服务支持加载 xyz 切片 ([8cb6923](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/8cb6923d8409f2f450a9ac9e341acca6a3e7c719))
- scheme-layer
  - 添加默认选中参数 ([4cc8665](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4cc8665b1d38175194339eace6e95055ccf8bfa9))

#### Bug 修复

- draw-tool3d
  - 修复微调按钮点击无效的缺陷 ([2701db2](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/2701db230e2ebdfad90d43502605a1f5575289e6))
  - 修复微调按钮点击无效的缺陷 ([32d5ecc](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/32d5ecc8df2dbb12964166af8e73c449c3ef546a))
- spatial-analysis3d
  - 解决淹没分析输入框无效的缺陷 ([18a7ea6](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/18a7ea6f7fffc612968f6a7683ff33869b7ed3e3))

### 1.3.4

_2022-10-25_

#### 新特性

- legend
  - 新增图例编辑功能 ([e03ca66](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/e03ca66f306ee45ce540b22c43319282dc2fe682))
  - 支持自定义样式的图例 ([4976d79](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4976d79197c1e2a7dc1eb31d70f5fef6e632c9c6))
- layer-manager
  - 当前可编辑层支持取消选中 ([a3ab676](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/a3ab6763369fbcdb0fcccca8c7921f1e01a554a5))
- edit-tool
  - 修改编辑组件操作模式，双击开始编辑改为单击开始编辑；单击删除节点改为 ALT+单击删除节点。 ([fb3a247](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/fb3a247733221353bcffb2ab559c83c52fae2b72))
- file-import
  - 导入组件支持 WP/WL 的导入 ([f2c89f5](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/f2c89f56be0d2e41d3fd7f3f688697e39e023931))

#### Bug 修复

- scene-split
  - 修复分屏大于 4 时，样式错乱的缺陷 ([b97387d](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/b97387d8e49d2778892a15989a9436d158f30d6b))
- earth
  - 修复处理 wmts 解析失败引起的错误，修复定位延迟问题 ([1f34057](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1f340576fe54cd4377e7a918cdfe1d207d35c5d7))
  - 修复图片矩形定位错误的缺陷 ([9417d6a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/9417d6a8a35ec37d6112e46b8be88758f79dad25))
- file-import
  - 修复单 shp 文件导入失效的缺陷 ([27e1663](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/27e16636f33cd3c061a12ca396ae2eee9e822dc5))
  - 修复 dxf 选择坐标系后导入失败的缺陷 ([3a65c13](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/3a65c13d9ddbb7e05c3504347a3a8ab7266bb917))
- identify-popup
  - 缓冲区查询相关文案修复 ([26a55e4](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/26a55e44b0dd021b4f4576e62fca91d91ad74a1d))
  - 修复 GeoServer 类型服务配置查询外链后查询异常的问题 ([56e103a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/56e103a794963e122041a027a9742788c90f3f0b))
  - 修复 GeoServer 图层组查询无效的问题 ([78c5304](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/78c530488747a6d4fc6690a874c9682c22f29c8f))
- base-control3d
  - 修复全屏按钮的变化缺陷 ([4ed6b49](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4ed6b49cf7737f64abca5b46d02777b3abc170e1))
- place-search
  - 修复百度高德查询结果偏移的问题 ([1d9af6c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1d9af6ced415839567796420159b55cff4ab5c1d))
- spatial-analysis3d
  - 修复删剖面分析时，错乱删除的问题。 ([752cd05](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/752cd0529dfb6be9709fefcfc5f88b0d052d3b3e))
  - 修复再次进入功能时，地形分析的区域错误缺陷 ([9628719](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/9628719a12c62502f23ae006242188eb4b303fad))

### 1.3.3

_2022-10-09_

#### 新特性

- cutting-layer
  - 裁剪遮罩层添加显示顺序(maskIndex)参数 ([38ee16b](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/38ee16b1c973a430b71dd420bc2509124eb9c5da))
- identify-popup
  - 添加支持查询时判断地图缩放层级条件的功能 ([86108b9](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/86108b922a290ad38104c3e539e98a8b3605f9f5))
- hawk-eye
  - 新增鹰眼组件 ([9291389](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/92913897da95206ee69bcf010487ebf4540de304))

#### Bug 修复

- select-tool
  - 修复选择后的地块主键与 GA 服务不匹配的问题 ([fae055e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/fae055e4bcee29261e0526d0fd21eb3ce5127600))
- navigate
  - 修复搜索时行政区同级重复的 bug ([1c7c545](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1c7c545558b1bed83827cd130e3a05e1c94f6b4a))
- identify-popup
  - 修复三维查询弹窗位置不准确的问题 ([4783ab0](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4783ab0623a602f3c610285448d79b091465cb21))

### 1.3.2

_2022-09-16_

#### 新特性

- Doc
  - 首页添加服务接口页入口([2830bd7](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/2830bd7b7cc9c3934959dcce09ae5dcffb16e70c))
  - 代码示例新增在线运行实时编辑功能 ([ece679a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/ece679af863b36cecc65ae429af822240bfcebab))
  - 组件示例采用弹窗模式展示 ([1e6f203](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1e6f2032a6de9484f84ceba3be458fbd4d290057))
  - 首页组件卡片默认跳转到二三维组件 ([cb90ead](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/cb90eadb578305ea71e50715546ab50a0617be52))
- draw-tool3d
  - 新增预加载功能，可于组件初始化时加载上次保存的图形。 ([8e2447d](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/8e2447d161a842fce665373e9c3128a37628e165))
- map
  - 添加当地图容器大小变化时地图自动适配大小的特性 ([46c2820](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/46c282014e14ed930f524704fa61e0d1ea14182f))
- map-share
  - 添加 params 参数，支持添加自定义 url 参数 ([9d3fd2a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/9d3fd2ae0a99bfab6fe8624bebfd0cd467aaac23))
- earth
  - 支持加载纠偏后的互联网高德地图，支持加载有偏移的百度地图 ([4aa98c2](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/4aa98c2433b7f87a401b219070ae50ac67aa33ed))
- tool-bar
  - 新增对复制、粘贴、分割和合并组件的支持 ([6c86da2](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/6c86da26be004aa8c5fdc504f8be0eedbff13d55))

#### Bug 修复

- tool-bar
  - 修复工具条组件读取运维端配置时未读取功能开启状态的缺陷 ([6a87f45](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/6a87f4501dded7b1b297bbe0fbaec1e02e367f92))
- layer-switcher
  - 修复 MapEarth 触发 toggleViewMode 时,底图组件没有切换模式的缺陷 ([1751f60](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1751f6018fc7cdddc8df4d530c79b41904dde0bf))
- identify-popup
  - 修复 geoserver wfs 服务查询弹窗数据异常的问题 ([32067be](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/32067bed1cbbb59a11668ddb78eb228531e203a7))
- general-bar
  - 修复 options 中 hidden 优先级未高于 view 字段的问题 ([8e15914](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/8e1591418723f27e1b83da41a16d53ad1ee06be7))

### 1.3.1

_2022-08-31_

#### 新特性

- config-provider
  - 新增可全局配置的变量(token、shinegaUrl) ([680bb2c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/680bb2c2cc5ef55487825a059cc893b4e700e422))
  - 添加全局通用面板和通用工具条主题配置属性 ([d488d3c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d488d3c189f1c9b16377bcc1e057f52f49912ea6))
- draw-tool3d
  - 新增创建临时图层方法(createDrawLayer)方法 ([e9c6e8a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/e9c6e8a2916f6af389e2d6c5dac7c30fcb13ac99))
  - removeAll 方法支持传图层 id ([b4218c7](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/b4218c7ab879c495cc8ae7b11a96866e87562618))
  - 增加 loadGeoJson 方法 ([0b9cd6e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0b9cd6ef4577c51350fd436d9a57cf0f8c3b318a))
- draw-tool
  - 添加临时层绘制相关方法(loadGeoJson、createDrawLayer、removeAll 方法支持传图层 id) ([bab9e60](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/bab9e60b79097d3b06875493e00acc8df98ad27f))
- identify-popup
  - change:active 事件新增第二个参数 ([a3cf716](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/a3cf71602e387dbe2d85d41c012a89d20c9a6aaf))
  - 新增自定义弹窗相关相关插槽和方法 ([3267985](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/32679851f46dbed0dfc4d0aced6b61af5197c652))
  - 新增 geojson 类型图层的查询能力 ([dcdc85c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/dcdc85ca98a9dde50adcd903b630f00a4e0b4d20))
- select-tool
  - 查询弹窗组件打开缓存查询时，选择组件自动激活 ([aaa96db](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/aaa96dbe1338b1f30cbd1f578392acb52efd09c5))
- place-search
  - 支持多个 geoserver 类型服务配置并行检索 ([274269b](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/274269badc54b8df0c366dc9230bdc12bd7e5214))
- layer-manager
  - 新增分屏方法 ([2414b69](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/2414b69a854a5fff0659e560ba81141404897c2a))
- Doc
  - 添加常见问题页 ([13bda79](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/13bda79e8b58a6c88101209306a83f901824bfe7))

#### Bug 修复

- map-earth
  - 修复在三维视图关闭分屏后切换到二维视图后，地图无法展示的问题 ([77d911e](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/77d911e5fa37ad64e8ad044bf9aee5da8b6ada04))
- general-bar
  - 修复间隔条样式问题 ([f5e2adb](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/f5e2adb558476088902d1655fc8a76ee329faa10))
- identify-popup
  - 修复三维 i 查询当有多个三维图层结果时，高亮效果不正确的问题 ([733b459](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/733b4592f3c41638dc74e11f1761f9f1c36c2e0d))
  - 修复若已存在选中图形，打开缓冲区查询，缓冲按钮未激活的问题 ([1f368be](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/1f368be396df35369345641bd69ad62125b6beae))
  - 修复三维图层查询时异常卡顿的问题 ([72cd6e3](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/72cd6e308a624a1d50c541a5378044ef86e5f9e0))
- legend
  - 修复点击图例过滤图层后，去掉图层目录勾选，图例中该图层的图例仍保留着的 BUG ([c75112c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/c75112c0d934cd9783177aeb03c96fe0efae5945))
- earth-core
  - 修复服务加载异常后导致定位报错的问题 ([98e7560](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/98e75602980836aee7f36ad7af647e65d94a0e9d))

### 1.3.0

_2022-08-10_

#### 非兼容性更新

- spatial-analysis3d
  - 属性 toolbarPosition 调整为 position，使用方式不变 ([5895ff7](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/5895ff7575640059c8401c226e3bfe9de3852fc7))
- map-measure3d
  - 属性 toolbarPosition 调整为 position，使用方式不变 ([098535a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/098535a823f3f5b95a475f9bee8ad6c820a9c551))
- draw-tool3d
  - 属性 toolbarPosition 调整为 position，使用方式不变 ([3b692a2](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/3b692a2c3875b3ff7e3f01734ba04b35f01079f5))

#### 新特性

- identify-popup
  - 新增可通过运维端配置查询面板链接按钮和链接属性的功能 ([b8926a2](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/b8926a2feebe7412a8db70d9ed27c81ea3a481cc))
- layer-manager
  - 支持百度地图和高德地图加载
- general-bar
  - 新增 mainTagType 属性 ([41cd336](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/41cd336a4b909651bd8bb8b9fcc7e66fa4991697))
  - 属性 options 中支持传入 disabled 参数 ([788d554](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/788d55419d5204ede085f1e83f51a34aabd2b943))
  - 添加间隔条类型配置项；水平模式下间隔条高度调整为文字区域高度 ([5427424](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/54274243bafbfdf979a19a5499676e3df8f41223))
- tool-bar
  - 新增 showCardState 属性；修改默认分割线样式 ([7459301](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/7459301d4ce34d3ac2e65310fd16e3dade87966e))
- place-search
  - 新增 extent 属性 ([325ee48](http://192.168.1.132/gis-dev-project/shinegis-client-23d/-/commit/325ee48588ae127fd2d3fc73f9aa30e4f1026b4b))
- navigate
  - navigated 事件回调中新增 extent 属性 ([7b634a3](http://192.168.1.132/gis-dev-project/shinegis-client-23d/-/commit/7b634a3e6cebd0556c86f176156b76465a622a2a))
- draw-tool3d
  - 新增 panelCardProps hasEdit 属性([f44ca7a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/-/commit/f44ca7a04e9b11464dce19164a1cf9f894cf35fc))
- map-measure3d
  - 新增 panelCardProps 属性 ([8998606](http://192.168.1.132/gis-dev-project/shinegis-client-23d/-/commit/8998606f0965c5c19766881af28a3c54ae4d723d))
- spatial-analysis3d
  - 新增 panelCardProps 属性 ([e2af574](http://192.168.1.132/gis-dev-project/shinegis-client-23d/-/commit/e2af574eb10a2766164b647e9aedf13e23e31658))

#### Bug 修复

- icon-svg
  - 修复加载外部图片资源时，在图片正常显示之前会显示加载出错图片的问题 ([c5fd43a](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/c5fd43a2a54445f36e460c3cee16530a7b1a2a16))
- layer-manager
  - 修复切换视图时自动关闭分屏功能的问题 ([0af90eb](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0af90ebcb83beb6c93904e3be309be1c56dc9183))
- identify-popup
  - 修复缓冲查询中缓冲区图形在执行查询前可能会自动清除的问题 ([31eaa2c](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/31eaa2c6322b3e73fc68ff2ac27db02f4eab1240))

### 1.2.3

_2022-08-01_

#### 新特性

- ToolBar
  - 添加工具条与行政区导航组件的联动 ([156b99f](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/156b99f62a993b657e398903ef23313500e77b43))
- Map
  - 二维地图在正北时会隐藏指北针 ([fd6add9](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/fd6add90d5121ce177da6316af3f6361a04b6c8d))

#### Bug 修复

- FileImport
  - 修复导入的文本时,多个地块在 importSuccess 里只抛出一个的 bug ([d8a9ea5](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/d8a9ea5abf84b9bdcbd0ed003739ade22a7568ed))
- Navigate
  - 解决二三维模式下，三维导航定位问题 ([0caf507](http://192.168.1.132/gis-dev-project/shinegis-client-23d/commits/0caf507349cf744411c3aaa0d0747646db463289))
