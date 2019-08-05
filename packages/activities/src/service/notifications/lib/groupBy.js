"use strict";

module.exports = {
  'agenda.sendInvitation': [ 'target', 'store.credential' ],
  'agenda.acceptInvitation': [ 'target', 'store.credential' ],
  'agenda.addMember': [ 'target', 'store.credential' ],
  'agenda.removeMember': [ 'target', 'store.credential' ],
  'agenda.setMemberRole': [ 'target', 'store.credential' ],
  'agenda.addSource': [ 'target' ],
  'agenda.removeSource': [ 'target' ],
  'agenda.create': [ 'target' ], // Normally never seen
  'agenda.updateContribution': [ 'target' ],
  'agenda.updateProfile': [ 'target' ],
  'agenda.rename': [ 'target', 'store.labels.beforeTitle', 'store.labels.afterTitle' ],
  'agenda.changeEventState': [ 'target', 'store.newState' ],
  'agenda.publishEvent': [ 'target' ],
  'agenda.unpublishEvent': [ 'target' ],
  'agenda.removeEvent': [ 'target' ],
  'agenda.setOfficial': [ 'target', 'store.officialized' ],
  'agenda.aggregateEvent': [ 'actor', 'target' ],
  'agenda.addEvent': [ 'target', 'store.sourceAgenda' ],
  'event.create': [ 'target' ],
  'event.update': [ 'target' ],
  'event.delete': [ 'target' ]
}
