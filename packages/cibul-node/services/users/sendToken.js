'use strict';

const _ = require( 'lodash' );
const qs = require( 'qs' );
const log = require( '@openagenda/logs' )( 'services/users/sendToken' );
const mails = require( '@openagenda/mails' );
const genUrl = require( '../genUrl' );


module.exports = config => {
  return async context => {
    try {
      const token = context.result;
      const { user, optionals } = context.params;

      if ( !token ) {
        return context;
      }

      if ( token.type === 'aa' ) {

        const query = qs.stringify(
          _.pickBy( _.pick( optionals || {}, 'iToken', 'invitation', 'redirect' ) ), {
            addQueryPrefix: true
          } );

        const link = _.get( optionals, 'agenda' )
          ? `${config.root}/${optionals.agenda.slug}/activate/${token.token}${query}`
          : `${config.root}/activate/${token.token}${query}`;

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
    } catch ( e ) {
      log.error('Unable to send token', e);
    }

    return context;
  };
};
