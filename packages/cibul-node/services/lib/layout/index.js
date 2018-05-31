"use strict";

const _ = require( 'lodash' );

const flattenLabels = require( '@openagenda/labels/flatten' );
const headerLabels = require( '@openagenda/labels/layout/header' );

const layoutTemplate = require( 'fs' ).readFileSync( __dirname + '/layout.tpl', 'utf-8' );

const layout = _.template( layoutTemplate );

module.exports = ( req, content ) => {

  return layout( {
    agenda: req.agenda, 
    labels: flattenLabels( headerLabels, req.lang ), 
    lang: req.lang
  } ).replace( '{content}', content );

}