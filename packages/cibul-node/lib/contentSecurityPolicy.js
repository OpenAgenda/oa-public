'use strict';

const helmet = require('helmet');

const defaultDirectives = {
  baseUri: ["'none'"],
  defaultSrc: ["'none'"],
  frameAncestors: ["'none'"],
  fontSrc: [
    "'self'",
    'https://s3.eu-central-1.amazonaws.com/oastatic/',
    'https://oastatic.s3.eu-central-1.amazonaws.com/',
  ],
  imgSrc: [
    "'self'",
    'https:',
    'data:',
    'blob:',
    req => {
      const { matomoCloudId } = req.app.core.getConfig();
      return matomoCloudId ? `https://${matomoCloudId}` : '';
    },
  ],
  // styleSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    // "'strict-dynamic'",
    // (req, res) => `'nonce-${res.locals.cspNonce}'`,
  ],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", 'https:', 'data:'],
  frameSrc: ["'self'", 'https://service.mtcaptcha.com', 'https://service2.mtcaptcha.com'],
  scriptSrc: [
    'https:', // backward compatibility
    "'unsafe-inline'", // backward compatibility
    "'strict-dynamic'",
    (req, res) => `'nonce-${res.locals.cspNonce}'`,
    ...process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [],
  ],
  connectSrc: [
    "'self'",
    req => {
      const { matomoCloudId } = req.app.core.getConfig();
      return matomoCloudId ? `https://${matomoCloudId}` : '';
    },
  ]
    .concat(process.env.DEV_SERVER_PORT ? [
      req => `wss://${req.app.core.getConfig().domain}:${process.env.DEV_SERVER_PORT}`,
    ] : []),
  scriptSrcAttr: ["'none'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: [],
  blockAllMixedContent: [],
  reportTo: ['default'],
  reportUri: [req => `${req.app.core.getConfig().root}/reports`], // for firefox, the new IE
};

module.exports = (directives = defaultDirectives) => helmet.contentSecurityPolicy({
  reportOnly: false,
  useDefaults: false,
  directives,
});

module.exports.defaultDirectives = defaultDirectives;
