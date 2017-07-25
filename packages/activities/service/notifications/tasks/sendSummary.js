"use strict";

const moment = require( 'moment' );
const logger = require( 'basic-logger' );
const queue = require( 'queue' );
const mailer = require( 'mailer' );
const notiflabels = require( 'labels/activities/notifications' );
const emailLabels = require( 'labels/activities/summaryEmail' );
const makeLabelGetter = require( 'labels' );
const unsubscribed = require( 'unsubscribed' );
const notificationFormatMaker = require( '../../../formatNotification' );

require( 'moment/locale/fr' );

let config;
let knex;
let service;
let log;
let q;

const ucfirst = s => s.substr( 0, 1 ).toUpperCase() + s.substring( 1 );


module.exports = Object.assign( sendSummary, { init, task, core: _sendSummary } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  log = logger( 'activities/notifications/tasks/sendSummary' );
  q = queue( config.queue.names.sendSummary, { redis: config.queue.redis } );

}

async function task() {

  let summary;

  while ( summary = await q.pop() ) {

    await _sendSummary( summary );

  }

}

function sendSummary( summary, cb ) {

  q( summary, cb );

}

async function _sendSummary( { user, notifications } ) {

  if ( !notifications.length ) return;

  await knex( config.schemas.feed_notification )
    .where( 'feed_id', notifications[ 0 ].feedId )
    .whereIn( 'id', notifications.map( v => v.id ) )
    .update( { sent: 1 } );

  const lang = user.culture || 'fr';

  const formatNotification = notificationFormatMaker( null, notiflabels, user.uid );
  const getLabel = makeLabelGetter( emailLabels, lang );

  const message = notifications.map(
    v => {
      const formatted = formatNotification( v, lang );

      return '<span style="color: gray"><span style="font-size: 12px">' +
        ucfirst( moment( v.createdAt ).locale( lang ).format( 'LLLL' ) ) + '</span><br />' +
        formatted.content.replace( /class="notif-highlight"/g, 'style="color: #413a42"' ) +
        '</span>';
    }
  ).join( '\n***\n' );

  mailer( {
    recipient: user.email,
    source: '"OpenAgenda" <no-reply@openagenda.com>',
    subject: getLabel( 'subject', lang ),
    data: {
      logo: 'https://openagenda.com/images/openagenda.png',
      title: {
        text: getLabel( 'subject', lang ),
        link: 'https://openagenda.com/'
      },
      action: {
        label: getLabel( 'goToOA', lang ),
        link: 'https://openagenda.com/'
      },
      description: message,
      footerActions: [ {
        link: config.root + unsubscribed.app.genUrl( 'add', {
          userUid: user.uid,
          subject: 'notifications',
          type: 'notifications_summary'
        } ),
        text: getLabel( 'unsubsribe', lang )
      } ]
    }
  }, ( err, result ) => {

    if ( err ) return log( 'error', 'Error to send daily notification email to the user %s', user.uid );

  } );

}
