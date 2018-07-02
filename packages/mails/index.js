const addressParser = require( 'nodemailer/lib/addressparser' );
const isEmail = require( 'isemail' );
const VError = require( 'verror' );
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
  const template = options.template ? templater.compile( options.template, { lang: defaultLang } ) : null;
  const recipients = flattenRecipients( options.to );

  const results = [];
  const errors = [];

  for ( const recipient of recipients ) {
    const lang = recipient.lang || defaultLang;
    const templateData = Object.assign( { lang }, options.data, recipient.data, config.defaults.data );

    if ( !isEmail.validate( recipient.address ) ) {
      errors.push(
        new VError(
          {
            info: {
              ...options,
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
        const labels = ( config.translations.labels || {} )[ options.template ] || {};
        const __ = config.translations.makeLabelGetter( labels, lang );

        options.html = template( {
          ...templateData,
          __
        } );
      }

      const method = options.queue === false ? config.transporter.sendMail.bind( config.transporter ) : config.queue;

      const result = await method( {
        ...options,
        to: recipient,
        data: templateData
      } );

      results.push( result );
    } catch ( error ) {
      errors.push(
        new VError(
          {
            info: {
              ...options,
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
