import knexLib from 'knex';
import { config, initAndLoad } from './service';
import testconfig from '../testconfig';

const database = testconfig.mysql.database + '_service';

describe( 'service', () => {

  afterEach( async () => {

    await config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
    await config.knex.destroy();

  } );

  describe( 'init', () => {

    test( 'simple init', async () => {

      await initAndLoad( {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
        logger: { namespace: 'test:' }
      }, [] ).should.fulfilled;

    } );

    test( 'init without migrations', async () => {

      await initAndLoad( {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
        migrations: null
      }, [] ).should.fulfilled;

    } );

    test( 'init with knex instance', async () => {

      const knex = knexLib( {
        client: 'mysql',
        connection: { ...testconfig.mysql, database }
      } );

      await initAndLoad( {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
        knex,
        migrations: {
          tableName: 'test_migrations'
        }
      }, [] ).should.fulfilled;

    } );

  } );

} );
