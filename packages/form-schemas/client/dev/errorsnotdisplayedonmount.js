"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../src/';

import { schema } from '../../dev/simplest';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      values: {
        conditions: ''
      },
      withErrors: false, // default value
      schema: {
        "fields" : [ {
          field : "conditions",
          fieldType : "text",
          required: true,
          min: 12,
          label : 'Ce schema a la props withErrors a false',
          sub : 'Tel format est accepté'
        } ]
      }
    };

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
