"use strict";

var listSelector = '.events';
var nextProgressiveLoadPage = 2, rockBottom;

window.oa = {
  onWidgetUpdate: function( widget, query ) {

    nextProgressiveLoadPage = 2;
    rockBottom = false;

    loadListContent( '/events', { oaq: query }, function( err, result ) {

      $( listSelector ).html( result.html );
      updateTotal( result.total );

      var pageMatch = window.location.href.match( /\/p\/[0-9]+/ );

      if ( pageMatch ) {
        window.history.pushState({},'', window.location.href.replace( pageMatch[ 0 ], '/p/1' ) );
      }

    } );

  },
  onWidgetReady: function() {
  }
}

function loadListContent( url, data, cb ) {

  spin();

  $.ajax({ url: url, data: data,
    success: function( result ) {
      spin.stop();
      cb( null, result )
    }
  });

}

$(function() {

  $( '.js_trigger_spin' ).on( 'click', spin );

  progressiveLoad( '.js_progressive_load' );

  updateTotal();

} );

function spin() {
  spin.spinning = true;
  $( 'body' ).spin({
    width: 1,
    length: 6,
    radius: 10,
    opacity: 6,
    color: '#333',
    bgColor: "white"
  }); // show the spinner
}

spin.stop = function() {
  spin.spinning = false;
  $( 'body' ).spin(false);
}

spin.isSpinning = function() {
  return spin.spinning;
}

function updateTotal( total ) {

  if ( !$( '.js_total' ).length ) return;

  if ( typeof total === 'undefined' ) {
    total = parseInt( $( '.js_total' ).attr( 'data-total' ) );
  }

  $( '.js_total' ).html(
    $( '.js_total' ).attr( total === 0
      ? 'data-label-none'
      : total === 1 ? 'data-label-one' : 'data-label-plural'
    ).replace( '%total%', total )
  );

}

function progressiveLoad( canvasSelector ) {

  if ( !$( canvasSelector ).first().length ) return;

  $(window).on("scroll", function() {

    if ( spin.isSpinning() || rockBottom ) return;

    var scrollHeight = $(document).height();
    var scrollPosition = $(window).height() + $(window).scrollTop();

    if ( ( scrollHeight - scrollPosition ) / scrollHeight !== 0 ) {
      return;
    }

    var queryPart = window.location.href.split( '?' ).length === 2
      ? '?' + window.location.href.split( '?' ).pop()
      : '';

    loadListContent( '/events/p/' + (nextProgressiveLoadPage++) + queryPart, null, function( err, result ) {

      var eventItemsHTML = $( result.html ).filter( canvasSelector ).get( 0 ).innerHTML.trim()

      if ( eventItemsHTML.length ) {
        $( canvasSelector ).first().append( eventItemsHTML );
      } else {
        rockBottom = true;
      }

    } );

  });

}

