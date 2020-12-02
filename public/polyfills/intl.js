'use strict';
/* eslint-disable */

var globalThis = require('globalthis');

if (typeof globalThis.Intl === 'undefined') {
  globalThis.Intl = require('intl');
  require('intl/locale-data/jsonp/en');
}

require('@formatjs/intl-getcanonicallocales/polyfill');

require('@formatjs/intl-locale/polyfill');

require('@formatjs/intl-pluralrules/polyfill');
require('@formatjs/intl-pluralrules/locale-data/en');

require('@formatjs/intl-displaynames/polyfill');
require('@formatjs/intl-displaynames/locale-data/en');

require('@formatjs/intl-listformat/polyfill');
require('@formatjs/intl-listformat/locale-data/en');

require('@formatjs/intl-numberformat/polyfill');
require('@formatjs/intl-numberformat/locale-data/en');

require('@formatjs/intl-relativetimeformat/polyfill');
require('@formatjs/intl-relativetimeformat/locale-data/en');

// require('@formatjs/intl-datetimeformat/polyfill');
// require('@formatjs/intl-datetimeformat/locale-data/en');

