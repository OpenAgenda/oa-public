import {
  mergeLocales,
  getFallbackChain,
  getFallbackedMessages,
  createIntlByLocale,
} from '@openagenda/intl';
import * as filtersLocales from '@openagenda/react-filters/locales';

function getIntl(intlByLocale, lang) {
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

function handlebarsHelper(intlByLocale) {
  return function formatMessageHelper(code, { data, hash: values }) {
    const intl = getIntl(intlByLocale, data.root.lang);

    return values === true
      ? intl.messages[code]
      : intl.formatMessage({ id: code }, values);
  };
}

export default async (path) => {
  const userLocales = (await import(path)).default;
  const locales = getFallbackedMessages(
    mergeLocales(filtersLocales, userLocales),
  );
  const intlByLocale = createIntlByLocale(locales);

  return {
    intlByLocale,
    handlebarsHelper: handlebarsHelper(intlByLocale),
  };
};
