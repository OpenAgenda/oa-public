import React from 'react';
import createReactClass from 'create-react-class';
import { storiesOf } from '@storybook/react';
import Show from '../react/src/Show';
import Editor from '../react/src/Editor';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const apiRoot = `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`;

const showEvents = [
  {
    "uid": 111,
    "image": "https://cibul.s3.amazonaws.com/evtbevent_eglise-st-pierre_769_150422.jpg",
    "link": "#somelink",
    "title": {
      "fr": "Yeepee"
    },
    "location": {
      "name": "BNF",
      "address": "Paris"
    },
    "dateRange": {
      "fr": "14 février",
      "en": "14 february"
    }
  }, {
    "uid": 222,
    "title": {
      "fr": "Kay"
    },
    "link": "#someotherlink",
    "location": {
      "name": "Chez Janine",
      "address": "Passage Ponceau"
    },
    "dateRange": {
      "fr": "15 mars",
      "en": "15 march"
    }
  }
];

const Wrapper = createReactClass( {

  getInitialState() {

    return {
      sampleIndex: 0,
      samples: [
        {
          keywords: {
            fr: [ 'un', 'deux', 'trois' ],
            en: [ 'one', 'two', 'three' ]
          }
        }, {
          keywords: {
            fr: [ 'quatre', 'cinq', 'six' ],
            en: [ 'four', 'five', 'six' ]
          }
        }
      ]
    }

  },

  onChange( updatedUids ) {

    console.log( 'onChange', updatedUids );

  },

  toggleSuggestFrom() {

    const toggle = (this.state.sampleIndex + 1) % this.state.samples.length;

    console.log( 'toggle', toggle );

    this.setState( {
      suggestIndex: toggle
    } );

  },

  render() {

    return <div>
      <a onClick={this.toggleSuggestFrom}>toggle</a>
      <div className="top-margined">
        <Show events={showEvents} lang="fr" />
      </div>
      <div className="top-margined wsq">
        <div className="content" style={{ marginBottom: '1000px' }}>
          <Editor
            res={{
              events: `${apiRoot}/events`,
              suggestions: `${apiRoot}/suggestions`
            }}
            initUids={[ 111 ]}
            onChange={this.onChange}
            info="An info!"
            sample={this.state.samples[ this.state.sampleIndex ]}
          />
        </div>
      </div>
    </div>

  }

} );

storiesOf( 'App', module )
  .add( 'all', () => <Wrapper /> );
