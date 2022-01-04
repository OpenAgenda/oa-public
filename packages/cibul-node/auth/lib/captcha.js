'use strict';

const _ = require('lodash');
const config = require('../../config');

function load(req, res, next) {
  if (config.mtCaptcha.enabled) {
    if (!req.baseData) req.baseData = {};

    _.merge(req.baseData, {
      head: {
        js: {
          mtCaptcha: {
            src: `https://service.mtcaptcha.com/mtcv1/client/mtcaptcha.min.js`,
            async: true,
            defer: true,
          },
          mtCaptcha2: {
            src: `https://service2.mtcaptcha.com/mtcv1/client/mtcaptcha2.min.js`,
            async: true,
            defer: true,
          },
        },
      },
      bottom: {
        scripts: [
          ...(_.get(req.baseData, 'bottom.scripts') || []),
          `var mtcaptchaConfig = {
            "sitekey": "${config.mtCaptcha.siteKey}",
            "renderQueue": ["mtcaptcha-local"],
            "autoFormValidate": true,
            "lang": "${req.lang}"
          };`,
        ],
      },
      mtCaptchaEnabled: config.mtCaptcha.enabled,
    });
  }

  if (typeof next === 'function') {
    next();
  }
}

module.exports = { load };
