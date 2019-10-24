import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'dom4';
import '@openagenda/pepjs';
import 'intl';

/* eslint-disable global-require */

if (!Intl.PluralRules) {
  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/dist/locale-data/en'); // Add locale data for en
  require('@formatjs/intl-pluralrules/dist/locale-data/fr'); // Add locale data for fr
  require('@formatjs/intl-pluralrules/dist/locale-data/de'); // Add locale data for de
  require('@formatjs/intl-pluralrules/dist/locale-data/br'); // Add locale data for br
}

if (!Intl.RelativeTimeFormat) {
  require('@formatjs/intl-relativetimeformat/polyfill');
  require('@formatjs/intl-relativetimeformat/dist/locale-data/en'); // Add locale data for en
  require('@formatjs/intl-relativetimeformat/dist/locale-data/fr'); // Add locale data for fr
  require('@formatjs/intl-relativetimeformat/dist/locale-data/de'); // Add locale data for de
  require('@formatjs/intl-relativetimeformat/dist/locale-data/br'); // Add locale data for br
}
