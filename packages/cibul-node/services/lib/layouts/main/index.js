"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );
const flattenLabels = require( '@openagenda/labels/flatten' );
const headerLabels = require( '@openagenda/labels/layout/header' );


const config = require( '../../../../config' );

module.exports = {
  render: _.template( fs.readFileSync( __dirname + '/layout.tpl', 'utf-8' ) ),
  parser
}

function parser( data ) {

  if ( !data.bodyAttributes ) data.bodyAttributes = []; // [ { name, value } ]

  if ( !data.querySearch ) data.querySearch = '';

  if ( !data.scripts ) data.scripts = {};

  if ( !data.scripts.top ) data.scripts.top = [];
  if ( !data.scripts.bottom ) data.scripts.bottom = [];

  data.scripts.bottom.splice( data.scripts.bottom.length, 0,
    { src: 'https://code.jquery.com/jquery-2.2.4.min.js' },
    { src: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js' }
  );

  return ih( data, {
    labels: { $set: flattenLabels( headerLabels, data.lang ) },
    metas: { $set: data.metas || [] },
    interfaceLanguages: { $set: config.interfaceLanguages }
  } );

}
