"use strict";

import ih from 'immutability-helper';

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
        "fields" : [ {
          "field" : "regularfield",
          "fieldType" : "text",
          "label" : "Un champ sans restriction d'accès"
        }, {
          "field" : "restrictedtoarole",
          "fieldType" : "text",
          "label" : "Un champ restreint au role fourchette",
          "write" : [ "fourchette" ]
        }, {
          "field" : "restrictedtoanotherrole",
          "fieldType" : "text",
          "label" : "Un événement restreint au role couteau",
          "write" : [ "couteau" ]
        }, {
          "field" : "restrictedtobothroles",
          "fieldType" : "text",
          "label" : "Un événement restreint aux rôles couteau et fourchette",
          "write" : [ "couteau", "fourchette" ]
        } ]
      }
    }

    return <div className="container margin-top-lg">
      <h1 className="text-center">Un même schema chargé avec des rôles différents</h1>
      <div className="row margin-v-md margin-h-sm">
        <div className="col col-sm-4 padding-top-sm">
          <div className="wsq padding-all-sm">
            <p>pas de role de chargé</p>
            <FormSchemaComponent { ...props } />
          </div>
        </div>
        <div className="col col-sm-4 padding-top-sm">
          <div className="wsq padding-all-sm">
            <p>role "fourchette" en prop</p>
            <FormSchemaComponent { ...ih( props, { role: { $set: 'fourchette' } } ) } />
          </div>
        </div>
        <div className="col col-sm-4 padding-top-sm">
          <div className="wsq padding-all-sm">
            <p>role "couteau" en prop</p>
            <FormSchemaComponent { ...ih( props, { role: { $set: 'couteau' } } ) } />
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
