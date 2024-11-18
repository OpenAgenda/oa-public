import { createIntlByLocale, getFallbackChain } from '@openagenda/intl';
import * as locales from '../locales-compiled/index.js';

const intlByLocale = createIntlByLocale(locales);

export default function getIntl(lang) {
  const fallbacks = getFallbackChain(lang);
  let intl = intlByLocale[Object.keys(intlByLocale).shift()];

  for (const fallback of fallbacks) {
    if (intlByLocale[fallback]) {
      intl = intlByLocale[fallback];
      break;
    }
  }

  return intl;
}
