const du = require( 'dom-utils' ),

  layout = require( '../../layout/js/layout' ),
  
  deepExtend = require( 'deep-extend' ),

  typedLabels = require( 'labels/corpo/typed' ),

  flatten = require( 'labels/flatten' ),

  params = {
    stats: {
      agendas: 0,
      contributors: 0,
      events: 0,
    }
  };


window.hook( options => {

  deepExtend( params, layout.getOptions( 'body' ) );

  const flattenLabels = flatten( typedLabels, options.lang );
  const labels = Object.keys( flattenLabels ).map( ( k ) => flattenLabels[ k ] );

  $( function () {

    checkOdometers();

    du.addEvent( document, "scroll", checkOdometers );

    setTimeout( () => {

      _slaask.init( '6b2ef2b1830ad6e1c43bbc726c8a9f98' );

    }, 5000 );

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


function isScrolledIntoView( elem ) {

  var docViewTop = $( window ).scrollTop();
  var docViewBottom = docViewTop + $( window ).height();

  var elemTop = $( elem ).offset().top;
  var elemBottom = elemTop + $( elem ).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));

}


function checkOdometers() {

  var odoAgendas = $( '.odometer' )[ 0 ];
  var odoContributors = $( '.odometer' )[ 1 ];
  var odoEvents = $( '.odometer' )[ 2 ];

  if ( odoAgendas && isScrolledIntoView( odoAgendas ) ) {
    odoAgendas.innerText = params.stats.agendas;
  }

  if ( odoContributors && isScrolledIntoView( odoContributors ) ) {
    odoContributors.innerText = params.stats.contributors;
  }

  if ( odoEvents && isScrolledIntoView( odoEvents ) ) {
    odoEvents.innerText = params.stats.events;
  }
  
}