import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../src/index';

import { schema } from '../../dev/simplest';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      lang: 'fr',
      schema: {
        fields : [ {
          field : "anything",
          fieldType : "text",
          optional : false,
          label : "A word"
        }, {
          field: 'conditioned',
          fieldType : 'text',
          label: 'This is only enabled if first field is typed',
          enableWith: 'anything'
        } ]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
