"use strict";

const config = require( '../../testconfig' ),

du = require( 'dom-utils' ),

React = require( 'react' ),

ReactDom = require( 'react-dom' ),

createReactClass = require( 'create-react-class' ),

Show = require( '../../react/src/Show' ),

Editor = require( '../../react/src/Editor' ),

showEvents = [ {
  "uid": 111,
  "image": "https://cibul.s3.amazonaws.com/evtbevent_eglise-st-pierre_769_150422.jpg",
  "link" : "#somelink",
  "title": {
    "fr" : "Yeepee"
  },
  "location": {
    "name": "BNF",
    "address": "Paris"
  },
  "dateRange": {
    "fr" : "14 février",
    "en" : "14 february"
  }
}, {
  "uid": 222,
  "title": {
    "fr" : "Kay"
  },
  "link" : "#someotherlink",
  "location": {
    "name": "Chez Janine",
    "address": "Passage Ponceau"
  },
  "dateRange": {
    "fr" : "15 mars",
    "en" : "15 march"
  }
} ];

let Wrapper;

window.onload = () => { ReactDom.render( <Wrapper />, du.el( '.js_canvas' ) ); }

Wrapper = createReactClass( {

  onChange( updatedUids ) {

    console.log( updatedUids );

  },

  render() {

    return <div>
      <div className="top-margined">
        <Show events={showEvents} lang="fr" />
      </div>
      <div className="top-margined wsq">
        <div className="content">
          <Editor initUids={[111]} onChange={this.onChange} info="An info!" />
        </div>
      </div>
    </div>

  }

} );