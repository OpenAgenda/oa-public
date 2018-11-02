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
    ( result, recipient ) => result.concat( typeof recipient === 'string' ? addressParser( recipient ) : recipientToArray( recipient ) ),
    []
  );
}

async function sendMail( options = {} ) {
  const defaultLang = options.lang || config.defaults.lang;
  const compiled = options.template
    ? await templater.compile( options.template, {
      ..._.pick( options, 'disableHtml', 'disableText', 'disableSubject' ),
      lang: defaultLang
    } )
    : null;
  const recipients = flattenRecipients( options.to );

  const results = [];
  const errors = [];

  for ( const recipient of recipients ) {
    const lang = recipient.lang || defaultLang;
    const templateData = Object.assign( { lang }, options.data, recipient.data, config.defaults.data );
    const params = {
      ...options,
      to: recipient,
      data: templateData
    };

    if ( !isEmail.validate( recipient.address ) ) {
      const error = new VError(
        {
          info: params
        },
        'Invalid email address'
      );
      log.error( error );
      errors.push( error );
      continue;
    }

    try {
      if ( compiled ) {
        const labels = ( config.translations.labels || {} )[ params.template ] || {};
        templateData.__ = config.translations.makeLabelGetter( labels, lang );

        if ( !params.disableHtml && compiled.html ) {
          params.html = compiled.html( templateData );
        }

        if ( !params.disableText && compiled.text ) {
          params.text = compiled.text( templateData );
        }

        if ( !params.disableSubject && compiled.subject ) {
          params.subject = compiled.subject( templateData );
        }
      }

      const method = params.queue === false ? config.transporter.sendMail.bind( config.transporter ) : config.queue;

      if ( typeof params.filter === 'function' ) {
        const allowed = await params.filter( params );

        if ( !allowed ) {
          log.info( 'Sending filtered for this recipient', params );
          continue;
        }
      }

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
