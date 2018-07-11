const path = require( 'path' );
const _ = require( 'lodash' );
const nodemailer = require( 'nodemailer' );
const VError = require( 'verror' );
const queues = require( '@openagenda/queues' );
const logs = require( '@openagenda/logs' );
const makeLabelGetter = require( './utils/makeLabelGetter' );

const log = logs( 'mails/config' );
const logTransporter = logs( 'mails/transporter' );

const config = {
  templatesDir: process.env.MAILS_TEMPLATES_DIR || path.join( process.cwd(), 'templates' ),
  transport: {
    pool: true,
    host: '127.0.0.1',
    port: '1025',
    maxMessages: Infinity,
    maxConnections: 20,
    rateLimit: 14, // 14 emails/second max
    rateDelta: 1000
  },
  defaults: {},
  translations: {
    labels: {},
    makeLabelGetter
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  queueName: 'mails',
  disableVerify: false
};

async function init( c = {} ) {
  if ( c.logger ) {
    logs.setModuleConfig( c.logger );
  }

  Object.assign( config, c );

  // Queue
  if ( config.defaults.queue !== false ) {
    queues.init( { redis: config.redis } );
    config.queue = queues( config.queueName );
  }

  const transportLogger = {
    error: ( data, ...rest ) => logTransporter.error( ...rest, data ),
    warn: ( data, ...rest ) => logTransporter.warn( ...rest, data ),
    info: ( data, ...rest ) => logTransporter.info( ...rest, data ),
    debug: ( data, ...rest ) => logTransporter.debug( ...rest, data )
  };

  // Transporter
  config.transporter = nodemailer.createTransport( { ...config.transport, logger: transportLogger }, config.defaults );

  if ( !config.disableVerify ) {
    try {
      await config.transporter.verify();
    } catch ( error ) {
      const wrappedError = new VError( error, 'Invalid transporter configuration' );
      log.error( wrappedError );
      throw wrappedError;
    }
  }
}

module.exports = _.extend( config, {
  init,
  getConfig: () => config
} );
