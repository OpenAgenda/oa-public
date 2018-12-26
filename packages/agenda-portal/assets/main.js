"use strict";

window.oa = {
  onWidgetUpdate: function( widget, query ) {

    spin();

    $.ajax({
      url: "/events",
      data: { oaq: query },
      success: function( { html, total } ) {

        $( '.events' ).html( html );

        updateTotal( total );

        $('body').spin(false); // stop the spinner

        const pageMatch = window.location.href.match( /\/p\/[0-9]+/ );

        if ( pageMatch ) {

          window.history.pushState({},'', window.location.href.replace( pageMatch[ 0 ], '/p/1' ) );

        }

      }
    });

  },
  onWidgetReady: function() {
  }
}

$(function() {

  $( '.js_trigger_spin' ).on( 'click', spin );

  updateTotal();

} );

function spin() {

  $( 'body' ).spin({
    width: 1,
    length: 6,
    radius: 10,
    opacity: 6,
    color: '#333',
    bgColor: "white"
  }); // show the spinner

}

function updateTotal( total ) {

  if ( typeof total === 'undefined' ) total = parseInt( $( '.js_total' ).attr( 'data-total' ) );

  $( '.js_total' ).html(
    $( '.js_total' ).attr( total === 0 ? 'data-label-none' : ( total === 1 ? 'data-label-one' : 'data-label-plural' ) ).replace( '%total%', total )
  );

}
