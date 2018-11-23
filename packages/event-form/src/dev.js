import React, { Component } from 'react';
import { render } from 'react-dom';

if ( module.hot ) module.hot.accept();

import EventForm from './';

import eventReferences from './fields/references';

console.log( '***** CHANGE ******' );

class Main extends Component {

  render() {

    return <div className="container top-margined col-lg-offset-3 col-lg-6 col-md-offset-2 col-md-8 col-sm-12 oa-col-canvas">
      <div className="row margin-v-md margin-h-sm">
        <EventForm
          schemaExtensions={[ {
            fields: [ {
              field: 'networkfield',
              label: {
                fr: 'Champ multilingue de réseau',
                en: 'Multilingual Network field'
              },
              languages: [],
              fieldType: 'text'
            } ]
          }, {
            fields: [ {
              field: 'languages',
              fieldType: 'abstract'
            }, {
              field: 'title',
              fieldType: 'abstract'
            }, {
              field: 'keywords',
              fieldType: 'abstract',
              display: false
            }, {
              field: 'agendafield',
              label: {
                fr: 'Champ d\'agenda',
                en: 'Agenda field'
              },
              fieldType: 'text'
            }, {
              field: 'references',
              fieldType: 'abstract'
            } ]
          } ]}
          locationRes="/locations"
          referencesRes="/references"
          lang="fr"
          classNames={{
            fieldsCanvas: 'padding-all-md wsq',
            bottomErrorsCanvas: 'error-summary padding-all-md',
            bottomActionsCanvas: 'padding-all-md wsq'
          }}
          values={{
            title: {
              fr: 'Inauguration d\'un formulaire'
            },
            location: {
              uid: 93105902
            },
            accessibility: { hi: true, sl: true },
            references: [ 45527593 ]
          }}
        />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
