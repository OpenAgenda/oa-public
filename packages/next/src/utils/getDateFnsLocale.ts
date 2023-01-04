import { getFallbackChain } from '@openagenda/intl';

export default async function getDateFnsLocale(locale) {
  const fallbacks = getFallbackChain(locale);

  for (const l of fallbacks) {
    try {
      return await import(`date-fns/locale/${l}/index.js`);
    } catch {
      //
    }
  }
}
