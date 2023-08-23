import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useIntl } from 'react-intl';
import { getFallbackChain } from '@openagenda/intl';
import context from 'contexts/dateFnsLocale';

async function createProvider(value) {
  function Provider({ children }) {
    return <context.Provider value={value.default || value}>{children}</context.Provider>;
  }
  return Provider;
}

const byLangs = {
  // en: dynamic(() => import('date-fns/locale/en/index').then(createProvider)),
  fr: dynamic(() => import('date-fns/locale/fr/index').then(createProvider)),
  de: dynamic(() => import('date-fns/locale/de/index').then(createProvider)),
  it: dynamic(() => import('date-fns/locale/it/index').then(createProvider)),
  es: dynamic(() => import('date-fns/locale/es/index').then(createProvider)),
  // br: dynamic(() => import('date-fns/locale/br/index').then(createProvider)),
  ca: dynamic(() => import('date-fns/locale/ca/index').then(createProvider)),
  eu: dynamic(() => import('date-fns/locale/eu/index').then(createProvider)),
  oc: dynamic(() => import('date-fns/locale/oc/index').then(createProvider)),
};

const DateFnsLocaleProvider = ({ children }) => {
  const { locale } = useIntl();

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
