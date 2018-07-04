const logs = require( '@openagenda/logs' );
const config = require( './config' );

const log = logs( 'mails/task' );

// single sending
async function sendMail( data ) {
  try {
    await config.transporter.sendMail( data );
  } catch ( error ) {
    log.error( 'Error on sending email', error );
  }
}

// send next message from the pending queue
async function shiftMessages() {
  const total = await config.queue.total();
  while ( config.transporter.isIdle() && total ) {
    await sendMail( await config.queue.pop() );
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
      await sendMail( await config.queue.waitAndPop() );
      await shiftMessages();
    }
  } else {
    while ( true ) {
      await sendMail( await config.queue.waitAndPop() );
    }
  }
};
