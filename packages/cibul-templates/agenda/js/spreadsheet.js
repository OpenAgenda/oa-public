"use strict";

const _ = {
  extend: require( 'lodash/extend' ),
  toUpper: require( 'lodash/toUpper' )
};

const flattenLabels = require( '@openagenda/labels/flatten' );
const labels = require( '@openagenda/labels/agendas/actions' );

const du = require( '@openagenda/dom-utils' );

const modalPartial = require( '../../bsLayout/js/modalPartial' );

module.exports = options => {

  const params = _.extend( {
    lang: 'en',
    selector: '.js_spreadsheet',
    template: require( './spreadsheet.ejs' ),
    languages: []
  }, options );

  if ( params.languages.length <= 1 ) return;

  du.els( params.selector ).forEach( linkElem => {

    const separator = linkElem.getAttribute( 'href' ).indexOf( '?' ) === -1 ? '?' : '&';

    const flatLabels = flattenLabels( labels, params.lang );

    const links = [ {
      label: flatLabels.allLanguages,
      link: linkElem.getAttribute( 'href' )
    } ].concat( params.languages.map( lang => ( {
      label: _.toUpper( lang ),
      link: linkElem.getAttribute( 'href' ) + separator + 'cols.lang=' + lang
    } ) ) );

    modalPartial( linkElem, { html: params.template( _.extend( {
      links,
      extension: _.toUpper( linkElem.getAttribute( 'data-extension' ) )
    }, flatLabels ) ) } );

  } );

}
