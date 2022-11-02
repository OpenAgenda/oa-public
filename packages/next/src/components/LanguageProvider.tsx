import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/router';

// const publicUrl = (typeof window !== 'undefined'
//   ? process.env.NEXT_API_INTERNAL_BASE_URL
//   : process.env.NEXT_PUBLIC_ASSET_PREFIX) || '';

// interface ProviderState {
//   isFetching: boolean;
//   currentLanguage: Language;
// }

export function LanguageProvider({ messages, children }) {
  const { locale } = useRouter();

  return (
    <IntlProvider key={locale} locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
