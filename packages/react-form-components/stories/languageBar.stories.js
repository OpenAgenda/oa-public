import React from 'react';
import LanguageBar from '../components/LanguageBar';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'LanguageBar',
  decorators: [
    PageDecorator,
  ],
};

export function Simple() {
  return (
    <LanguageBar
      enabled={[ 'fr' ]}
      languages={[ 'fr', 'en', 'es' ]}
      onChange={function () {
        console.log( arguments );
      }}
    />
  );
}
