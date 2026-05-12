import type { Loader } from '@storybook/react-webpack5';

type Fetch = (locale: string) => Promise<any>;

export default function intlMessagesLoader(fetchFn: Fetch): Loader<any> {
  return async ({ args }) => {
    const locale = (args as { locale?: string }).locale ?? 'fr';
    return {
      intlMessages: await fetchFn(locale),
    };
  };
}
