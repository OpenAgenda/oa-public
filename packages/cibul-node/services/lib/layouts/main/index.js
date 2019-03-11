"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );
const flattenLabels = require( '@openagenda/labels/flatten' );
const headerLabels = require( '@openagenda/labels/layout/header' );

module.exports = {
  render: _.template( fs.readFileSync( __dirname + '/layout.tpl', 'utf-8' ) ),
  parser
}

function parser( data ) {

  return ih( data, {
    labels: { $set: flattenLabels( headerLabels, data.lang ) },
    metas: { $set: data.metas || [] }
  } );

}
