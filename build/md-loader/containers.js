const mdContainer = require('markdown-it-container');

module.exports = (md) => {
  md.use(mdContainer, 'demo', {
    validate(params) {
      return params.trim().match(/^demo\s*(.*)$/);
    },
    render(tokens, idx) {
      const componentName = tokens[1].content;
      let examplesName = '';

      for (let i = idx - 1; i > 0; i--) {
        if (
          tokens[i].nesting === 0 &&
          tokens[i].type === 'inline' &&
          tokens[i - 1].markup === '###'
        ) {
          examplesName = tokens[i].content;
          break;
        }
      }

      const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/);
      if (tokens[idx].nesting === 1) {
        const description = m && m.length > 1 ? m[1] : '';
        const content =
          tokens[idx + 1].type === 'fence' ? tokens[idx + 1].content : '';
        return `<demo-block componentName="${componentName}" examplesName="${examplesName}">
        ${description ? `<div>${md.render(description)}</div>` : ''}
        <!--element-demo: ${content}:element-demo-->
        `;
      }
      return '</demo-block>';
    }
  });

  md.use(mdContainer, 'tip');
  md.use(mdContainer, 'warning');
};
