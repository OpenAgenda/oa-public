import React from 'react';

const I18nContext = React.createContext({
  lang: 'fr',
  labels: {},
  getLabel: () => {}
});

export default I18nContext;
