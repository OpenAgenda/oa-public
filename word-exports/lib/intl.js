import { createIntlByLocale, getFallbackChain } from '@openagenda/intl';
import * as locales from '../locales-compiled/index.js';

const intlByLocale = createIntlByLocale(locales);

export default function getIntl(lang) {
  const fallback = getFallbackChain(lang).find((l) => intlByLocale[l]);

  return intlByLocale[fallback ?? 'en'];
}
