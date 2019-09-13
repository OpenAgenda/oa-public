import { promisify } from 'util';
import _ from 'lodash';
import fixtures from '@openagenda/fixtures';
import eventsSvc from '@openagenda/events/test/service';

exports.seed = async knex => {
  const { testconfig, schemas } = knex.client.config;

  fixtures.init( testconfig );

  await promisify( fixtures )( [ {
    table: schemas.agenda,
    src: __dirname + '/review.sql'
  } ] );

  await promisify( eventsSvc.initAndLoad )( _.merge( {}, testconfig, testconfig.services.events ), [
    'event'
  ], { reset: false } );

};
