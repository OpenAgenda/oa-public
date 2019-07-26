"use strict";

const _ = require( 'lodash' );

const OEmbed = require( '@openagenda/oembed' );

module.exports = ( text, current = [] ) => {

  return OEmbed.fromMarkdown( _.keys( text ).reduce(
    ( concatenated, lang ) => [
      concatenated,
      _.get( text, lang )
    ].join( '\n' ), '' ), { current } )

    .then( links => links.map( link => _.set( link, 'type', 'oembed' ) ) );

}
