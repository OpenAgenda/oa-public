import type { Metadata } from 'next';
import { getLocaleValue } from '@openagenda/intl';
import * as metas from '@/src/config/metas';
import getLocale from '@/src/utils/getLocale';
import ExampleContent from './_components/ExampleContent';

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
