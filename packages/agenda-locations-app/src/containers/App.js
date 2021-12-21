import React from 'react';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import locales from '../locales-compiled';

function App({
  route,
  agenda,
  lang
}) {
  return (
    <IntlProvider
      messages={locales[lang]}
      locale={lang}
      key={lang}
    >
      <div>App</div>
      {renderRoutes(route.routes, {
        agenda
      })}
    </IntlProvider>
  );
}

export default App;
