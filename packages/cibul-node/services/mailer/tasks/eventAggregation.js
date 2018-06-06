"use strict";

const agendasSvc = require( '@openagenda/agendas' ),
  
  wn = require( 'when/node' ),

  _ = require( 'lodash' ),
  
  mailer = require( '@openagenda/mailer' ),

  genUrl = require( '../../genUrl' ),
  
  stakeholders = require( '@openagenda/agenda-stakeholders' ),

  makeLabelGetter = require( '@openagenda/labels' ),

  getMailerLabel = makeLabelGetter( require( '@openagenda/labels/components/mailer' ) ),

  getAggregationLabel = makeLabelGetter( require( '@openagenda/labels/aggregators/mail' ) ),

  eventSvc = require( '@openagenda/events' ),

  usersSvc = require( '@openagenda/users' ),

  agendaEventStates = require( '@openagenda/agenda-events/iso/states' ),

  log = require( '@openagenda/logs' )( 'mailer/task/eventAggregation' );


module.exports = async ( { eventUid, aggregatorAgendaUid, sourceAgendaUid, state }, cb ) => {

  try {

    const event = await wn.call( eventSvc.get, { uid: eventUid } );

    const aggregatorAgenda = await wn.call( agendasSvc.get, { uid: aggregatorAgendaUid }, { internal: true, includeImagePath: true } );

    const sourceAgenda = await wn.call( agendasSvc.get, { uid: sourceAgendaUid }, { internal: true, includeImagePath: true } );

    const members = ( await wn.call( stakeholders( aggregatorAgenda.id ).list, { credentials: [ 'administrator', 'moderator' ] }, 0, 100 ) )[ 0 ];

    const users = (await usersSvc.find( {
      query: {
        id: {
          $in: members.map( m => m.userId )
        },
        $limit: 100
      },
      detailed: true
    } ) )
      .data
      .filter( u => !!u.email );

    log( 'sending mails to %s adminmods to notify aggregation %s -> %s', users.length, sourceAgenda.title, aggregatorAgenda.title )

    for ( let user of users ) {

      await _sendEmail( user, aggregatorAgenda, sourceAgenda, event, state );

    }

  } catch ( e ) {

    log( 'error', e );

  }

  cb();

}


function _sendEmail( user, agenda, sourceAgenda, event, state ) {

  let stateLabel;

  return new Promise( ( rs, rj ) => {

    const lang = user.culture;

    const eventTitle = _.find( event.title );

    const subject = getAggregationLabel( 'newAggregationSubject', {
      agenda: agenda.title,
      event: eventTitle
    }, lang );

    const url = genUrl( 'agendaEventShow', {
      slug: agenda.slug,
      eventSlug: event.slug
    }, { abs: true } );

    if ( state == agendaEventStates.TOCONTROL ) {

      stateLabel = getAggregationLabel( 'toBeControlled', lang );

    } else if ( state === agendaEventStates.CONTROLLED ) {

      stateLabel = getAggregationLabel( 'readyToPublish', lang );

    } else if ( state === agendaEventStates.PUBLISHED ) {

      stateLabel = getAggregationLabel( 'published', lang );

    }

    mailer( {
      recipient: user.email,
      source: getMailerLabel( 'noReply', lang ),
      replyTo: getMailerLabel( 'noReply', lang ),
      subject,
      data: {
        logo: agenda.image ? agenda.image.replace( '.com/', '.com/rwtb' ) : 'https://openagenda.com/images/openagenda.png',
        title: {
          text: subject,
          link: url
        },
        action: {
          label: getAggregationLabel( 'newAggregationAction', lang ),
          link: url
        },
        description: getAggregationLabel( 'newAggregationBody', {
          event: eventTitle,
          sourceAgenda: sourceAgenda.title,
          state: stateLabel
        }, lang )
      }
    }, ( err, result ) => {

      if ( err ) return rj( err );

      rs( result );

    } );
      

  } );

}