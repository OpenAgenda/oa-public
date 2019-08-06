"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom' );
const du = require( '@openagenda/dom-utils' );
const Body = require( './Body' );

module.exports = options => {
  const params = Object.assign( {
    searchRes: '/',
    agendaRes: '/get',
    setAgendaRes: '/get',
    stakeholdersRes: '/stakeholders',
    canvas: '.js_canvas'
  }, options );

  const elem = React.createElement( Body, {
    searchRes: params.searchRes,
    agendaRes: params.agendaRes,
    setAgendaRes: params.setAgendaRes,
    stakeholdersRes: params.stakeholdersRes,
  } );

  if ( options.skipRender ) {
    return elem;
  }

  ReactDOM.render( elem, du.el( params.canvas ) );
};
