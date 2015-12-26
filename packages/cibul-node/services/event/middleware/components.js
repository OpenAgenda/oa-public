"use strict";

var w = require( 'when' ),

React = require( 'react' ),

ReactDOMServer = require( 'react-dom/server' ),

Registration = React.createFactory( require( 'registration/lib/Display.js' ) );

module.exports = function( req, res, next ) {

  w( { req: req, res: res } )

  .then( _registration )

  .done( v => next(), err => next( err ) );
}

function _registration( v ) {

  v.req.formatted.registrationComponent = ReactDOMServer.renderToStaticMarkup(
    Registration( { value: v.req.event.getTicketLink() || '' } )
  );

  return v;

}