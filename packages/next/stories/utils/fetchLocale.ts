import appFetchLocale from '@/src/app/locales';
import fetchExternalLocale from '@/src/app/locales/external';

export default async function fetchLocale(locale: string) {
  const [appMessages, externalMessages] = await Promise.all([
    appFetchLocale(locale),
    fetchExternalLocale(locale),
  ]);
  return { ...externalMessages, ...appMessages };
}
