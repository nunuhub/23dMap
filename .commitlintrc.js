const execSync = require('child_process').execSync;
const fg = require('fast-glob');

const getPackages = (packagePath) =>
  fg.sync('*', { cwd: packagePath, onlyDirectories: true });

const scopes = [
  ...getPackages('packages'), // 组件
  ...getPackages('src'), // 核心
  'build', // 项目构建
  'project', // 整体项目
  'examples', // 示例网站
  'other' // 其他
];

const gitStatus = execSync('git status --porcelain || true')
  .toString()
  .trim()
  .split('\n');

const packagesScopeComplete = gitStatus
  .find((r) => ~r.indexOf('M  packages'))
  ?.replace(/\//g, '%%')
  ?.match(/packages%%((\w|-)*)/)?.[1];

const srcScopeComplete = gitStatus
  .find((r) => ~r.indexOf('M  src'))
  ?.replace(/\//g, '%%')
  ?.match(/src%%((\w|-)*)/)?.[1];

module.exports = {
  rules: {
    'scope-empty': [2, 'never'],
    /**
     * type[scope]: [function] description
     *      ^^^^^
     */
    'scope-enum': [2, 'always', scopes],
    /**
     * type[scope]: [function] description
     *
     * ^^^^^^^^^^^^^^ empty line.
     * - Something here
     */
    'body-leading-blank': [1, 'always'],
    /**
     * type[scope]: [function] description
     *
     * - something here
     *
     * ^^^^^^^^^^^^^^
     */
    'footer-leading-blank': [1, 'always'],
    /**
     * type[scope]: [function] description [No more than 72 characters]
     *      ^^^^^
     */
    'header-max-length': [2, 'always', 72],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      1,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    /**
     * type[scope]: [function] description
     * ^^^^
     */
    'type-enum': [
      2,
      'always',
      [
        'chore',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'release',
        'style',
        'test',
      ]
    ]
  },
  prompt: {
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixsSelect: '选择关联issue前缀（可选）:',
      customFooterPrefixs: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      confirmCommit: '是否提交或修改commit ?'
    },
    types: [
      { value: 'feat', name: 'feat:     新增功能 | A new feature' },
      { value: 'fix', name: 'fix:      修复缺陷 | A bug fix' },
      {
        value: 'docs',
        name: 'docs:     文档更新 | Documentation only changes'
      },
      {
        value: 'style',
        name: 'style:    代码格式 | Changes that do not affect the meaning of the code'
      },
      {
        value: 'refactor',
        name: 'refactor: 代码重构 | A code change that neither fixes a bug nor adds a feature'
      },
      { value: 'perf',
        name: 'perf:     性能提升 | A code change that improves performance'
      },
      {
        value: 'chore',
        name: 'chore:    构建过程或辅助工具的变动 | Changes that affect the build system or external dependencies'
      }
    ],
    allowEmptyIssuePrefixs: false,
    allowCustomIssuePrefixs: false,
    allowCustomScopes: false,
    allowEmptyScopes: false,
    defaultScope: packagesScopeComplete || srcScopeComplete,
  }
};
