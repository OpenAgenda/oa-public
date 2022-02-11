import React from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

const props = {
  res: {
    post: '',
    redirect: '/'
  },
  lang: 'fr',
  schema: {
    fields: [{
      field: 'singlelangfield',
      fieldType: 'textarea',
      label: {
        fr: 'C\'est un champ avec une langue'
      },
      info: {
        fr: 'Le texte info'
      },
      sub: {
        fr: 'Le texte dessous'
      },
      max: 10000
    }, {
      field: 'multilangfield',
      fieldType: 'textarea',
      languages: ['fr', 'en'],
      optional: false,
      label: {
        fr: 'Un champ multilingue'
      },
      info: {
        fr: 'Le texte info'
      },
      placeholder: {
        fr: 'Une courte description de votre événement'
      },
      sub: {
        fr: 'Le texte dessous'
      },
      max: 400
    }]
  }
};

render(
  <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
    <div className="row margin-v-md margin-h-sm">
      <p>Here we have two textarea fields. One simple, one multilingual</p>
      <FormSchemaComponent {...props} />
    </div>
  </div>,
  document.getElementById('app')
);
