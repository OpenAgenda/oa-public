"use strict";

const app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/admin.css'
  ],
  decorateCanvas: false,
  webpack: true
} );
const async = require( 'async' );
const fixtures = require( '@openagenda/fixtures' );
const config = require( '../../testconfig.js' );
const service = require( '../../service' );
const mw = service.mw;
const agendasSvc = require( '@openagenda/agendas/service/test' );
const agendaStakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const bodyParser = require( 'body-parser' );

app.use( bodyParser.json() );

app.get( '/', mw.agendas.list );
app.get( '/get', mw.agendas.get );
app.post( '/set/:uid', mw.agendas.set );
app.get( '/stakeholders', mw.stakeholders.list );

fixtures.init( config );
agendasSvc.init( config );

async.waterfall( [
  wcb => agendaStakeholdersSvc.init( config, wcb ),
  wcb => fixtures( [ {
    table: config.schemas.event,
    src: __dirname + '/../fixtures/event.data.sql'
  }, {
    table: config.schemas.stakeholder,
    src: __dirname + '/../fixtures/stakeholder.data.sql'
  }, {
    table: config.schemas.stakeholderSettings,
    src: __dirname + '/../fixtures/stakeholderSettings.data.sql'
  }, {
    table: config.schemas.user,
    src: __dirname + '/../fixtures/user.data.sql'
  }, ], wcb ),
  wcb => agendasSvc.test.fixtures( { reset: false }, wcb )
], err => {

  if ( err ) return console.error( err );

  service.init( Object.assign( {}, config, {
    services: {
      agendas: agendasSvc,
      agendaStakeholders: agendaStakeholdersSvc
    }
  } ) );

  app.getAndListen();

} );
