const logs = require( '@openagenda/logs' );
const config = require( './config' );

const log = logs( 'mails/task' );

// single sending
async function sendMail( data ) {
  try {
    await config.transporter.sendMail( data );
  } catch ( error ) {
    log.error( 'Error on sending email', { data, error } );
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
