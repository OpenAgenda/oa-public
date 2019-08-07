"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom' );
const du = require( '@openagenda/dom-utils' );
const dl = require( '@openagenda/dom-utils/documentLocation' );
const utils = require( '@openagenda/utils' );
const Body = require( './Body' );

module.exports = options => {
  const params = utils.extend( {
    res: '/', // where to fetch list.
    canvas: '.js_search_canvas',
    dataTag: 'data-options',
    lang: 'en'
  }, options );

  const data = du.parseJsonAttribute( 'body', params.dataTag, {
    agendas: [],
    total: 0
  } );

  const elem = React.createElement( Body, {
    res: params.res,
    lang: params.lang,
    query: dl.getQuery(),
    page: parseInt( dl.getQueryPart( 'page', 1 ), 10 ),
    agendas: data.agendas,
    total: data.total
  } );

  if ( options.skipRender ) {
    return elem;
  }

  ReactDOM.hydrate( elem, du.el( params.canvas ) );
};
