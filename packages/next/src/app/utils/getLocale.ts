import { headers } from 'next/headers';
import { DEFAULT_LOCALE } from 'config/constants';

export default async function getLocale(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-locale') || DEFAULT_LOCALE;
}
