'use strict';

const _ = require('lodash');

function middleware(options, req, res, next) {
  const { mainScript } = {
    mainScript: 'main.js',
    ...(options || {})
  };

  const stylesheets = [`${req.app.locals.assetsRoot}/main.css`].map(s => ({
    href: s
  }));

  const topScripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js'
  ];

  const bottomScripts = [
    `${req.app.locals.assetsRoot}/js/${mainScript}`,
    'https://cdnjs.cloudflare.com/ajax/libs/spin.js/2.3.2/spin.js',
    `${req.app.locals.assetsRoot}/jquery.spin.js`
  ];

  if (req.app.locals.iframable) {
    bottomScripts.push(
      `${req.app.locals.assetsRoot}/js/iframeResizeContent.js`
    );
  }

  if (process.env.NODE_ENV === 'development') {
    bottomScripts.push(process.env.BROWSER_REFRESH_URL);
  }

  req.data = _.assign(req.data || {}, {
    stylesheets,
    scripts: {
      top: topScripts.map(src => ({ src })),
      bottom: bottomScripts.map(src => ({ src }))
    }
  });

  next();
}

module.exports = Object.assign(middleware.bind(null, {}), {
  withOptions: options => middleware.bind(null, options)
});
