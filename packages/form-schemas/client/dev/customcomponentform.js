"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../src/index';

import WigglyPoofComponent from './custom/WigglyPoofComponent';
import wigglypoofValidator from '../../test/custom/wigglypoof.validator';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      components: {
        wigglypoof: WigglyPoofComponent 
      },
      values: {
        title: {
          fr: 'Le titre',
          en: 'A title'
        }
      },
      schema: {
        custom: {
          wigglypoof: wigglypoofValidator
        },
        "fields" : [ {
          "field" : "title",
          "fieldType" : "text",
          "languages" : [ "fr", "en" ],
          "optional" : false,
          "label" : {
            "fr" : "Titre",
            "en" : "Title"
          },
          "max" : 140,
          "placeholder" : {
            "fr" : "Le titre de votre événement",
            "en" : "Title of your event"
          },
          "sub": {
            "fr" : "Ce champ est requis.",
            "en" : "This field is required"
          }
        }, {
          "field" : "description",
          "fieldType" : "text",
          "languages" : [ "fr", "en" ],
          "optional" : false,
          "label" : {
            "fr" : "Description courte",
            "en" : "Short description"
          },
          "placeholder" : {
            "fr" : "Une courte description de votre événement",
            "en" : "A short description of your event"
          }
        }, {
          "field" : "customfield",
          "fieldType" : "wigglypoof",
          "label" : {
            "fr" : "Saisissez Wigglypoof",
            "en" : "Type Wigglypoof"
          },
          "sub" : {
            "fr" : "Et uniquement wigglypoof",
            "en" : "And only wigglypoof"
          }
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
