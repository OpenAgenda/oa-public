import _ from 'lodash';

function middleware(options, req, res, next) {
  const { mainScript, iframable } = {
    mainScript: 'main.js',
    iframable: req.app.locals.iframable,
    ...options || {},
  };

  const stylesheets = [`${req.app.locals.assetsRoot}/dist/main.css`].map(
    (s) => ({
      href: s,
    }),
  );

  const topScripts = [
    // 'https://cdnjs.cloudflare.com/ajax/libs/spin.js/2.3.2/spin.js',
    // 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    // 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js',
  ];

  const bottomScripts = [
    `${req.app.locals.assetsRoot}/js/${mainScript}`,
    `${req.app.locals.assetsRoot}/spin.js`,
    `${req.app.locals.assetsRoot}/jquery.spin.js`,
    `${req.app.locals.assetsRoot}/dist/main.js`,
  ];

  if (iframable) {
    bottomScripts.push(
      `${req.app.locals.assetsRoot}/js/iframeResizeContent.js`,
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // bottomScripts.push(`${req.app.locals.assetsRoot}/dev.js`);
    bottomScripts.push(process.env.BROWSER_REFRESH_URL);
  }

  req.data = _.assign(req.data || {}, {
    stylesheets,
    scripts: {
      top: topScripts.map((src) => ({ src })),
      bottom: bottomScripts.map((src) => ({ src })),
    },
  });

  next();
}

export default Object.assign(middleware.bind(null, {}), {
  withOptions: (options) => middleware.bind(null, options),
});
