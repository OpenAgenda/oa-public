'use strict';

const helmet = require('helmet');

const defaultDirectives = {
  baseUri: ["'none'"],
  defaultSrc: ["'none'"],
  frameAncestors: ["'none'"],
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com',
    'https://s3.eu-central-1.amazonaws.com/oastatic/',
  ],
  imgSrc: ["'self'", 'https:', 'data:', 'blob:'],
  // styleSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    // "'strict-dynamic'",
    // (req, res) => `'nonce-${res.locals.cspNonce}'`,
    'https://fonts.googleapis.com',
  ],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", 'https:', 'data:'],
  frameSrc: [
    "'self'",
    'https://www.youtube.com',
    'https://player.vimeo.com',
    'https://v.calameo.com',
    'https://w.soundcloud.com',
    'https://docs.google.com',
    'https://www.dailymotion.com',
    'https://drive.google.com',
    'https://player.allocine.fr',
    'https://cdn.iframe.ly',
    'https://www.google.com',
    'https://maps.google.com',
    'https://prezi.com',
    'https://player.twitch.tv',
    'https://livemap.getwemap.com',
    'https://www.arte.tv',
    'https://vimeo.com',
    'https://platform.twitter.com',
  ],
  scriptSrc: [
    "'self'",
    // "'unsafe-inline'",
    "'strict-dynamic'",
    (req, res) => `'nonce-${res.locals.cspNonce}'`,
    // 'https://code.jquery.com',
    // 'https://maxcdn.bootstrapcdn.com',
    // 'https://client.crisp.chat',
  ],
  connectSrc: ["'self'"]
    .concat(process.env.DEV_SERVER_PORT ? [
      req => `wss://${req.app.core.getConfig().domain}:${process.env.DEV_SERVER_PORT}`,
    ] : []),
  scriptSrcAttr: ["'none'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: [],
  blockAllMixedContent: [],
  reportTo: ['default'],
};

module.exports = (directives = defaultDirectives) => helmet.contentSecurityPolicy({
  reportOnly: true,
  useDefaults: false,
  directives,
});

module.exports.defaultDirectives = defaultDirectives;
