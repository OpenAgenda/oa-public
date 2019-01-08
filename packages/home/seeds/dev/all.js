import { promisify } from 'util';
import _ from 'lodash';
import fixtures from '@openagenda/fixtures';
import stakeholdersSvc from '@openagenda/agenda-stakeholders/test/service';
import eventsSvc from '@openagenda/events/test/service';

exports.seed = async knex => {
  const { testconfig, schemas } = knex.client.config;

  fixtures.init( testconfig );

  await promisify( fixtures )( [ {
    table: schemas.agenda,
    src: __dirname + '/review.sql'
  }, {
    table: schemas.stakeholder,
    src: __dirname + '/reviewer.sql'
  } ] );
  stakeholdersSvc.init( _.merge( {}, testconfig, testconfig.services.agendaStakeholders ) );
  eventsSvc.init( _.merge( {}, testconfig, testconfig.services.events ) );

  await promisify( eventsSvc.initAndLoad )( _.merge( {}, testconfig, testconfig.services.events ), [
    'event'
  ], { reset: false } );

};
