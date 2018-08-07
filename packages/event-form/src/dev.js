"use strict";

import React, { Component } from 'react';
import { render } from 'react-dom';

if ( module.hot ) module.hot.accept();

import EventForm from './';

console.log( '***** CHANGE ******' );

class Main extends Component {

  render() {

    return <div className="container wsq top-margined col-lg-offset-3 col-lg-6 col-md-offset-2 col-md-8 col-sm-12 oa-col-canvas">
      <div className="row margin-v-md margin-h-sm">
        <EventForm
          lang="fr"
          values={{
            title: {
              fr: 'Inauguration d\'un formulaire',
              en: 'A form inauguration'
            },
            locationUid: 93105902
          }}
        />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );