import type { Metadata } from 'next';
import { getLocaleValue } from '@openagenda/intl';
import * as metas from 'config/metas';
import getLocale from 'app/utils/getLocale';
import ExampleContent from './ExampleContent';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: 'Example | OpenAgenda',
    description: getLocaleValue(metas.description, locale),
  };
}

export default function ExamplePage() {
  return <ExampleContent />;
}
