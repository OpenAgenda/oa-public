"use strict";

const du = require( '@openagenda/dom-utils' );

const layout = require( './contributor.ejs' );

const labels = require( 'labels/event/show' );

module.exports = ( { canvas, contributor } ) => {

  canvas.insertAdjacentHTML( 'beforeend', 

    layout( {
      contributorTitle: 'Contributeur',
      privateInfo: 'Information privée',
      data: contributor.data,
      labels: contributor.labels
    } )

  );

}