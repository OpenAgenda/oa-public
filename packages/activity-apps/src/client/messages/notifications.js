import { defineMessages } from 'react-intl';

export default defineMessages({
  'event.create': {
    id: 'ActivityApps.notifications.eventCreate',
    defaultMessage: '{actor} created {object} on {target}.'
  },
  'event.duplicate': {
    id: 'ActivityApps.notifications.eventDuplicate',
    defaultMessage: '{actor} duplicated {object} from <hl>{duplicateOriginAgendaName}</hl> to {target}.'
  },
  'event.update': {
    id: 'ActivityApps.notifications.eventUpdate',
    defaultMessage: '{actor} updated {object} on {target}.'
  },
  'event.delete': {
    id: 'ActivityApps.notifications.eventDelete',
    defaultMessage: '{actor} deleted {object} from {target}.'
  },
  'agenda.publishEvent': {
    id: 'ActivityApps.notifications.agendaPublishEvent',
    defaultMessage: '{actor} published {object} on {target}.'
  },
  'agenda.unpublishEvent': {
    id: 'ActivityApps.notifications.agendaUnpublishEvent',
    defaultMessage: '{actor} unpublished {object} on {target}.'
  },
  'agenda.refuseEvent': {
    id: 'ActivityApps.notifications.agendaRefuseEvent',
    defaultMessage: '{actor} refused {object} on {target}.'
  },
  'agenda.removeEvent': {
    id: 'ActivityApps.notifications.agendaRemoveEvent',
    defaultMessage: '{actor} removed {object} from {target}.'
  },
  'agenda.removeDeletedEvent': {
    id: 'ActivityApps.notifications.agendaRemoveDeletedEvent',
    defaultMessage: '{object} has been removed from {target} after {objectCount, plural, one {its} other {their}} deletion.'
  },
  'agenda.systemRemoveEvent': {
    id: 'ActivityApps.notifications.agendaSystemRemoveEvent',
    defaultMessage: '{object} has been removed from {target} after it was unpublished or removed from the source.'
  },
  'agenda.changeEventState': {
    id: 'ActivityApps.notifications.agendaChangeEventState',
    defaultMessage: '{actor} passed {object} from <hl><state>{oldState}</state></hl> to <hl><state>{newState}</state></hl> on {target}.'
  },
  'agenda.systemUnpublishEvent': {
    id: 'ActivityApps.notifications.agendaSystemUnpublishEvent',
    defaultMessage: '{object} has been automatically unpublished on {target} for moderation.'
  },
  'agenda.sendInvitation': {
    id: 'ActivityApps.notifications.agendaSendInvitation',
    defaultMessage: '{actor} invited {object} as <hl><role>{invitedRole}</role></hl> on {target}.'
  },
  'agenda.acceptInvitation': {
    id: 'ActivityApps.notifications.agendaAcceptInvitation',
    defaultMessage: '{actor} has accepted the invitation to become <hl><role>{invitedRole}</role></hl> on {target}.'
  },
  'agenda.addMember': {
    id: 'ActivityApps.notifications.agendaAddMember',
    defaultMessage: '{actor} added {object} as <hl><role>{invitedRole}</role></hl> on {target}.'
  },
  'agenda.addMember.withYou': {
    id: 'ActivityApps.notifications.agendaAddMemberWithYou',
    defaultMessage: '{actor} added you as <hl><role>{invitedRole}</role></hl> on {target}.'
  },
  'agenda.setMemberRole': {
    id: 'ActivityApps.notifications.agendaSetMemberRole',
    defaultMessage: '{actor} appointed {object} as <hl><role>{afterRole}</role></hl> on {target}.'
  },
  'agenda.setMemberRole.withYou': {
    id: 'ActivityApps.notifications.agendaSetMemberRoleWithYou',
    defaultMessage: '{actor} appointed you as <hl><role>{afterRole}</role></hl> from {target}.'
  },
  'agenda.removeMember.withYou': {
    id: 'ActivityApps.notifications.agendaRemoveMemberWithYou',
    defaultMessage: '{actor} removed you (<hl><role>{removedRole}</role></hl>) from {target}.'
  },
  'agenda.create': {
    id: 'ActivityApps.notifications.agendaCreate',
    defaultMessage: '{actor} created the agenda {target}.'
  },
  'agenda.addSource': {
    id: 'ActivityApps.notifications.agendaAddSource',
    defaultMessage: '{actor} added {object} as a source on {target}.'
  },
  'agenda.removeSource': {
    id: 'ActivityApps.notifications.agendaRemoveSource',
    defaultMessage: '{actor} removed {object} from the sources on {target}.'
  },
  'agenda.update': {
    id: 'ActivityApps.notifications.agendaUpdate',
    defaultMessage: '{actor} updated the agenda {target}.'
  },
  'agenda.setOfficial': {
    id: 'ActivityApps.notifications.agendaSetOfficial',
    defaultMessage: 'The agenda {target} became official.'
  },
  'agenda.aggregateEvent': {
    id: 'ActivityApps.notifications.agendaAggregateEvent',
    defaultMessage: '{target} aggregated {object} from {actor}.'
  },
  'agenda.addEvent': {
    id: 'ActivityApps.notifications.agendaAddEvent',
    defaultMessage: '{actor} added {object} on {target} from <hl>{sourceAgendaName}</hl>.'
  },
});
