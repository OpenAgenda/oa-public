import { defineMessages } from 'react-intl';

export default defineMessages({
  // event.create
  'eventCreate.full': {
    id: 'ActivityApps.eventCreate.full',
    defaultMessage: '<user>{userName}</user> created <event>{eventName}</event> on agenda <agenda>{agendaName}</agenda>.'
  },
  'eventCreate.actor': {
    id: 'ActivityApps.eventCreate.actor',
    defaultMessage: '<user>{userName}</user> created <event>{eventName}</event>.'
  },
  'eventCreate.target': {
    id: 'ActivityApps.eventCreate.target',
    defaultMessage: '<event>{eventName}</event> was created on agenda <agenda>{agendaName}</agenda>.'
  },
  // event.create
  'eventDuplicate.full': {
    id: 'ActivityApps.eventDuplicate.full',
    defaultMessage: '<user>{userName}</user> duplicated <event>{eventName}</event> from agenda <duplicateOriginAgenda>{duplicateOriginAgendaName}</duplicateOriginAgenda> to agenda <agenda>{agendaName}</agenda>.'
  },
  'eventDuplicate.actor': {
    id: 'ActivityApps.eventDuplicate.actor',
    defaultMessage: '<user>{userName}</user> duplicated <event>{eventName}</event> from agenda <duplicateOriginAgenda>{duplicateOriginAgendaName}</duplicateOriginAgenda>.'
  },
  'eventDuplicate.target': {
    id: 'ActivityApps.eventDuplicate.target',
    defaultMessage: '<event>{eventName}</event> was duplicated from agenda <duplicateOriginAgenda>{duplicateOriginAgendaName}</duplicateOriginAgenda> to agenda <agenda>{agendaName}</agenda>.'
  },
  // event.update
  'eventUpdate.full': {
    id: 'ActivityApps.eventUpdate.full',
    defaultMessage: '<singleDiff><user>{userName}</user> updated the field <field></field> of <event>{eventName}</event> on <agenda>{agendaName}</agenda>.</singleDiff>' +
      '<someDiff><user>{userName}</user> updated the fields <fields></fields> of <event>{eventName}</event> on <agenda>{agendaName}</agenda>.</someDiff>' +
      '<manyDiff><user>{userName}</user> updated the fields <fields></fields> of <event>{eventName}</event> on <agenda>{agendaName}</agenda>.</manyDiff>'
  },
  'eventUpdate.actor': {
    id: 'ActivityApps.eventUpdate.actor',
    defaultMessage: '<singleDiff><user>{userName}</user> updated the field <field></field> of <event>{eventName}</event>.</singleDiff>' +
      '<someDiff><user>{userName}</user> updated the fields <fields></fields> of <event>{eventName}</event>.</someDiff>' +
      '<manyDiff><user>{userName}</user> updated the fields <fields></fields> of <event>{eventName}</event>.</manyDiff>'
  },
  'eventUpdate.target': {
    id: 'ActivityApps.eventUpdate.target',
    defaultMessage: '<singleDiff>The field <field></field> of <event>{eventName}</event> was updated on <agenda>{agendaName}</agenda>.</singleDiff>' +
      '<someDiff>The fields <fields></fields> of <event>{eventName}</event> was updated on <agenda>{agendaName}</agenda>.</someDiff>' +
      '<manyDiff>The fields <fields></fields> of <event>{eventName}</event> was updated on <agenda>{agendaName}</agenda>.</manyDiff>'
  },
  // event.delete +
  'eventDelete.full': {
    id: 'ActivityApps.eventDelete.full',
    defaultMessage: '<user>{userName}</user> deleted <event>{eventName}</event> on <agenda>{agendaName}</agenda>.'
  },
  'eventDelete.actor': {
    id: 'ActivityApps.eventDelete.actor',
    defaultMessage: '<user>{userName}</user> deleted <event>{eventName}</event>.'
  },
  'eventDelete.target': {
    id: 'ActivityApps.eventDelete.target',
    defaultMessage: '<event>{eventName}</event> was deleted on <agenda>{agendaName}</agenda>.'
  },
  // agenda.publishEvent
  'publishEvent.full': {
    id: 'ActivityApps.publishEvent.full',
    defaultMessage: '<user>{userName}</user> published <event>{eventName}</event> on <agenda>{agendaName}</agenda>.'
  },
  'publishEvent.actor': {
    id: 'ActivityApps.publishEvent.actor',
    defaultMessage: '<user>{userName}</user> published <event>{eventName}</event>.'
  },
  'publishEvent.target': {
    id: 'ActivityApps.publishEvent.target',
    defaultMessage: '<event>{eventName}</event> was published on <agenda>{agendaName}</agenda>.'
  },
  // agenda.unpublishEvent
  'unpublishEvent.full': {
    id: 'ActivityApps.unpublishEvent.full',
    defaultMessage: '<user>{userName}</user> unpublished <event>{eventName}</event> on <agenda>{agendaName}</agenda>.'
  },
  'unpublishEvent.actor': {
    id: 'ActivityApps.unpublishEvent.actor',
    defaultMessage: '<user>{userName}</user> unpublished <event>{eventName}</event>.'
  },
  'unpublishEvent.target': {
    id: 'ActivityApps.unpublishEvent.target',
    defaultMessage: '<event>{eventName}</event> was unpublished on <agenda>{agendaName}</agenda>.'
  },
  // agenda.refuseEvent
  'refuseEvent.full': {
    id: 'ActivityApps.refuseEvent.full',
    defaultMessage: '<user>{userName}</user> refused <event>{eventName}</event> on <agenda>{agendaName}</agenda>.'
  },
  'refuseEvent.actor': {
    id: 'ActivityApps.refuseEvent.actor',
    defaultMessage: '<user>{userName}</user> refused <event>{eventName}</event>.'
  },
  'refuseEvent.target': {
    id: 'ActivityApps.refuseEvent.target',
    defaultMessage: '<event>{eventName}</event> was refused on <agenda>{agendaName}</agenda>.'
  },
  // agenda.removeEvent
  'removeEvent.full': {
    id: 'ActivityApps.removeEvent.full',
    defaultMessage: '<user>{userName}</user> removed <event>{eventName}</event> from <agenda>{agendaName}</agenda>.'
  },
  'removeEvent.actor': {
    id: 'ActivityApps.removeEvent.actor',
    defaultMessage: '<user>{userName}</user> removed <event>{eventName}</event>.'
  },
  'removeEvent.target': {
    id: 'ActivityApps.removeEvent.target',
    defaultMessage: '<event>{eventName}</event> was removed from <agenda>{agendaName}</agenda>.'
  },
  // agenda.removeDeletedEvent
  'removeDeletedEvent.full': {
    id: 'ActivityApps.removeDeletedEvent.full',
    defaultMessage: '<event>{eventName}</event> has been removed from <agenda>{agendaName}</agenda> after its deletion.'
  },
  'removeDeletedEvent.withoutTarget': {
    id: 'ActivityApps.removeDeletedEvent.withoutTarget',
    defaultMessage: '<event>{eventName}</event> has been removed after its deletion.'
  },
  // agenda.systemRemoveEvent
  'systemRemoveEvent.full': {
    id: 'ActivityApps.systemRemoveEvent.full',
    defaultMessage: '<event>{eventName}</event> has been removed from <agenda>{agendaName}</agenda> after it was unpublished or removed from the source.'
  },
  'systemRemoveEvent.withoutTarget': {
    id: 'ActivityApps.systemRemoveEvent.withoutTarget',
    defaultMessage: '<event>{eventName}</event> has been removed after it was unpublished or removed from the source.'
  },
  // agenda.changeEventState
  'changeEventState.full': {
    id: 'ActivityApps.changeEventState.full',
    defaultMessage: '<user>{userName}</user> passed <event>{eventName}</event> from \"<state>{oldState}</state>\" to \"<state>{newState}</state>\" on <agenda>{agendaName}</agenda>.'
  },
  'changeEventState.actor': {
    id: 'ActivityApps.changeEventState.actor',
    defaultMessage: '<user>{userName}</user> passed <event>{eventName}</event> from \"<state>{oldState}</state>\" to \"<state>{newState}</state>\".'
  },
  // agenda.systemUnpublishEvent
  'systemUnpublishEvent.full': {
    id: 'ActivityApps.systemUnpublishEvent.full',
    defaultMessage: '<event>{eventName}</event> has been automatically unpublished on <agenda>{agendaName}</agenda> for moderation.'
  },
  'systemUnpublishEvent.withoutTarget': {
    id: 'ActivityApps.systemUnpublishEvent.withoutTarget',
    defaultMessage: '<event>{eventName}</event> has been automatically unpublished for moderation.'
  },
  // agenda.sendInvitation
  'sendInvitation.full': {
    id: 'ActivityApps.sendInvitation.full',
    defaultMessage: '<user>{userName}</user> invited <email>{invited}</email> as <role>{invitedRole}</role> on <agenda>{agendaName}</agenda>.'
  },
  'sendInvitation.withoutTarget': {
    id: 'ActivityApps.sendInvitation.withoutTarget',
    defaultMessage: '<user>{userName}</user> invited <email>{invited}</email> as <role>{invitedRole}</role>.'
  },
  // agenda.acceptInvitation
  'acceptInvitation.full': {
    id: 'ActivityApps.acceptInvitation.full',
    defaultMessage: '<email>{invited}</email> has accepted the invitation of <user>{userName}</user> to become <role>{invitedRole}</role> on <agenda>{agendaName}</agenda>.'
  },
  'acceptInvitation.withoutTarget': {
    id: 'ActivityApps.acceptInvitation.withoutTarget',
    defaultMessage: '<email>{invited}</email> has accepted the invitation of <user>{userName}</user> to become <role>{invitedRole}</role>.'
  },
  // agenda.addMember
  'addMember.full': {
    id: 'ActivityApps.addMember.full',
    defaultMessage: '<user>{userName}</user> added <user>{invitedName}</user> as <role>{invitedRole}</role> on <agenda>{agendaName}</agenda>.'
  },
  'addMember.actor': {
    id: 'ActivityApps.addMember.actor',
    defaultMessage: '<user>{userName}</user> added <user>{invitedName}</user> as <role>{invitedRole}</role>.'
  },
  'addMember.target': {
    id: 'ActivityApps.addMember.target',
    defaultMessage: '<user>{invitedName}</user> was added as <role>{invitedRole}</role> on <agenda>{agendaName}</agenda>.'
  },
  // agenda.removeMember
  'removeMember.full': {
    id: 'ActivityApps.removeMember.full',
    defaultMessage: '<user>{userName}</user> removed <user>{removedMember}</user> (<role>{removedRole}</role>) from <agenda>{agendaName}</agenda>.'
  },
  'removeMember.actor': {
    id: 'ActivityApps.removeMember.actor',
    defaultMessage: '<user>{userName}</user> removed <user>{removedMember}</user> (<role>{removedRole}</role>).'
  },
  'removeMember.target': {
    id: 'ActivityApps.removeMember.target',
    defaultMessage: '<user>{removedMember}</user> (<role>{removedRole}</role>) was removed from <agenda>{agendaName}</agenda>.'
  },
  // agenda.setMemberRole
  'setMemberRole.full': {
    id: 'ActivityApps.setMemberRole.full',
    defaultMessage: '<user>{userName}</user> passed <user>{modifiedMember}</user> from <role>{beforeRole}</role> to <role>{afterRole}</role> on <agenda>{agendaName}</agenda>.'
  },
  'setMemberRole.actor': {
    id: 'ActivityApps.setMemberRole.actor',
    defaultMessage: '<user>{userName}</user> passed <user>{modifiedMember}</user> from <role>{beforeRole}</role> to <role>{afterRole}</role>.'
  },
  'setMemberRole.target': {
    id: 'ActivityApps.setMemberRole.target',
    defaultMessage: '<user>{modifiedMember}</user> was passed from <role>{beforeRole}</role> to <role>{afterRole}</role> on <agenda>{agendaName}</agenda>.'
  },
  // agenda.addSource
  'addSource.full': {
    id: 'ActivityApps.addSource.full',
    defaultMessage: '<user>{userName}</user> added <agenda>{sourceName}</agenda> as a source to <agenda>{agendaName}</agenda>.'
  },
  'addSource.withoutTarget': {
    id: 'ActivityApps.addSource.withoutTarget',
    defaultMessage: '<user>{userName}</user> added <agenda>{sourceName}</agenda> as a source.'
  },
  // agenda.removeSource
  'removeSource.full': {
    id: 'ActivityApps.removeSource.full',
    defaultMessage: '<user>{userName}</user> removed <agenda>{sourceName}</agenda> from the sources of <agenda>{agendaName}</agenda>.'
  },
  'removeSource.withoutTarget': {
    id: 'ActivityApps.removeSource.withoutTarget',
    defaultMessage: '<user>{userName}</user> removed <agenda>{sourceName}</agenda> from the sources.'
  },
  // agenda.create
  'agendaCreate': {
    id: 'ActivityApps.agendaCreate',
    defaultMessage: '<user>{userName}</user> created the agenda <agenda>{agendaName}</agenda>.'
  },
  // agenda.setOfficial
  'setOfficial.full': {
    id: 'ActivityApps.setOfficial.full',
    defaultMessage: 'The agenda <agenda>{agendaName}</agenda> became official.'
  },
  'setOfficial.withoutTarget': {
    id: 'ActivityApps.setOfficial.withoutTarget',
    defaultMessage: 'The agenda became official.'
  },
  // agenda.update
  'updateProfile.full': {
    id: 'ActivityApps.agendaUpdate.full',
    defaultMessage: '<user>{userName}</user> updated agenda <agenda>{agendaName}</agenda>.'
  },
  'updateProfile.withoutTarget': {
    id: 'ActivityApps.agendaUpdate.withoutTarget',
    defaultMessage: '<user>{userName}</user> updated agenda.'
  },
  // agenda.aggregateEvent
  'aggregateEvent.full': {
    id: 'ActivityApps.aggregateEvent.full',
    defaultMessage: '<agenda>{agendaName}</agenda> aggregated <event>{eventName}</event> from <sourceAgenda>{sourceAgendaName}</sourceAgenda>.'
  },
  'aggregateEvent.actor': {
    id: 'ActivityApps.aggregateEvent.actor',
    defaultMessage: '<event>{eventName}</event> was aggregated from <sourceAgenda>{sourceAgendaName}</sourceAgenda>.'
  },
  // agenda.addEvent
  'addEvent.full': {
    id: 'ActivityApps.addEvent.full',
    defaultMessage: '<user>{userName}</user> added <event>{eventName}</event> on <agenda>{agendaName}</agenda> from <sourceAgenda>{sourceAgendaName}</sourceAgenda>.'
  },
  'addEvent.actor': {
    id: 'ActivityApps.addEvent.actor',
    defaultMessage: '<user>{userName}</user> added <event>{eventName}</event> from <sourceAgenda>{sourceAgendaName}</sourceAgenda>.'
  },
  'addEvent.target': {
    id: 'ActivityApps.addEvent.target',
    defaultMessage: '<event>{eventName}</event> was added on <agenda>{agendaName}</agenda> from <sourceAgenda>{sourceAgendaName}</sourceAgenda>.'
  },

  XOthers: {
    id: 'ActivityApps.XOthers',
    defaultMessage: '{count, plural, =1 {# other} other {# others}}'
  }
});
