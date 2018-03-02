"use strict";

import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from './FormSchemaComponent';

if ( module.hot ) module.hot.accept();

export default class Main extends Component {

  constructor( props ) {

    super( props );

    this.state = {};

  }

  render() {

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...this.props } />
      </div>
    </div>

  }

}

Main.propTypes = {
  res: PropTypes.object,
  lang: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired
}

Main.defaultProps = {
  res: {
    post: ''
  },
  lang: 'en'
}

const config = JSON.parse( document.getElementById( 'config' ).innerHTML );

render( <Main {...config} />, document.getElementById( 'app' ) );
