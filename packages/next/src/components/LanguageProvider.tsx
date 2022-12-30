import { IntlProvider } from 'react-intl';

// const publicUrl = (typeof window !== 'undefined'
//   ? process.env.NEXT_API_INTERNAL_BASE_URL
//   : process.env.NEXT_PUBLIC_ASSET_PREFIX) || '';

// interface ProviderState {
//   isFetching: boolean;
//   currentLanguage: Language;
// }

export function LanguageProvider({ locale, messages, children }) {
  return (
    <IntlProvider key={locale} locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
