"use strict";

import React, { Component } from 'react';
import { render } from 'react-dom';

if ( module.hot ) module.hot.accept();

import EventForm from './';

console.log( '***** CHANGE ******' );

class Main extends Component {

  render() {

    return <div className="container top-margined col-lg-offset-3 col-lg-6 col-md-offset-2 col-md-8 col-sm-12 oa-col-canvas">
      <div className="row margin-v-md margin-h-sm">
        <EventForm
          locationRes={{
            index: '/locations',
            geocode: '/locations/geocode',
            set: '/locations',
            remove: '/locations/remove'
          }}
          lang="fr"
          classNames={{
            fieldsCanvas: 'padding-all-md wsq',
            bottomErrorsCanvas: 'error-summary padding-h-sm',
            bottomActionsCanvas: 'padding-all-md wsq'
          }}
          values={{
            title: {
              fr: 'Inauguration d\'un formulaire',
//              en: 'A form inauguration'
            },
            locationUid: 93105902,
            accessibility: { hi: true, sl: true }
          }}
        />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
