import Providers from 'Providers';
import DateFnsLocaleProvider from 'components/DateFnsLocaleProvider';

export default function ProvidersDecorator(Story, { loaded: { intlMessages }, args: { locale = 'fr' } }) {
  return (
    <Providers locale={locale} intlMessages={intlMessages}>
      <DateFnsLocaleProvider>
        <Story />
      </DateFnsLocaleProvider>
    </Providers>
  );
}
