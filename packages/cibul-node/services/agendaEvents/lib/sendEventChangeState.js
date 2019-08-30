"use strict";

const _ = require('lodash');
const VError = require('verror');
const marked = require('marked');

const agendaEventStates = require('@openagenda/agenda-events/iso/states');
const mails = require('@openagenda/mails');

const membersSvc = require('../../members');
const usersSvc = require('../../users');

const agendaLogo = require('./utils/agendaLogo');
const eventLink = require('./utils/eventLink');
const listAdminMods = require('./utils/listAdminMods').bind(null, membersSvc);

const log = require('@openagenda/logs' )( 'agendaEvents/sendEventChangeState');

module.exports = async ({ root }, { agendaEvent, before, context, agenda, event }) => {
  log('processing');
  const afterStateLabel = getStateLabel(agendaEvent.state);
  const beforeStateLabel = getStateLabel(before.state);

  const link = eventLink(root, agenda, event);
  const logo = agendaLogo(agenda);

  const members = await listAdminMods(agenda.uid);

  const contributorUser = await usersSvc.findOne({
    query: { uid: agendaEvent.userUid }
  });

  const contributor = contributorUser ? await membersSvc.get({
    agendaUid: agenda.uid,
    userUid: contributorUser.uid
  }) : null;

  if ( agendaEvent.agendaUid === event.agendaUid ) {
    if ( !contributorUser ) {
      throw new VError( 'User matching agendaEvent.userUid %s was not found', _.get( agendaEvent, 'userUid' ) );
    } else {
      await _sendToContributor( {
        contributor,
        contributorUser,
        agendaEvent,
        agenda,
        event,
        logo,
        link,
        beforeStateLabel,
        afterStateLabel
      } );
    }
  }

  if (_.get( context, 'batched' )) {
    log( 'part of batch, not sending change state email');
    return;
  }

  await mails( {
    template: 'eventChangeState',
    to: members
      .filter( member => member.id !== _.get( contributor, 'id' ) )
      .filter( member => {
        if ( !member.user ) {
          log( 'warn', 'no user was found matching member %s', member.id );
        }

        return !!member.user;
      } )
      .map( member => {
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[ lang ] || _.find( event.title );

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [ {
            rule: [ 'receive', 'eventChangeState', { state: agendaEvent.state } ],
            dataPath: 'unsubscribeLink'
          }, {
            memberId: member.id,
            rule: [ 'receive', 'eventChangeState', { state: agendaEvent.state } ],
            dataPath: 'memberUnsubscribeLink'
          } ],
          data: {
            event: eventTitle
          }
        };
      } ),
    data: {
      agenda: agenda.title,
      beforeState: beforeStateLabel,
      afterState: afterStateLabel,
      logo,
      link
    }
  } );
  log('done');
};


async function _sendToContributor( {
  contributor,
  contributorUser,
  agendaEvent,
  agenda,
  event,
  logo,
  link,
  beforeStateLabel,
  afterStateLabel
} ) {

  const conributorLang = contributorUser.culture || 'fr';

  const sendAgendaPublicationMessage = (
    agendaEvent.state === agendaEventStates.PUBLISHED
  ) && _.get( agenda, 'settings.contribution.messages.publication');

  const to = {
    address: contributorUser.email,
    unsubscriptions: [ {
      rule: [ 'receive', 'myEventChangeState' ],
      dataPath: 'unsubscribeLink'
    }, {
      memberId: contributor.id,
      rule: [ 'receive', 'myEventChangeState' ],
      dataPath: 'memberUnsubscribeLink'
    } ]
  };

  const eventTitle = event.title[ conributorLang ] || _.find( event.title );

  const agendaTitle = agenda.title;

  if ( sendAgendaPublicationMessage ) {

    await mails( {
      template: 'eventPublishContributor',
      to,
      data: {
        eventTitle,
        agendaTitle,
        logo,
        link,
        message: marked( _.get( agenda, 'settings.contribution.messages.publication' ) )
      },
      lang: conributorLang
    } );

  } else {

    await mails( {
      template: 'myEventChangeState',
      to,
      data: {
        event: eventTitle,
        agenda: agendaTitle,
        beforeState: beforeStateLabel,
        afterState: afterStateLabel,
        logo,
        link
      },
      lang: conributorLang
    } );

  }

}

function getStateLabel( state ) {
  switch ( state ) {
    case agendaEventStates.REFUSED:
      return 'refused';
    case agendaEventStates.TOCONTROL:
      return 'tocontrol';
    case agendaEventStates.CONTROLLED:
      return 'controlled';
    case agendaEventStates.PUBLISHED:
      return 'published';
  }
}
