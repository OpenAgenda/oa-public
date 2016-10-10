"use strict";

const app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/admin.css'
  ],
  decorateCanvas: false,
  webpack: true
} );
const fixtures = require( '../fixtures' );
const config = require( '../../testconfig.js' );
const service = require( '../../service' );
const mw = service.mw;
const agendasSvc = require( 'agendas' );
const agendaStakeholdersSvc = require( 'agenda-stakeholders' );
const bodyParser = require( 'body-parser' );

app.use( bodyParser.json() );

app.get( '/', mw.agendas.list );
app.get( '/get', mw.agendas.get );
app.post( '/set/:uid', mw.agendas.set );
app.get( '/stakeholders', mw.stakeholders.list );


agendasSvc.init( config );
agendaStakeholdersSvc.init( config, () => {

  fixtures( ( err, result ) => {

    if ( err ) return console.error( err );

    service.init( config );

    app.getAndListen();

  } );

} );
