"use strict";

const { promisify } = require( 'util' );
const knex = require( 'knex' );
const logger = require( '@openagenda/logs' );
const _ = require( 'lodash' );

const log = logger( 'init' );

module.exports = endpoints => {

  const config = {}

  function init( c ) {

    _.assign( config, c );

    if ( !config.knex ) {

      config.knex = knex( {
        client: 'mysql',
        connection: c.mysql
      } );

    }

    if ( !config.legacyKnex ) {

      config.legacyKnex = knex( {
        client: 'mysql',
        connection: c.legacy.mysql
      } );

    }

    if ( config.logger ) {

      logger.setModuleConfig( config.logger );

    }

    const { gm } = c.Files;

    config.upload = c.Files({
      key: 'image',
      variants: [
        {
          getFilename: (info, context) => `${context.fileKey}.base.image.jpg`,
          transform: async (info, context) => {
            const image = gm(info.stream, context.originalname)
              .autoOrient()
              .noProfile()
              .resize(700)
              .stream('jpg');

            context.providerParams.ContentType = 'image/jpeg';
            info.type = 'base';

            const sizeGm = gm(image);

            info.size = await promisify(sizeGm.size).call(sizeGm, { bufferStream: true });

            return sizeGm.stream('jpg');
          }
        },
        {
          getFilename: (info, context) => `${context.fileKey}.full.image.jpg`,
          transform: async (info, context) => {
            const image = gm(info.stream, context.originalname)
              .autoOrient()
              .noProfile()
              .stream('jpg');

            context.providerParams.ContentType = 'image/jpeg';
            info.type = 'full';

            const sizeGm = gm(image);

            info.size = await promisify(sizeGm.size).call(sizeGm, { bufferStream: true });

            return sizeGm.stream('jpg');
          }
        },
        {
          getFilename: (info, context) => `${context.fileKey}.thumb.image.jpg`,
          transform: (info, context) => {
            context.providerParams.ContentType = 'image/jpeg';
            info.type = 'thumbnail';
            info.size = {
              width: 200,
              height: 200
            };

            return gm(info.stream, context.originalname)
              .autoOrient()
              .noProfile()
              .resize(200, 200, '^')
              .gravity('Center')
              .crop(200, 200)
              .stream('jpg');
          }
        }
      ]
    });

    _.keys( endpoints ).filter( e => endpoints[ e ].init ).forEach( e => {

      endpoints[ e ].init( endpoints, config );

    } );

  }

  function shutdown( cb ) {

    if ( !config.knex ) return cb();

    config.knex.destroy( () => {

      config.knex = null;

      config.legacyKnex.destroy( err => {

        config.legacyKnex = null;

        cb( err );

      } );

    } );

  }

  return _.extend( { init, shutdown }, endpoints );

}
