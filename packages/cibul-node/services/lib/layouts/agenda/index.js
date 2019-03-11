"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );

module.exports = {
  parent: 'main',
  render: _.template( fs.readFileSync( __dirname + '/layout.tpl', 'utf-8' ) ),
  parser
}

function parser( data ) {

  return ih( data, {
    title: { $set: _.get( data, 'agenda.title', data.title ) }
  } );

}
