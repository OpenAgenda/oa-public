"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from './index';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      schema: {
        "fields" : [ {
          "field" : "title",
          "fieldType" : "text",
          "optional" : false,
          "label" : {
            "fr" : "Titre",
            "en" : "Title"
          },
          "placeholder" : {
            "fr" : "Le titre de votre événement",
            "en" : "Title of your event"
          }
        }, {
          "field" : "description",
          "fieldType" : "text",
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
          "field" : "longDescription",
          "fieldType" : "textarea",
          "label" : {
            "fr" : "Description longue",
            "en" : "Long description"
          }
        }, {
          "field" : "conditions",
          "fieldType" : "text",
          "label" : {
            "fr" : "Conditions de participation, tarifs",
            "en" : "Attendence conditions, pricing"
          }
        }, {
          "field" : "registration",
          "fieldType" : "text",
          "label" : {
            "fr" : "Inscription",
            "en" : "Registration"
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