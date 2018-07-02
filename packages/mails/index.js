const _ = require( 'lodash' );
const addressParser = require( 'nodemailer/lib/addressparser' );
const isEmail = require( 'isemail' );
const VError = require( 'verror' );
const task = require( './task' );
const templater = require( './templater' );
const config = require( './config' );

// from nodemailer
function mergeOpts( source, ...objects ) {
  objects.forEach( object => {
    Object.keys( object || {} ).forEach( key => {
      if ( !( key in source ) ) {
        source[ key ] = object[ key ];
      } else if ( [ 'headers', 'data' ].includes( key ) ) {
        // headers is a special case. Allow setting individual default headers
        Object.keys( object[ key ] ).forEach( key2 => {
          if ( !( key2 in source[ key ] ) ) {
            source[ key ][ key2 ] = object[ key ][ key2 ];
          }
        } );
      }
    } );
  } );

  return source;
}

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
  const params = {
    headers: {},
    data: {}
  };

  mergeOpts(
    params,
    config.defaults,
    _.omit( options, 'data' ) // assign options.data later
  );

  const template = params.template ? templater.compile( params.template, { lang: params.lang } ) : null;
  const recipients = flattenRecipients( params.to );

  const results = [];
  const errors = [];

  for ( const recipient of recipients ) {
    const lang = recipient.lang || params.lang;
    const templateData = Object.assign( { lang }, options.data || {}, recipient.data || {}, params.data );

    if ( !isEmail.validate( recipient.address ) ) {
      errors.push(
        new VError(
          {
            info: {
              ...params,
              to: recipient,
              data: templateData
            }
          },
          'Invalid email address'
        )
      );
      continue;
    }

    try {
      if ( template ) {
        const labels = ( config.translations.labels || {} )[ params.template ] || {};
        const __ = config.translations.makeLabelGetter( labels, lang );

        params.html = template( {
          ...templateData,
          __
        } );
      }

      const method = params.queue === false ? config.transporter.sendMail.bind( config.transporter ) : config.queue;

      const result = await method( {
        ...params,
        to: recipient,
        data: templateData
      } );

      results.push( result );
    } catch ( error ) {
      errors.push(
        new VError(
          {
            info: {
              ...params,
              to: recipient,
              data: templateData
            },
            cause: error
          },
          'Error on sending mail'
        )
      );
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
