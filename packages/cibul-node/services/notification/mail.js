"use strict";

const { callbackify } = require( 'util' );
const config = require( '../../config' );
const users = require( '@openagenda/users' );
const async = require( 'async' );
const _ = require( 'lodash' );
const logger = require( '@openagenda/logger' );
const agendas = require( '@openagenda/agendas' );
const events = require( '../event' );
const genUrl = require( '../genUrl' );
const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/home/notifications' ) );
const unsubscribed = require( '@openagenda/unsubscribed' );

const types = {
  10: {
    label: 'agendaEventPublished', // notifications to other editors of review when an article is published
    actionLabel: 'seeEvent',
    actionRoute: 'agendaEventShow'
  },
  11: {
    label: 'userNewContributor', // notifications to newly named editor
    actionLabel: 'seeAgenda',
    actionRoute: 'agendaShow'
  },
  12: {
    label: 'agendaNewContributor', // notifification to review owner when invited user has validated his account and become editor of the review
    actionLabel: 'seeAgenda',
    actionRoute: 'agendaShow'
  },
  /*15: {
    label: 'userEventUpdate', // notification sent to event editors when an event was modified
    actionLabel: 'seeEvent',
    actionRoute: 'eventShow'
  },
  16: {
    label: 'agendaEventPublished', // notification to event editors when an event was published
    actionLabel: 'seeEvent',
    actionRoute: 'agendaEventShow'
  },*/
  19: {
    label: 'userNewAdministrator', // notification sent to new administrator of an agenda
    actionLabel: 'seeAgenda',
    actionRoute: 'agendaShow'
  },
  20: {
    label: 'agendaNewAggregator', // notification sent to review admins when aggregator has plugged to it
    actionLabel: 'seeAgenda',
    actionRoute: 'agendaShow'
  },
  31: {
    label: 'agendaNewAdministrator',
    actionLabel: 'seeAgenda',
    actionRoute: 'agendaShow'
  },
  32: {
    label: 'agendaEventSubmitModeration', // notification sent to admin when article is submitted but not published
    actionLabel: 'seeEvent',
    actionRoute: 'agendaEventShow'
  },
  33: {
    label: 'userNewModerator',
    actionLabel: 'seeAgenda',
    actionRoute: 'agendaShow'
  },
  34: {
    label: 'agendaEventUpdate',
    actionLabel: 'seeEvent',
    actionRoute: 'agendaEventShow',
  },
  35: {
    label: 'agendaNewModerator',
    actionLabel: 'seeAgenda',
    actionRoute: 'agendaShow'
  }
}

module.exports = ( notifications, cb ) => {

  let log = logger( 'services/notification/mail' );

  async.mapLimit( notifications, 5, ( n, mcb ) => {

    let aggregatorAgendaId = null;

    if ( n.object ) {

      aggregatorAgendaId = n.object.aggregatorAgendaId;

    }

    if ( typeof types[ n.type ] === 'undefined' ) {

      log( 'error', 'unhandled notification type: %s', n.type );

      return mcb( null );

    }

    async.series( [
      n.review_id ? agendas.get.bind( null, { id: n.review_id }, { private : null } ) : cb => cb(),
      cb => callbackify( users.findOne )( {
        query: {
          id: n.user_id
        },
        detailed: true
      }, cb ),
      n.owner_id ? cb => callbackify( users.findOne )( {
        query: {
          id: n.owner_id
        },
        detailed: true
      }, cb ) : cb => cb(),
      n.event_id ? events.get.bind( null, { id: n.event_id } ) : cb => cb(),
      aggregatorAgendaId ? agendas.get.bind( null, { id: aggregatorAgendaId }, { private: null } ) : cb => cb()
    ], ( err, result ) => {

      let [ 
        agenda,
        notifiedUser,
        user,
        event,
        aggregator
      ] = result;

      if ( !notifiedUser ) {

        log( 'error', 'could not find user to notify: %s', n.user_id )

        return mcb( null );

      }

      let mailType = types[ n.type ].code || _.snakeCase( types[ n.type ].label ),

        action = _getAction( n.type, {
          agenda: n.type === 20 ? aggregator : agenda,
          event
        }, notifiedUser.culture );


      unsubscribed( notifiedUser.uid ).is( {
        subject: 'agenda',
        identifier: agenda ? agenda.uid : -1,
        type: mailType
      }, ( err, isUnsubscribed ) => {

        if ( err ) return mcb( err );

        if ( isUnsubscribed ) return mcb( null, false );

        mcb( null, {
          recipient: notifiedUser.email,
          subject: getLabel( types[ n.type ].label, {
            agenda: agenda ? agenda.title : null,
            aggregator: aggregator ? aggregator.title : null,
            user: user ? user.fullName : null,
            event: event ? _getLang( event.title, notifiedUser.culture ) : null
          }, notifiedUser.culture ),
          data: {
            logo : agenda && agenda.image ? ( config.aws.imageBucketPath + 'rwtb' + agenda.image ).replace( 'cibuldev', 'cibul' ) : null,
            surTitle: agenda ? agenda.title : null,
            title : false,
            action,
            description: getLabel( types[ n.type ].label, {
              agenda: agenda ? _genLinked( agenda.title, 'agendaShow', { slug: agenda.slug } ) : null,
              user: user ? user.fullName : null,
              event: event ? _genLinked( _getLang( event.title, notifiedUser.culture ), agenda ? 'agendaEventShow' : 'eventShow', { slug: agenda ? agenda.slug : null, eventSlug: event.slug } ) : null,
              aggregator: aggregator ? _genLinked( aggregator.title, 'agendaShow', { slug: aggregator.slug } ) : null,
            }, notifiedUser.culture ),
            footerActions: agenda ? [ {
              text: getLabel( 'unsubscribeFromNotification', notifiedUser.culture ),
              link: config.root + unsubscribed.app.genUrl( 'add', {
                userUid: notifiedUser.uid,
                subject: 'agenda',
                identifier: agenda.uid,
                type: mailType
              } )
            }, {
              text: getLabel( 'unsubscribeFromAllNotifications', notifiedUser.culture ),
              link: config.root + unsubscribed.app.genUrl( 'add', {
                userUid: notifiedUser.uid,
                subject: 'agenda',
                identifier: agenda.uid
              } )
            } ] : []
          }
        } );

      } );

    } );

  }, ( err, mailsToSend ) => {

    cb( err, mailsToSend ? mailsToSend.filter( m => !!m ) : null );

  } );

}

function _getAction( type, { agenda, event }, lang ) {

  return {
    link: genUrl( types[ type ].actionRoute, _.pickBy( {
      slug: agenda ? agenda.slug : null,
      eventSlug: event ? event.slug : null
    }, v => !!v ), { abs: true } ),
    label: getLabel( types[ type ].actionLabel, lang )
  }

}

function _genLinked( label, route, params ) {

  let link = genUrl( route, _.pickBy( params, v => !!v ), { abs: true } );

  return `[${label}](${link})`;

} 

function _getLang( obj, lang ) {

  return obj ? ( obj[ lang ] ? obj[ lang ] : obj[ Object.keys( obj )[ 0 ] ] ) : null;

}