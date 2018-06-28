"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from './index';

import SomeCustomComponent from './custom/SomeCustomComponent';
import someCustomValidator from './custom/someCustomValidator';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      custom: {
        somecustomtype: {
          validator: someCustomValidator,
          component: SomeCustomComponent
        }
      },
      schema: {
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
          "field" : "longDescription",
          "fieldType" : "textarea",
          "languages" : [ "fr", "en" ],
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
          "field" : "customfield",
          "fieldType" : "somecustomtype",
          "label" : {
            "fr" : "Saisissez Wigglypoof",
            "en" : "Type Wigglypoof"
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