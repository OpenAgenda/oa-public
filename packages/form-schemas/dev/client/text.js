import React from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

render(<div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
  <div className="row margin-v-md margin-h-sm">
    <FormSchemaComponent
      res={{
        post: '',
        redirect: '/'
      }}
      lang="fr"
      schema={{
        fields: [{
          field: 'atextfield',
          fieldType: 'text',
          label: 'Type a bunch of text'
        }, {
          field: 'requiredtextfield',
          fieldType: 'text',
          optional: false,
          label: 'Here too.'
        }]
      }}
    />
  </div>
</div>, document.getElementById('app'));