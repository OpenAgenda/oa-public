"use strict";

const { createRoot } = require( 'react-dom/client' );

const du = require( '../../js/lib/domUtils' );

const labels = require( '@openagenda/labels/event/show' );

const activitiesEventApp = require( '@openagenda/activity-apps/client/apps/event' );

const { getLocaleValue } = require('@openagenda/intl');

const layout = require( './activities.ejs' );


module.exports = ( { canvas, fetch, res, lang } ) => {

  let nextUrl,

    buttonCanvas,

    button;

  const url = new URL(res, document.location.href);

  url.searchParams.append('withConfig', '1');

  fetch( url, ( err, result ) => {

    if ( err ) return console.log( 'errored', err );

    if ( !result || !result.count ) return;

    canvas.insertAdjacentHTML( 'beforeend', layout( { activityTitle: getLocaleValue(labels.history, lang) } ) );

    const activities = result.activities;
    const config = result.config;

    const root = createRoot(document.querySelector( '.js_event_activities' ));
    root.render(activitiesEventApp( { activities, config, lang } ));

    buttonCanvas = document.querySelector( '.js_more_activities' );

    button = buttonCanvas.querySelector( 'button' );

    nextUrl = result.nextUrl;

    if ( !nextUrl ) return _removeButton();

    _loadMore( activities );

  } );

  function _loadMore( activities ) {

    du.addEvent( button, 'click', e => {

      e.preventDefault();

      button.setAttribute( 'disabled', 'disabled' );

      fetch( nextUrl, ( err, result ) => {

        if ( err ) return _hide();

        if ( !result.nextUrl ) _hide();

        Array.prototype.push.apply( activities, result.activities || [] );

        const root = createRoot( document.querySelector( '.js_event_activities' ) );
        root.render(activitiesEventApp( { activities, lang } ));

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
