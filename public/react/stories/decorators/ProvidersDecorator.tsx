import { SWRConfig } from 'swr';
import ky from 'ky';
import { IntlProvider } from 'react-intl';
import { UIKitProvider } from '@openagenda/uikit';
import type { Decorator } from '@storybook/react-webpack5';

const fetcher = (input: string | URL | Request): Promise<unknown> =>
  ky(input).json();

const ProvidersDecorator: Decorator = (Story, { loaded, args }) => {
  const { intlMessages } = loaded as { intlMessages?: Record<string, string> };
  const { locale = 'fr' } = args as { locale?: string };
  return (
    <UIKitProvider>
      <IntlProvider key={locale} locale={locale} messages={intlMessages}>
        <SWRConfig value={{ fetcher }}>
          <Story />
        </SWRConfig>
      </IntlProvider>
    </UIKitProvider>
  );
};

export default ProvidersDecorator;
