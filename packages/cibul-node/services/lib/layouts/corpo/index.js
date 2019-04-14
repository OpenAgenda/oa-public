"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );

const flattenLabels = require( '@openagenda/labels/flatten' );
const labels = require( '@openagenda/labels/corpo/layout' );

module.exports = {
  render: _.template( fs.readFileSync( __dirname + '/layout.tpl', 'utf-8' ) ),
  parser
}

function parser( data ) {

  const languages = [ 'fr', 'en', 'de' ];

  return ih( data, {
    labels: { $set: flattenLabels( labels, data.lang ) },
    tel: { $set: '+33142330509' },
    languages: {
      $set: languages.map( ( l, i ) => ( {
        className: l === data.lang ? 'selected' : '',
        value: l,
        label: l.toUpperCase(),
        separator: i < languages.length - 1
      } ) )
    }
  } );

}
