"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

const devApps = [ {
  name: 'A form',
  description: 'This is the dev app before it was split. It shows a form with mixed fields',
  link: '/form'
}, {
  name: 'A textarea',
  description: 'A form with a textarea field',
  link: '/textarea'
} ]

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    return <div className="margin-top-lg container col-lg-offset-1 col-lg-10">
      
      <div className="row margin-v-lg">
        <h1>Development pages index</h1>
      </div>

      <div className="row">
      {devApps.map( app => 
        <div className="col-lg-3">
          <div className="wsq padding-v-sm padding-h-md">
            <label>{app.name}</label>
            <p>{app.description}</p>
            <a href={app.link}>Open</a>
          </div>
        </div>
      )}
      </div>

    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );