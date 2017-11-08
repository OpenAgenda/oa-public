"use strict";

const du = require( '@openagenda/dom-utils' );

const layout = require( './activities.ejs' );

const labels = require( 'labels/event/show' );

module.exports = ( { canvas, fetch, res, lang } ) => {

  let nextUrl,

    buttonCanvas,

    button;

  fetch( res, ( err, result ) => {

    if ( err ) return console.log( 'errored', err );

    if ( !result || !result.count ) return;

    _displayActivities( canvas, result.html, labels.activity[ lang ] );

    buttonCanvas = du.el( '.js_more_activities' );

    button = du.el( buttonCanvas, 'button' );

    nextUrl = result.nextUrl;

    if ( !nextUrl ) return _removeButton();

    _loadMore();

  } );

  function _loadMore() {

    du.addEvent( button, 'click', e => {

      e.preventDefault();

      button.setAttribute( 'disabled', 'disabled' );

      fetch( nextUrl, ( err, result ) => {

        if ( err ) return _hide();

        if ( !result.nextUrl ) _hide();

        let d = document.createElement( 'div' );

        d.innerHTML = result.html;

        du.el( canvas, 'ul' ).insertAdjacentHTML( 'beforeend', du.el( d, 'ul' ).innerHTML );

        if ( result.nextUrl ) {

          button.removeAttribute( 'disabled' );

          nextUrl = result.nextUrl;

        } else {

          _removeButton();

        }

      } );

    } )

  }

  function _hide() {

    du.addClass( buttonCanvas, 'display-none' );

  }

  function _removeButton() {

    buttonCanvas.parentNode.removeChild( buttonCanvas );

  }
  
}


function _displayActivities( canvas, html, title ) {

  canvas.insertAdjacentHTML( 'beforeend', 

    layout( {
      activityTitle: title,
      html: html
    } )

  );

}