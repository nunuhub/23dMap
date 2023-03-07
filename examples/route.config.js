import navConfig from './nav.config';
import jsapiNavConfig from './jsapi-nav.config.json';
// import gaNavConfig from './ga-nav.config';
import langs from './i18n/route';

const LOAD_MAP = {
  'zh-CN': (name) => {
    return (r) =>
      require.ensure(
        [],
        () => r(require(`./pages/zh-CN/${name}.vue`)),
        'zh-CN'
      );
  }
};

const load = function (lang, path) {
  return LOAD_MAP[lang](path);
};

const LOAD_DOCS_MAP = {
  'zh-CN': (base, path) => {
    const docsPath = base === 'component' ? 'docs' : `docs-${base}`;
    const completePath = `./${docsPath}/zh-CN${path}`;
    return (r) =>
      require.ensure([], () => r(require(`${completePath}.md`)), 'zh-CN');
  }
};

const loadDocs = function (lang, base, path) {
  return LOAD_DOCS_MAP[lang](base, path);
};

const registerRoute = (navConfig, base = 'component') => {
  let route = [];
  Object.keys(navConfig).forEach((lang, index) => {
    let navs = navConfig[lang];
    route.push({
      path: `/${lang}/${base}`,
      redirect: `/${lang}/${base}/installation`,
      component: load(lang, base),
      children: []
    });
    navs.forEach((nav) => {
      if (nav.href) return;
      if (nav.groups) {
        nav.groups.forEach((group) => {
          group.list.forEach((nav) => {
            addRoute(nav, lang, base, index);
          });
        });
      } else if (nav.children) {
        nav.children.forEach((nav) => {
          addRoute(nav, lang, base, index);
        });
      } else {
        addRoute(nav, lang, base, index);
      }
    });
  });
  function addRoute(page, lang, base, index) {
    const component =
      page.path === '/changelog'
        ? load(lang, 'changelog')
        : loadDocs(lang, base, page.path);
    let child = {
      path: page.path.slice(1),
      meta: {
        title: page.title || page.name,
        description: page.description,
        lang
      },
      name: `${base}-` + lang + (page.title || page.name),
      component: component.default || component
    };

    route[index].children.push(child);
  }

  return route;
};

let route = registerRoute(navConfig);
route = route.concat(registerRoute(jsapiNavConfig, 'jsapi'));
// route = route.concat(registerRoute(gaNavConfig, 'ga'));

const generateMiscRoutes = function (lang) {
  // let guideRoute = {
  //   path: `/${lang}/guide`, // 指南
  //   redirect: `/${lang}/guide/design`,
  //   component: load(lang, 'guide'),
  //   children: [
  //     {
  //       path: 'design', // 设计原则
  //       name: 'guide-design' + lang,
  //       meta: { lang },
  //       component: load(lang, 'design')
  //     },
  //     {
  //       path: 'nav', // 导航
  //       name: 'guide-nav' + lang,
  //       meta: { lang },
  //       component: load(lang, 'nav')
  //     }
  //   ]
  // };

  // let resourceRoute = {
  //   path: `/${lang}/resource`, // 资源
  //   meta: { lang },
  //   name: 'resource' + lang,
  //   component: load(lang, 'resource')
  // };

  let indexRoute = {
    path: `/${lang}`, // 首页
    meta: { lang },
    name: 'home' + lang,
    component: load(lang, 'index')
  };

  return [indexRoute];
};

langs.forEach((lang) => {
  route = route.concat(generateMiscRoutes(lang.lang));
});

let defaultPath = '/zh-CN';

route = route.concat([
  {
    path: '/playground/*',
    name: 'playground',
    component: (r) =>
      require.ensure(
        [],
        () => r(require('./components/playground.vue')),
        'zh-CN'
      )
  },
  {
    path: '/',
    redirect: defaultPath
  },
  {
    path: '*',
    redirect: defaultPath
  }
]);

export default route;
