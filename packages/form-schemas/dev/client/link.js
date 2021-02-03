import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {
    const props = {
      lang: 'fr',
      schema: {
        fields: [{
          field: 'anintegerfield',
          fieldType: 'link',
          label: 'Type a link',
        }]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>An optional link</p>
        <FormSchemaComponent { ...props } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
