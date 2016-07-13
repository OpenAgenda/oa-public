const du = require( 'dom-utils' ),

  layout = require( '../../layout/js/layout' ),
  
  deepExtend = require( 'deep-extend' ),

  params = {
    stats: {
      agendas: 0,
      contributors: 0,
      events: 0,
    }
  };


du.addEvent( window, 'load', function () {

  deepExtend( params, layout.getOptions( 'body' ) );

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

  checkOdometers();
  du.addEvent( document, "scroll", checkOdometers );

} );


function isScrolledIntoView( elem ) {
  var docViewTop = $( window ).scrollTop();
  var docViewBottom = docViewTop + $( window ).height();

  var elemTop = $( elem ).offset().top;
  var elemBottom = elemTop + $( elem ).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}