'use strict';

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/users/sendToken' );
const mails = require( '@openagenda/mails' );
const genUrl = require( '../genUrl' );


module.exports = () => {
  return async context => {
    const token = context.result;
    const { user, optionals } = context.params;

    if ( !token ) {
      return context;
    }

    if ( token.type === 'aa' ) {

      const linkParams = {
        token: token.token,
        ..._.pickBy( _.pick( optionals || {}, 'iToken', 'invitation', 'redirect' ) ),
      };

      if ( optionals && optionals.agenda ) linkParams.slug = optionals.agenda.slug;

      const link = genUrl.abs( optionals && optionals.agenda ? 'agendaActivate' : 'activate', linkParams );

      log( `sending activation token - ${link}` );

      await mails( {
        template: 'activateAccount',
        to: user.email,
        lang: user.culture,
        data: {
          activateLink: link,
        },
        queue: false,
      } );

    } else if ( token.type === 'lp' ) {

      const link = genUrl.abs( 'resetPassword', { token: token.token } );

      log( `sending lost password token - ${link}` );

      await mails( {
        template: 'resetPassword',
        to: user.email,
        lang: user.culture,
        data: {
          resetLink: link,
        },
        queue: false,
      } );

    }

    return context;
  };
};
