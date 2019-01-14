import { promisify } from 'util';
import fixtures from '@openagenda/fixtures';

exports.seed = async knex => {
  const { testconfig, schemas } = knex.client.config;

  fixtures.init( testconfig );

  await promisify( fixtures )( [ {
    table: schemas.agenda,
    src: __dirname + '/review.sql'
  }, {
    table: schemas.aggregator,
    src: __dirname + '/aggregator.sql'
  }, {
    table: schemas.aggregatorSource,
    src: __dirname + '/aggregator_source.sql'
  } ] );

};
