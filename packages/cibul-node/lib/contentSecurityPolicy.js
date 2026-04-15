import helmet from 'helmet';

export const defaultDirectives = {
  baseUri: ["'none'"],
  defaultSrc: ["'none'"],
  frameAncestors: ["'self'"],
  fontSrc: ["'self'", 'https://cdn.openagenda.com/static/'],
  imgSrc: [
    "'self'",
    'https:',
    'data:',
    'blob:',
    (req) => {
      const { matomoCloudId } = req.app.core.getConfig();
      return matomoCloudId ? `https://${matomoCloudId}` : '';
    },
  ],
  // styleSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://cdn.openagenda.com',
    // "'strict-dynamic'",
    // (req, res) => `'nonce-${res.locals.cspNonce}'`,
  ],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", 'https:', 'data:'],
  frameSrc: [
    "'self'",
    'https://service.mtcaptcha.com',
    'https://service2.mtcaptcha.com',
  ],
  scriptSrc: [
    'https:', // backward compatibility
    "'unsafe-inline'", // backward compatibility
    "'strict-dynamic'",
    (req, res) => `'nonce-${res.locals.cspNonce}'`,
    ...process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [],
  ],
  connectSrc: [
    "'self'",
    (req) => {
      const { matomoCloudId } = req.app.core.getConfig();
      return matomoCloudId ? `https://${matomoCloudId}` : '';
    },
  ].concat(
    process.env.DEV_SERVER_PORT
      ? [
        (req) =>
          `wss://${req.app.core.getConfig().domain}:${process.env.DEV_SERVER_PORT}`,
      ]
      : [],
  ),
  scriptSrcAttr: ["'none'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: [],
  blockAllMixedContent: [],
  reportTo: ['default'],
  reportUri: [(req) => `${req.app.core.getConfig().root}/reports`], // for firefox, the new IE
};

export default (directives = defaultDirectives) =>
  helmet.contentSecurityPolicy({
    reportOnly: false,
    useDefaults: false,
    directives,
  });
