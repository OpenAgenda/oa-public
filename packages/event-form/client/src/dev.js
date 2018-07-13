"use strict";

import React, { Component } from 'react';
import { render } from 'react-dom';

if ( module.hot ) module.hot.accept();

import EventForm from './';

class Main extends Component {

  render() {

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <EventForm />
      </div>
    </div>


  }

}

render( <Main />, document.getElementById( 'app' ) );