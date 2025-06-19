import { SWRConfig } from 'swr';
import ky from 'ky';
import { IntlProvider } from 'react-intl';
import { UIKitProvider } from '@openagenda/uikit';

const fetcher = (input: string | URL | Request) => ky(input).json();

export default function ProvidersDecorator(
  Story,
  { loaded: { intlMessages }, args: { locale = 'fr' } },
) {
  return (
    <UIKitProvider>
      <IntlProvider key={locale} locale={locale} messages={intlMessages}>
        <SWRConfig value={{ fetcher }}>
          <Story />
        </SWRConfig>
      </IntlProvider>
    </UIKitProvider>
  );
}
