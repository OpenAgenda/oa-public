require( '../../layout/js/main' );

const typedLabels = require( 'labels/corpo/typed' );
const flatten = require( 'labels/flatten' );

window.hook( options => {
  
  const flattenLabels = flatten( typedLabels, options.lang );
  const labels = Object.keys( flattenLabels ).map( ( k ) => flattenLabels[ k ] );

  $( function () {

    $( '.typed' ).typed( {
      strings: labels,
      typeSpeed: 40,
      startDelay: 1000,
      backDelay: 2000,
      loop: true
    } );

    $( 'a[href*=\"#\"]:not([href=\"#\"]):not([href=\"#carousel-screens\"])' ).click( function () {

      if ( location.pathname.replace( /^\//, '' ) == this.pathname.replace( /^\//, '' ) && location.hostname == this.hostname ) {
        var target = $( this.hash );
        target = target.length ? target : $( '[name=' + this.hash.slice( 1 ) + ']' );

        if ( target.length ) {
          $( 'html,body' ).animate( { scrollTop: target.offset().top }, 350 );
          return false;
        }
      }

    } );

    var hashOnLoad = window.location.hash;

    if ( hashOnLoad ) {

      var target = $( hashOnLoad );

      if ( target.length ) {
        $( 'html,body' ).animate( { scrollTop: target.offset().top }, 350 );
        return false;
      }
      
    }

  } );
} );
