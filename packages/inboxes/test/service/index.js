import fixtures from '@openagenda/fixtures';
import createService from '../../src';

export default createService;

export * from '../../src';

const allowedTables = [ 'inbox', 'inboxUser', 'conversation', 'inboxConversation', 'message' ];
const defaultFiles = [ 'inbox', 'inboxUser', 'conversation', 'inboxConversation', 'message' ];

export function initAndLoad( config, files, options ) {

  if ( arguments.length === 2 && Array.isArray( arguments[ 1 ] ) ) {

    options = { reset: true };

  } else if ( arguments.length === 2 ) {

    options = files;
    files = defaultFiles;

  } else if ( arguments.length === 1 ) {

    options = { reset: true };
    files = defaultFiles;

  }

  const params = Object.assign( {
    reset: true
  }, options );

  fixtures.init( { mysql: config.mysql } );

  // reset before migrations if needed
  return new Promise( ( resolve, reject ) => {

    fixtures( [], { reset: params.reset }, async err => {

      if ( err ) {

        console.log( err );
        return reject( err );

      }

      fixtures(
        allowedTables.map( tableName => ({
          table: config.schemas[ tableName ],
          src: `${__dirname}/${tableName}.data.sql`
        }) ).filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ),
        { reset: false },
        err => {

          if ( err ) return reject( err );
          resolve(createService( config ));

        } );

    } );

  } );

};

export function seed( config, files = defaultFiles, options = { reset: false } ) {

  fixtures.init( { mysql: config.mysql } );

  return new Promise( ( resolve, reject ) => {

    fixtures(
      allowedTables.map( tableName => ({
        table: config.schemas[ tableName ],
        src: `${__dirname}/${tableName}.data.sql`
      }) ).filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ),
      options,
      err => {

        if ( err ) return reject( err );
        resolve();

      }
    );

  } );

}
