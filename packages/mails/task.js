const logs = require( '@openagenda/logs' );
const config = require( './config' );

const log = logs( 'mails/task' );

// send next message from the pending queue
async function shiftMessages() {
  const total = await config.queue.total();
  while ( config.transporter.isIdle() && total ) {
    try {
      config.transporter.sendMail( await config.queue.pop() );
    } catch ( error ) {
      log.error( 'Error on sending email', error );
    }
  }
}

module.exports = async function task() {
  if ( !config.queue ) {
    return;
  }

  if ( typeof config.transporter.isIdle === 'function' ) {
    config.transporter.on( 'idle', shiftMessages );

    if ( config.transporter.isIdle() ) {
      // we need to wait the first mail (https://github.com/nodemailer/nodemailer/issues/768#issuecomment-299127268)
      await config.transporter.sendMail( await config.queue.waitAndPop() );
      await shiftMessages();
    }
  } else {
    while ( true ) {
      const data = await config.queue.waitAndPop();

      try {
        await config.transporter.sendMail( data );
      } catch ( error ) {
        log.error( 'Error on sending email: %s', error, { data, error } );
      }
    }
  }
};
