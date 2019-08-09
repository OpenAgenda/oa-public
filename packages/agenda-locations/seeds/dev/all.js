import { promisify } from 'util';
import fixtures from '@openagenda/fixtures';

exports.seed = async knex => {
  const { testconfig, schemas } = knex.client.config;

  fixtures.init( testconfig );

  await promisify( fixtures )( [ {
    table: schemas.location,
    src: __dirname + '/location.sql'
  }, {
    table: schemas.agendaSettings,
    src: __dirname + '/agendaSettings.sql'
  } ] );

};
