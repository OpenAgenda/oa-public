"use strict";

const _ = require( 'lodash' );

const flattenLabels = require( '@openagenda/labels/flatten' );
const headerLabels = require( '@openagenda/labels/layout/header' );

const layoutTemplate = require( 'fs' ).readFileSync( __dirname + '/layout.tpl', 'utf-8' );

const layout = _.template( layoutTemplate );

module.exports = ( req, content ) => {

  return layout( {
    head: {
      title: req.agenda ? req.agenda.title : 'OpenAgenda'
    },
    agenda: req.agenda,
    labels: flattenLabels( headerLabels, req.lang ),
    lang: req.lang,
    querySearch: _.get( req, 'query.search', '' ),
    metas: _.get( req, 'metas', [] ),
    bodyAttributes: _.get( req, 'bodyAttributes', [] ),
    scripts: _.get( req, 'scripts', {
      bottom: []
    } )
  } ).replace( '{content}', content );

}
