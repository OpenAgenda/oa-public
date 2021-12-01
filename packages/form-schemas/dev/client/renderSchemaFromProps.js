import React from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

function renderSchemaFromProps(props) {
  render(
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A single required choice field</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>,
    document.getElementById('app')
  );
}

export default renderSchemaFromProps;
