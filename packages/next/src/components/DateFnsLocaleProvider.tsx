import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { getFallbackChain } from '@openagenda/intl';
import context from 'contexts/dateFnsLocale';

async function createProvider(promise) {
  const value = (await promise).default;
  function Provider({ children }) {
    return <context.Provider value={value}>{children}</context.Provider>;
  }
  return Provider;
}

const fr = dynamic<{ children: React.ReactNode; }>(() => createProvider(import('date-fns/locale/fr/index')));
const es = dynamic<{ children: React.ReactNode; }>(() => createProvider(import('date-fns/locale/es/index')));

const byLangs = {
  fr,
  es,
};

const DateFnsLocaleProvider = ({ locale, children }) => {
  const Provider = useMemo(() => {
    const fallbacks = getFallbackChain(locale);
    return byLangs[fallbacks.find(l => byLangs[l])];
  }, [locale]);

  if (!Provider) {
    return (
      <context.Provider value={undefined}>
        {children}
      </context.Provider>
    );
  }

  return <Provider>{children}</Provider>;
};

export default DateFnsLocaleProvider;
