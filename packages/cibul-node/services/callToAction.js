"use strict";

const callToActionMw = require( '@openagenda/call-to-action/middleware' );
const mails = require( '@openagenda/mails' );

module.exports.init = config => {

  callToActionMw.init( {
    emailDestinations: config.callToActionEmails,
    copyEmail: 'commercial@openagenda.com',
    interfaces: {
      sendRequestEmail: ({ data: { subject, url, agenda, message }, user, to }) => mails({
        template: 'callToAction',
        to,
        data: {
          user,
          subject,
          url,
          agenda,
          message
        }
      })
    }
  } );

}
