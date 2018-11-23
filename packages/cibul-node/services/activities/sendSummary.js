'use strict';

const _ = require( 'lodash' );
const moment = require( 'moment' );
const mails = require( '@openagenda/mails' );
const notificationFormatMaker = require( '@openagenda/activities/dist/formatNotification' );
const notiflabels = require( '@openagenda/labels/activities/notifications' );
const log = require( '@openagenda/logs' )( 'services/activities/sendSummary' );
const config = require( '../../config' );

require( 'moment/locale/fr' );


module.exports = async function sendSummary( { user, notifications } ) {

  const { knex } = config;

  if ( Math.abs( moment().diff( moment( notifications[ notifications.length - 1 ].createdAt ), 'days', true ) ) > 2 ) {

    await knex( config.schemas.feed_notification )
      .where( 'feed_id', notifications[ 0 ].feedId )
      .whereIn( 'id', notifications.map( v => v.id ) )
      .update( { sent: 1 } );

    return log( 'warn', 'Attempt to send too old summary at %s', user.email, { notifications } );

  }

  if ( !notifications.length ) return;

  await knex( config.schemas.feed_notification )
    .where( 'feed_id', notifications[ 0 ].feedId )
    .whereIn( 'id', notifications.map( v => v.id ) )
    .update( { sent: 1 } );

  const lang = user.culture || 'fr';

  const formatNotification = notificationFormatMaker( ( ...args ) => {
    const url = notificationFormatMaker.defaultGetUrl( ...args );
    return url ? config.root + url : null
  }, notiflabels, user.uid );

  const message = notifications.map(
    v => {
      const formatted = formatNotification( v, lang );

      return '<span style="font-size: 12px">' +
        _.upperFirst( moment( v.createdAt ).locale( lang ).format( 'LLLL' ) ) + '</span><br />' +
        '<a href="' + formatted.url + '" style="color: gray; text-decoration: none">' +
        formatted.content.replace( /class="notif-highlight"/g, 'style="color: #413a42"' ) +
        '</a>';
    }
  ).join( '\n***\n' );

  try {

    await mails( {
      template: 'notificationsSummary',
      to: {
        address: user.email,
        unsubscriptions: [ {
          rule: [ 'receive', 'notificationsSummary' ],
          dataPath: 'unsubscribeLink'
        } ]
      },
      lang,
      data: {
        message,
        nbr: notifications.length,
        date: moment( notifications[ notifications.length - 1 ].createdAt ).locale( lang ).format( 'LLL' ),
        link: config.root,
        logo: {
          src: `${config.root}/images/openagenda.png`,
          width: '300px'
        }
      }
    } );

  } catch ( err ) {

    log.error( 'Error to send daily notification email to the user %s (%s):', user.email, user.uid, err );

  }

};
