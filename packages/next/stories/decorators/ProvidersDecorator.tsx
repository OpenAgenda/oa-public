import Providers from 'Providers';

export default function ProvidersDecorator(
  Story,
  { loaded: { intlMessages }, args: { locale = 'fr' } },
) {
  return (
    <Providers locale={locale} intlMessages={intlMessages}>
      <Story />
    </Providers>
  );
}
