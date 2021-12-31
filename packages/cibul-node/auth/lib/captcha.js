'use strict';

const _ = require('lodash');
const axios = require('axios');
const { render } = require( './utils' );
const config = require('../../config');

const renderSignup = render('auth/signup', {
  optionals: {},
  full_name: '',
  email: '',
  password: '',
  repeat: '',
  message: '',
  errors: {}
});

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
            "renderQueue": ["mtcaptcha-local", "mtcaptcha-fb", "mtcaptcha-twitter", "mtcaptcha-google"],
            "autoFormValidate": true,
            "lang": "${req.lang}"
          };
          
          var onSuccessRecaptcha = function(response) {
            var errorDivs = document.getElementsByClassName('recaptcha-error');
            if (errorDivs.length) {
              errorDivs[0].className = '';
            }
            var errorMsgs = document.getElementsByClassName('recaptcha-error-message');
            if (errorMsgs.length) {
              errorMsgs[0].parentNode.removeChild(errorMsgs[0]);
            }
            document.getElementById('signup-form').submit();
          }

          var onFacebookSubmit = function(token) {
            document.getElementById('signup-facebook').submit();
          }

          var onTwitterSubmit = function(token) {
            document.getElementById('signup-twitter').submit();
          }

          var onGoogleSubmit = function(token) {
            document.getElementById('signup-google').submit();
          }

          var onloadCaptchaCallback = function() {
            grecaptcha.render('signup-recaptcha', {
              'sitekey': '${config.reCaptcha.v2.key}'
            });
            grecaptcha.render('signup-facebook-button', {
              'sitekey': '${config.reCaptcha.v2Invisible.key}',
              'callback': onFacebookSubmit
            });
            grecaptcha.render('signup-twitter-button', {
              'sitekey': '${config.reCaptcha.v2Invisible.key}',
              'callback': onTwitterSubmit
            });
            grecaptcha.render('signup-google-button', {
              'sitekey': '${config.reCaptcha.v2Invisible.key}',
              'callback': onGoogleSubmit
            });
          }`,
        ],
      },
      mtCaptchaEnabled: config.mtCaptcha.enabled,
      // TODO remove
      reCaptchaEnabled: config.reCaptcha.enabled,
      reCaptchaV3Key: config.reCaptcha.v3.key,
      reCaptchaV2Key: config.reCaptcha.v2.key,
      reCaptchaV2InvisibleKey: config.reCaptcha.v2Invisible.key,
    });
  }

  if (typeof next === 'function') {
    next();
  }
}

function socialCheck(service) {
  return async (req, res, next) => {
    if (!config.reCaptcha.enabled) return next();

    const response = req.body['g-recaptcha-response'];
    const remoteIp = req.header('x-forwarded-for');
    const verifyBaseUrl = config.reCaptcha.verify;
    const secret = config.reCaptcha.v2Invisible.secret;

    const verifyUrl = `${verifyBaseUrl}?secret=${secret}&response=${response}&remoteip=${remoteIp}`;

    try {
      const result = await axios.get(verifyUrl);

      if (!result.data.success) {
        throw new Error('BadCaptcha');
      }
    } catch (err) {
      load(req, res, _.noop);

      return renderSignup(req, res, {
        errors: {
          [`${service}Uid`]: 'captchaTryAgain'
        }
      });
    }

    next();
  }
}

module.exports = {
  load,
  socialCheck
};
