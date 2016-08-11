var App = require( 'admin-agendas/components/lib/main' ),

  deepExtend = require( 'deep-extend' ),

  params = {
    lang: 'fr',
    res: {
      agendas: '/admin/agendas/search',
      stakeholders : '/admin/agendas/stakeholders/search',
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
    stakeholdersRes: params.res.stakeholders,
    setAgendaRes: params.res.agendaSet,
    agendaRes: params.res.agendaGet,
    canvas: params.selectors.canvas
  } );

} );