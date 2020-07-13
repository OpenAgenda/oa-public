'use strict';

const globalThis = require('globalthis')();

globalThis.Intl = require('intl');

/* eslint-disable global-require */
require('@formatjs/intl-getcanonicallocales/polyfill');
require('@formatjs/intl-locale/polyfill');
require('@formatjs/intl-pluralrules/polyfill');
require('@formatjs/intl-displaynames/polyfill');
require('@formatjs/intl-listformat/polyfill');
require('@formatjs/intl-numberformat/polyfill');
require('@formatjs/intl-relativetimeformat/polyfill');
require('@formatjs/intl-datetimeformat/polyfill');
