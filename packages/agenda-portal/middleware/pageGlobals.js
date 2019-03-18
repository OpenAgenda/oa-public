"use strict";

const _ = require( 'lodash' );

module.exports = ( req, res, next ) => {

  const stylesheets = [
    '/main.css'
  ].map( s => ( { href: s } ) );

  const topScripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
  ];

  const bottomScripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/spin.js/2.3.2/spin.js',
    '/jquery.spin.js'
  ];

  if ( process.env.NODE_ENV === 'development' ) {

    bottomScripts.push( process.env.BROWSER_REFRESH_URL );

  }

  req.data = _.assign( req.data || {}, {
    stylesheets,
    scripts: {
      top: topScripts.map( src => ( { src } ) ),
      bottom: bottomScripts.map( src => ( { src } ) )
    }
  } );

  next();

}
