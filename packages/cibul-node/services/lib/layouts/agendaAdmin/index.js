"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );

const agendaParser = require( '../agenda' ).parser;

const flattenLabels = require( '@openagenda/labels/flatten' );
const labels = require( '@openagenda/labels/layout/agendaAdmin' );

module.exports = {
  parent: 'main',
  render: _.template( fs.readFileSync( __dirname + '/layout.tpl', 'utf-8' ) ),
  parser
}

function parser( data ) {

  return ih( agendaParser( data ), {
    adminLabels: { $set: flattenLabels( labels, data.lang ) }
  } );

}
