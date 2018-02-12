"use strict";

import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from './FormSchemaComponent';

export default class Main extends Component {

  constructor( props ) {

    super( props );

    this.state = {};

  }

  render() {

    return <div className="container wsq top-margined">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...this.props } />
      </div>
    </div>

  }

}

Main.propTypes = {
  res: PropTypes.object,
  lang: PropTypes.string.isRequired,
  formSchema: PropTypes.object.isRequired
}

Main.defaultProps = {
  res: {},
  lang: 'en'
}

const config = JSON.parse( document.getElementById( 'config' ).innerHTML );

render( <Main {...config} />, document.getElementById( 'app' ) );
