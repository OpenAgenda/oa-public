const _ = require( 'lodash' );
const addressParser = require( 'nodemailer/lib/addressparser' );
const isEmail = require( 'isemail' );
const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'mails/index' );
const task = require( './task' );
const templater = require( './templater' );
const config = require( './config' );

function recipientToArray( recipient ) {
  return typeof recipient === 'object' && recipient !== null
    ? addressParser( recipient.address ).map( v => ( { ...recipient, ...v } ) )
    : recipient;
}

function flattenRecipients( recipients ) {
  return ( Array.isArray( recipients ) ? recipients : [ recipients ] ).reduce(
    ( result, recipient ) => result.concat( typeof recipient === 'string'
      ? addressParser( recipient )
      : recipientToArray( recipient ) ),
    []
  );
}

async function sendMail( options = {} ) {
  const defaultLang = options.lang || config.defaults.lang;
  const compiled = options.template && options.queue === false
    ? await templater.compile( options.template, {
      ..._.pick( options, 'disableHtml', 'disableText', 'disableSubject' ),
      lang: defaultLang
    } )
    : null;
  const recipients = flattenRecipients( options.to );

  const results = [];
  const errors = [];

  for ( const recipient of recipients ) {
    if ( !isEmail.validate( recipient.address ) ) {
      const error = new VError(
        {
          info: {
            address: recipient.address
          }
        },
        'Invalid email address'
      );
      log.error( error );
      errors.push( error );
      continue;
    }

    const params = {
      ...options,
      to: recipient,
      data: {
        lang: recipient.lang || defaultLang,
        ...options.data,
        ...recipient.data,
        ...config.defaults.data
      }
    };

    try {
      if ( params.queue === false ) {
        if ( typeof config.sendFilter === 'function' ) {
          const allowed = await config.sendFilter( params );

          if ( !allowed ) {
            log.info( 'Sending filtered', { recipient, template } );
            continue;
          }
        }

        if ( typeof config.beforeSend === 'function' ) {
          await config.beforeSend( params );
        }

        if ( compiled ) {
          const labels = ( config.translations.labels || {} )[ params.template ] || {};
          params.data.__ = config.translations.makeLabelGetter( labels, params.data.lang );

          if ( !params.disableHtml && compiled.html ) {
            params.html = compiled.html( params.data );
          }

          if ( !params.disableText && compiled.text ) {
            params.text = compiled.text( params.data );
          }

          if ( !params.disableSubject && compiled.subject ) {
            params.subject = compiled.subject( params.data );
          }
        }
      }

      const method = params.queue === false ? config.transporter.sendMail.bind( config.transporter ) : config.queue;
      const result = await method( params );

      results.push( result );
    } catch ( error ) {
      const wrappedError = new VError(
        {
          info: params,
          cause: error
        },
        'Error on sending mail'
      );
      log.error( wrappedError );
      errors.push( wrappedError );
    }
  }

  return {
    results,
    errors
  };
}

module.exports = Object.assign(
  sendMail,
  {
    task,
    init: config.init
  },
  templater
);
