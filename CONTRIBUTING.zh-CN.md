# ShineClient23D 贡献指南

## Pull Request 规范

- 从 dev 拉取自己的功能分支（feature/xxx）。

- **不要提交** `lib` 里面打包的文件。

- 执行 `npm run dist` 后可以正确打包文件。

- 提交 PR 前请 rebase，确保 commit 记录的整洁。

- 确保 PR 是提交到 `dev` 分支，而不是 `master` 分支。

- 如果是修复 bug，请在 PR 中给出描述信息。

## 开发环境搭建

首先你需要 Node.js 16+，npm 3+。

```shell
git clone http://192.168.1.132/gis-dev-project/shinegis-client-23d.git
npm run dev

# open http://localhost:8085
```

> **提示**：可以运行 `npm run dev:play`，修改 `examples/play/index.vue` 文件，调用你修改后的组件，仍然访问 [http://localhost:8085](http://localhost:8085)，查看修改效果，更快更方便。

打包代码：

```shell
npm run dist
```

## 组件开发规范

- 通过 `npm run new` 创建组件目录结构，包含测试代码、入口文件、文档；组件名使用小写字母加中划线
  ```shell
  npm run new hello-world 组件中文名
  ```
- 组件中通用对象抽取：二维地图对象(this.$map)、三维地图对象(this.$earth)、全局配置管理对象(this.$currentView)、当前地图模式(this.viewMode)、当前视窗模式(this.currentView)等，已通过 mixins(src/mixins/common)引入，可直接使用
- 组件全局事件对象：抽取 Bus 对象为 subscribe((src/mixins/emitter))对象，使用方式：(**该使用方式在 beforeCreate 生命周期中无效**)

  ```js
  // layer-manager组件
  this.$emit('click', e)

  // b组件-订阅a组件的'click'事件
  this.subscribe.$on('layer-manager:click', (e) => {...})
  ```

- 组件样式尽量避免行内样式，统一放在 packages/theme-chalk/src 下的同名(组件名.scss)文件下
- 内部组件根据类型可大致为三种组件类型：面板类（例如：图层目录、绘制工具）、交互类（例如 i 查询、分屏等有开启关闭状态的）、功能类（例如文件导入）
  - 面板类组件属性、事件和方法分别继承自通用面板、通用工具条组件，特殊改动属性需重新列出(可参考图层目录组件文档)
  - 交互类组件需固定提供 toggle、activate、deactivate 三个方法（可参考 i 查询组件文档）
  - 功能类组件需提供 execute 方法（可参考文件导入组件文档）
  - 具体组件功能分类可前往（packages\tool-bar/src/config.js）文件查看

## 代码规范

项目已开启 ESlint 代码规范检查，开发时请开启所使用开发工具的 ESlint 相关辅助插件

## 文件命名规范

- 文件夹命名规范
  统一使用小写字母开头的(kebab-case)命名规范：例如(layer-manager)
- \*.vue 文件命名规范
  统一使用小写字母开头的(kebab-case)命名规范：例如(layer-manager.vue)
- \*.js 文件命名规范
  属于类的.js 文件，除 index.js 外，使用 PascalBase 风格: 例如(LayerManager.js)
  其他类型的.js 文件，使用 kebab-case 风格: 例如(ol-util.js)

## git 提交规范

commit message 格式

```js
<type><scope>: <subject>
```

### type(必须)

- feat：新功能（feature）
- fix：修补 bug
- docs：文档（documentation）
- perf: 性能提升的修改、功能优化
- style： 格式（不影响代码运行的变动，例如缩进等 !!!注意不是指 css 样式代码变动）
- refactor：重构（即不是新增功能，也不是修改 bug 的代码变动）
- test：增加测试
- chore：构建过程或辅助工具的变动

### scope(必须)

scope 表示此次修改内容所设计到的范围，可使用下列可选值：

- 所有组件名称（即 packages 目录下的子目录名称）
- 核心库代码（即 src 目录下的子目录名称）
- build 项目构建相关
- project 整理项目
- examples 文档网站
- other 其他

### subject(必须)

subject 是 commit 目的的简短描述，不超过 50 个字符,结尾不加句号或其他标点符号

### 符合规范的示例

```js
feat(button): 新增button组件
fix(button): 修复button点击无响应的bug
```

### 使用 cz-git 工具提交

可使用 `npm run cz` 命令激活命令行工具自动生成 message
