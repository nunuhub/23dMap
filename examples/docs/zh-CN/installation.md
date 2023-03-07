## 安装

### npm 安装

推荐使用 npm 的方式安装，它能更好地和 [webpack](https://webpack.js.org/) 打包工具配合使用。

需要切换 npm 地址到公司内部 npm 仓库,并登录(**账号密码请联系管理员或产品经理获取**)

根据版本号获取对应的仓库地址：

- 正式版本：三位数版本（如：1.1.0、2.0.0）
- 预发布版本： 带有-的四位数版本（如 1.1.0-1、2.0.0-0）

#### 切换 npm 地址到公司内部 npm 仓库

```shell
npm config set registry http://192.168.11.146:8073/repository/npm-all/
// 登录
npm login
// 输入用户名密码
username：******
password: ******
```

然后安装`shinegis-client-23d`包

:::tip

我们建议在使用 shinegis-client-23d 的时候锁定版本(在 npm install 时加上-E 或--save-exact 标签)，以免将来 shinegis-client-23d 升级时受到非兼容性更新的影响。

:::

#### 使用正式版本

```shell
npm i shinegis-client-23d -E
```

#### 使用预发布版本

指定对应的预发布版本号获取，例如

```shell
npm i shinegis-client-23d@1.3.2-7 -E
```

如果是通过 npm 安装，并希望配合 webpack 使用，请阅读下一节：[快速上手](#/zh-CN/component/quickstart)。
