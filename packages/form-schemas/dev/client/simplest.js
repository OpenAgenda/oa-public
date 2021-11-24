import React from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

import { schema } from '../schemas/simplest';

if (module.hot) module.hot.accept();

render(
  <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
    <div className="row margin-v-md margin-h-sm">
      <FormSchemaComponent
        lang="fr"
        schema={schema}
      />
    </div>
  </div>, document.getElementById('app')
);
