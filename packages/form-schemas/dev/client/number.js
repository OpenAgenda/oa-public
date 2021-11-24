import React from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

render((() => {
  const props = {
    res: {
      post: '',
      redirect: '/'
    },
    lang: 'fr',
    values: {
      afieldwithavalue: 0
    },
    schema: {
      fields: [{
        field: 'anumberfield',
        fieldType: 'number',
        label: 'Type a number',
        max: 100,
        min: 50
      }, {
        field: 'afieldwithavalue',
        fieldType: 'number',
        label: 'Should load with a 0'
      }]
    }
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A number and an integer</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
})(), document.getElementById('app'));
