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
  'event.duplicate.withoutActor': {
    id: 'ActivityApps.notifications.eventDuplicate.withoutActor',
    defaultMessage: '{object} was duplicated from <hl>{duplicateOriginAgendaName}</hl> to {target}.'
  },
  'event.update': {
    id: 'ActivityApps.notifications.eventUpdate',
    defaultMessage: '{actor} updated {object} on {target}.'
  },
  'event.update.withoutActor': {
    id: 'ActivityApps.notifications.eventUpdate.withoutActor',
    defaultMessage: '{object} was updated on {target}.'
  },
  'event.delete': {
    id: 'ActivityApps.notifications.eventDelete',
    defaultMessage: '{actor} deleted {object} from {target}.'
  },
  'event.delete.withoutActor': {
    id: 'ActivityApps.notifications.eventDelete.withoutActor',
    defaultMessage: '{object} was deleted from {target}.'
  },
  'agenda.publishEvent': {
    id: 'ActivityApps.notifications.agendaPublishEvent',
    defaultMessage: '{actor} published {object} on {target}.'
  },
  'agenda.publishEvent.withoutActor': {
    id: 'ActivityApps.notifications.agendaPublishEvent.withoutActor',
    defaultMessage: '{object} was published on {target}.'
  },
  'agenda.unpublishEvent': {
    id: 'ActivityApps.notifications.agendaUnpublishEvent',
    defaultMessage: '{actor} unpublished {object} on {target}.'
  },
  'agenda.unpublishEvent.withoutActor': {
    id: 'ActivityApps.notifications.agendaUnpublishEvent.withoutActor',
    defaultMessage: '{object} was unpublished on {target}.'
  },
  'agenda.refuseEvent': {
    id: 'ActivityApps.notifications.agendaRefuseEvent',
    defaultMessage: '{actor} refused {object} on {target}.'
  },
  'agenda.refuseEvent.withoutActor': {
    id: 'ActivityApps.notifications.agendaRefuseEvent.withoutActor',
    defaultMessage: '{object} was refused on {target}.'
  },
  'agenda.removeEvent': {
    id: 'ActivityApps.notifications.agendaRemoveEvent',
    defaultMessage: '{actor} removed {object} from {target}.'
  },
  'agenda.removeEvent.withoutActor': {
    id: 'ActivityApps.notifications.agendaRemoveEvent.withoutActor',
    defaultMessage: '{object} was removed from {target}.'
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
  'agenda.systemChangeEventState': {
    id: 'ActivityApps.notifications.agendaSystemChangeEventState',
    defaultMessage: '{object} has been automatically put back in moderation as {objectCount, plural, one {it has} other {they have}} been edited by {objectCount, plural, one {its contributor} other {their contributors}} on {target}.'
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
    id: 'ActivityApps.notifications.agendaAddMember.withYou',
    defaultMessage: '{actor} added you as <hl><role>{invitedRole}</role></hl> on {target}.'
  },
  'agenda.addMember.withoutActor': {
    id: 'ActivityApps.notifications.agendaAddMember.withoutActor',
    defaultMessage: '{object} was added as <hl><role>{invitedRole}</role></hl> on {target}.'
  },
  'agenda.addMember.withYou.withoutActor': {
    id: 'ActivityApps.notifications.agendaAddMember.withYou.withoutActor',
    defaultMessage: 'You was added as <hl><role>{invitedRole}</role></hl> on {target}.'
  },
  'agenda.setMemberRole': {
    id: 'ActivityApps.notifications.agendaSetMemberRole',
    defaultMessage: '{actor} appointed {object} as <hl><role>{afterRole}</role></hl> on {target}.'
  },
  'agenda.setMemberRole.withYou': {
    id: 'ActivityApps.notifications.agendaSetMemberRole.withYou',
    defaultMessage: '{actor} appointed you as <hl><role>{afterRole}</role></hl> on {target}.'
  },
  'agenda.setMemberRole.withoutActor': {
    id: 'ActivityApps.notifications.agendaSetMemberRole.withoutActor',
    defaultMessage: '{object} was appointed as <hl><role>{afterRole}</role></hl> on {target}.'
  },
  'agenda.setMemberRole.withYou.withoutActor': {
    id: 'ActivityApps.notifications.agendaSetMemberRole.withYou.withoutActor',
    defaultMessage: 'You was appointed as <hl><role>{afterRole}</role></hl> on {target}.'
  },
  'agenda.removeMember': {
    id: 'ActivityApps.notifications.agendaRemoveMember',
    defaultMessage: '{actor} removed {object} (<hl><role>{removedRole}</role></hl>) from {target}.'
  },
  'agenda.removeMember.withYou': {
    id: 'ActivityApps.notifications.agendaRemoveMember.withYou',
    defaultMessage: '{actor} removed you (<hl><role>{removedRole}</role></hl>) from {target}.'
  },
  'agenda.removeMember.withoutActor': {
    id: 'ActivityApps.notifications.agendaRemoveMember.withoutActor',
    defaultMessage: '{object} was removed (<hl><role>{removedRole}</role></hl>) from {target}.'
  },
  'agenda.removeMember.withYou.withoutActor': {
    id: 'ActivityApps.notifications.agendaRemoveMember.withYou.withoutActor',
    defaultMessage: 'You was removed (<hl><role>{removedRole}</role></hl>) from {target}.'
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
  'agenda.addEvent.withoutActor': {
    id: 'ActivityApps.notifications.agendaAddEvent.withoutActor',
    defaultMessage: '{object} was added on {target} from <hl>{sourceAgendaName}</hl>.'
  },
});
