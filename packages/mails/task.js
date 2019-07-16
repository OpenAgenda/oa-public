'use strict';

const _ = require( 'lodash' );
const logs = require( '@openagenda/logs' );
const templater = require( './templater' );
const config = require( './config' );

const log = logs( 'mails/task' );

// single sending
async function sendMail( params ) {
  try {
    if ( typeof config.sendFilter === 'function' ) {
      const allowed = await config.sendFilter( params );

      if ( !allowed ) {
        log.info( 'Sending filtered', { recipient: params.to, template: params.template } );
        return;
      }
    }

    if ( typeof config.beforeSend === 'function' ) {
      await config.beforeSend( params );
    }

    const labels = ( config.translations.labels || {} )[ params.template ] || {};
    params.data.__ = config.translations.makeLabelGetter( labels, params.data.lang );

    Object.assign( params.data, config.defaults.data );

    const defaultLang = params.lang || config.defaults.lang;
    const result = await templater.render( params.template, params.data, {
      ..._.pick( params, 'disableHtml', 'disableText', 'disableSubject' ),
      lang: defaultLang
    } );

    Object.assign( params, result );

    await config.transporter.sendMail( params );
  } catch ( error ) {
    log.error( 'Error on sending email', { params, error } );
  }
}

// send next messages from the pending queue
async function shiftMessages() {
  while ( config.transporter.isIdle() ) {
    await sendMail( await config.queue.waitAndPop() );
  }
}

module.exports = async function task() {
  if ( !config.queue ) {
    return;
  }

  if ( config.transporter.isIdle() ) {
    config.transporter.on( 'idle', shiftMessages );
    // we need to wait the first mail (https://github.com/nodemailer/nodemailer/issues/768#issuecomment-299127268)
    await sendMail( await config.queue.waitAndPop() );
    await shiftMessages();
  } else {
    while ( true ) {
      await sendMail( await config.queue.waitAndPop() );
    }
  }
};
