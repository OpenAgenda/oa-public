"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    return <div>
      <p>The main component</p>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );