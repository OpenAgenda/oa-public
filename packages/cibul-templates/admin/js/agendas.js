var App = require( '@openagenda/admin-agendas/components/lib/main' ),

  deepExtend = require( 'deep-extend' ),

  params = {
    lang: 'fr',
    res: {
      agendas: '/admin/agendas/search',
      members : '/admin/agendas/members/search',
      agendaSet: '/admin/agendas',
      agendaGet: '/admin/agendas/get'
    },
    selectors: {
      canvas: '.js_canvas'
    },
  };

window.hook( function( options ) {

  deepExtend( params, options );

  App( {
    searchRes: params.res.agendas,
    membersRes: params.res.members,
    setAgendaRes: params.res.agendaSet,
    agendaRes: params.res.agendaGet,
    canvas: params.selectors.canvas
  } );

} );
