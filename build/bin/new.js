'use strict';
var inquirer = require('inquirer');

console.log();
process.on('exit', () => {
  console.log();
});

if (!process.argv[2]) {
  console.error('[组件名]必填 - Please enter new component name');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');
const fileSave = require('file-save');
const uppercamelcase = require('uppercamelcase');
const componentname = process.argv[2];
const chineseName = process.argv[3] || componentname;
const ComponentName = uppercamelcase(componentname);
const PackagePath = path.resolve(__dirname, '../../packages', componentname);
const Files = [
  {
    filename: 'src/main.vue',
    content: `<template>
  <div class="sh-${componentname}"></div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';

export default {
  name: 'Sh${ComponentName}',
  mixins: [common, emitter],
  data() {
    return {};
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      // ...
    }
  }
};
</script>`
  },
  {
    filename: path.join('../../examples/docs/zh-CN', `${componentname}.md`),
    content: `## ${ComponentName} ${chineseName}

### 基本用法

:::demo 

\`\`\`html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
    </sh-map-earth>
  </sh-config-provider>
</div>
\`\`\`
:::

### Attributes
| 参数      |  属性类型    | 类型      | 可选值     | 默认值   |        说明       |
|---------- |------------|-------- |---------- |------------ |----------------- |

### Events
| 事件名称 | 说明    | 回调参数  |
|--------- |-------- |---------- |

### Methods
| 参数      | 说明    |  参数   |
|---------- |-------- |-------- |`
  },
  {
    filename: path.join(
      '../../packages/theme-chalk/src',
      `${componentname}.scss`
    ),
    content: `@import "mixins/mixins";
@import "common/var";

@include b(${componentname}) {
}`
  },
  {
    filename: path.join('../../types', `${componentname}.d.ts`),
    content: `import { ShineGisClient23DComponent } from './component'

/** ${ComponentName} Component */
export declare class Sh${ComponentName} extends ShineGisClient23DComponent {
}`
  }
];

inquirer
  .prompt([
    {
      name: 'confirm',
      type: 'confirm',
      message: '该组件是否需要使用运维端配置信息？',
      default: true
    }
  ])
  .then((res) => {
    if (res.confirm) {
      Files.push({
        filename: 'index.js',
        content: `import ${ComponentName} from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(${ComponentName});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;`
      });
    } else {
      Files.push({
        filename: 'index.js',
        content: `import ${ComponentName} from './src/main';

/* istanbul ignore next */
${ComponentName}.install = function (Vue) {
  Vue.component(${ComponentName}.name, ${ComponentName});
};

export default ${ComponentName};`
      });
    }
    // 添加到 components.json
    const componentsFile = require('../../components.json');
    if (componentsFile[componentname]) {
      console.error(`${componentname} 已存在.`);
      process.exit(1);
    }
    componentsFile[componentname] = `./packages/${componentname}/index.js`;
    fileSave(path.join(__dirname, '../../components.json'))
      .write(JSON.stringify(componentsFile, null, '  '), 'utf8')
      .end('\n');

    // 添加到 index.scss
    const sassPath = path.join(
      __dirname,
      '../../packages/theme-chalk/src/index.scss'
    );
    const sassImportText = `${fs.readFileSync(
      sassPath
    )}@import "./${componentname}.scss";`;
    fileSave(sassPath).write(sassImportText, 'utf8').end('\n');

    // 添加到 shinegis-client-23d.d.ts
    const elementTsPath = path.join(
      __dirname,
      '../../types/shinegis-client-23d.d.ts'
    );

    let elementTsText = `${fs.readFileSync(elementTsPath)}
/** ${ComponentName} Component */
export class ${ComponentName} extends Sh${ComponentName} {}`;

    const index = elementTsText.indexOf('export class') - 2;
    const importString = `import { Sh${ComponentName} } from './${componentname}';`;

    elementTsText =
      elementTsText.slice(0, index) +
      importString +
      '\n' +
      elementTsText.slice(index);

    fileSave(elementTsPath).write(elementTsText, 'utf8').end('\n');

    // 创建 package
    Files.forEach((file) => {
      fileSave(path.join(PackagePath, file.filename))
        .write(file.content, 'utf8')
        .end('\n');
    });

    // 添加到 nav.config.json
    const navConfigFile = require('../../examples/nav.config.json');

    Object.keys(navConfigFile).forEach((lang) => {
      let groups = navConfigFile[lang][2].groups;
      groups[groups.length - 1].list.push({
        path: `/${componentname}`,
        title:
          lang === 'zh-CN' && componentname !== chineseName
            ? `${ComponentName} ${chineseName}`
            : ComponentName,
        disabled: true
      });
    });

    fileSave(path.join(__dirname, '../../examples/nav.config.json'))
      .write(JSON.stringify(navConfigFile, null, '  '), 'utf8')
      .end('\n');

    console.log('DONE!');
  });
