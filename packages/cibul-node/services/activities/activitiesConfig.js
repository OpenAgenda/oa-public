'use strict';

const _ = require('lodash');
const { isSuperiorToOrEqual } = require('@openagenda/members').utils.compareRoles;

function and(...args) {
  return props => args.reduce(async (accu, fn) => await accu && fn(props), true);
}

function or(...args) {
  return props => args.reduce(async (accu, fn) => await accu || fn(props), false);
}

// function not(a) {
//   return async props => !(await a(props));
// }

function getActivityEntity(activity, entity) {
  if (entity.startsWith('actor.') || entity.startsWith('object.') || entity.startsWith('target.')) {
    const [name, key] = entity.split('.');
    const identifier = activity[name];

    if (!identifier) {
      return null;
    }

    const [entityType, entityUid] = identifier.split(':');
    if (key === 'type') return entityType;
    if (key === 'uid') return parseInt(entityUid, 10);
    return null;
  }

  return _.get(activity, entity);
}

// function toDifferentAgenda({ targetFeed, activity }) {
//   return targetFeed.entityType === 'agenda' && targetFeed.entityUid !== getActivityEntity(activity, 'target.uid');
// }

function toUser(key) {
  return ({ targetFeed, activity }) =>
    targetFeed.entityType === 'user' && [].concat(getActivityEntity(activity, key)).includes(targetFeed.entityUid);
}

function toAgenda(key) {
  return ({ targetFeed, activity }) =>
    targetFeed.entityType === 'agenda' && [].concat(getActivityEntity(activity, key)).includes(targetFeed.entityUid);
}

function toLocationSet() {
  return ({ targetFeed }) => targetFeed.entityType === 'locationSet';
}

async function isPublicTargetAgenda({ activity, config: { services } }) {
  return !!await services.agendas.get(
    { uid: getActivityEntity(activity, 'target.uid') },
    { private: false },
  );
}

function isPublishedEvent({ activity }) {
  return activity.store.state === 2;
}

// function isAdmin({ follow }) {
//   return isSuperiorToOrEqual(follow.store.credential, 'administrator');
// }

function isAdminMod({ follow }) {
  return isSuperiorToOrEqual(follow.store.credential, 'moderator');
}

function isSuperiorMod({ follow, activity }) {
  return isAdminMod({ follow }) && isSuperiorToOrEqual(follow.store.credential, activity.store.credential);
}

function fromAgendaToAdminMod({ originFeed, targetFeed, follow }) {
  return originFeed.entityType === 'agenda'
    && targetFeed.entityType === 'user'
    && isAdminMod({ follow });
}

function fromLocationSetToAgenda({ originFeed, targetFeed }) {
  return originFeed.entityType === 'locationSet' && targetFeed.entityType === 'agenda';
}

// function fromAgendaToContributor({ originFeed, targetFeed, follow }) {
//   return originFeed.entityType === 'agenda'
//     && targetFeed.entityType === 'user'
//     && !isAdminMod({ follow });
// }

function fromEventToUser({ originFeed, targetFeed }) {
  return originFeed.entityType === 'event' && targetFeed.entityType === 'user';
}

function hasVisibleDiff({ activity, targetFeed, follow }) {
  if (targetFeed.entityType !== 'user') {
    return !!activity.store.diff;
  }

  if (isSuperiorToOrEqual(follow.store.credential, 'contributor') && activity.store.contributorFields?.length) {
    return true;
  }

  if (isSuperiorToOrEqual(follow.store.credential, 'moderator') && activity.store.moderatorFields?.length) {
    return true;
  }

  if (isSuperiorToOrEqual(follow.store.credential, 'administrator') && activity.store.administratorFields?.length) {
    return true;
  }

  return false;
}

async function getMember(membersSvc, userUid, agendaUid) {
  return membersSvc.get({ agendaUid, userUid });
}

function toOwner({ activity, targetFeed }) {
  return targetFeed.entityType === 'user' && targetFeed.entityUid === activity.store.ownerUid;
}

async function maskUserIsNotAdminModOf({
  norActor,
  key,
  omit,
}, {
  activity,
  targetFeed,
  config: { services },
  preloadedRole,
}) {
  if (norActor && targetFeed.entityUid === getActivityEntity(activity, 'actor.uid')) {
    return;
  }

  const role = preloadedRole === undefined
    ? (await getMember(
      services.members,
      targetFeed.entityUid,
      getActivityEntity(activity, key),
    ))?.role
    : null;

  if (!role || !isSuperiorToOrEqual(role, 'moderator')) {
    return omit;
  }
}

function maskFor({ sameAgenda, otherAgenda, userIsNotAdminModOf }) {
  return async ({
    activity,
    targetFeed,
    config,
    preloadedRole,
  }) => {
    // on the agenda
    if (
      sameAgenda
      && targetFeed.entityType === 'agenda'
      && targetFeed.entityUid === getActivityEntity(activity, sameAgenda.key)
    ) {
      return sameAgenda.omit;
    }
    // on an other agenda
    if (
      otherAgenda
      && targetFeed.entityType === 'agenda'
      && targetFeed.entityUid !== getActivityEntity(activity, otherAgenda.key)
    ) {
      return otherAgenda.omit;
    }
    // user is not adminMod [nor actor]
    if (userIsNotAdminModOf && targetFeed.entityType === 'user') {
      return maskUserIsNotAdminModOf(userIsNotAdminModOf, {
        activity,
        targetFeed,
        config,
        preloadedRole,
      });
    }
  };
}

const activitiesConfig = {
  'event.create': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: or(
      fromEventToUser,
      toAgenda('target.uid'),
      fromAgendaToAdminMod,
    ),
    labelIds: [
      ['ActivityApps.eventCreate.full', ['actor', 'store.labels.target']],
      ['ActivityApps.eventCreate.actor', ['actor']],
      ['ActivityApps.eventCreate.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'event.duplicate': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      fromEventToUser,
      toAgenda('target.uid'), // to agenda
      fromAgendaToAdminMod, // to adminMods
      and(
        isPublishedEvent,
        isPublicTargetAgenda,
        or(
          toAgenda('store.duplicateOriginAgendaUid'), // duplicate origin agenda
          toOwner,
        ),
      ),
    ),
    labelIds: [
      ['ActivityApps.eventDuplicate.full', ['actor', 'store.labels.target']],
      ['ActivityApps.eventDuplicate.actor', ['actor']],
      ['ActivityApps.eventDuplicate.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      duplicateOriginAgendaUid: 'store.duplicateOriginAgendaUid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
      duplicateOriginAgendaName: 'store.labels.duplicateOriginAgenda',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      duplicateOriginAgenda: {
        link: '/agendas/:duplicateOriginAgendaUid',
        filter: 'actor',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target', 'store.duplicateOriginAgendaUid'],
    },
  },
  'event.update': {
    mask: async props => {
      const { activity, targetFeed, config } = props;
      const membersSvc = config.services.members;

      // preload member role, avoid double get
      const role = targetFeed.entityType === 'user'
        ? (await getMember(
          membersSvc,
          targetFeed.entityUid,
          getActivityEntity(activity, 'target.uid'),
        ))?.role
        : null;

      const toOmit = await maskFor({
        sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
        otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
        userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      })({ ...props, preloadedRole: role }) || [];

      // Always omit the diff object
      toOmit.push('store.diff');

      if (role) {
        if (!isSuperiorToOrEqual(role, 'administrator')) toOmit.push('store.administratorFields');
        if (!isSuperiorToOrEqual(role, 'moderator')) toOmit.push('store.moderatorFields');
        if (!isSuperiorToOrEqual(role, 'contributor')) toOmit.push('store.contributorFields');
      }

      return toOmit;
    },
    filterFollows: [
      hasVisibleDiff,
      or(
        fromEventToUser,
        toAgenda('target.uid'),
        fromAgendaToAdminMod,
      ),
    ],
    labelIds: [
      ['ActivityApps.eventUpdate.full', ['actor', 'store.labels.target']],
      ['ActivityApps.eventUpdate.actor', ['actor']],
      ['ActivityApps.eventUpdate.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
      singleDiff: {},
      someDiff: {},
      manyDiff: {},
      field: {},
      fields: {},
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'event.delete': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      fromEventToUser,
      toAgenda('target.uid'),
      fromAgendaToAdminMod,
    ),
    labelIds: [
      ['ActivityApps.eventDelete.full', ['actor', 'store.labels.target']],
      ['ActivityApps.eventDelete.actor', ['actor']],
      ['ActivityApps.eventDelete.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        highlight: true,
        // link: '/agendas/:agendaUid/events/:eventUid',
        // filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  /*
  * agenda.publishEvent:
  *   event -> agenda target -> adminMods
  *         -> contributor
  *         if agenda target is public:
  *           -> source agenda -> adminMods
  *           -> origin agenda -> adminMods
  *           -> event owner
  * */
  'agenda.publishEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('store.contributorUid'), // to contributor
      and(
        isPublicTargetAgenda,
        or(
          toAgenda('store.sourceAgendaUids'), // source agendas
          toAgenda('store.originAgendaUid'), // origin agenda
          toOwner,
        ),
      ),
    ),
    labelIds: [
      ['ActivityApps.publishEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.publishEvent.actor', ['actor']],
      ['ActivityApps.publishEvent.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.unpublishEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('store.contributorUid'), // to contributor
      and(
        isPublicTargetAgenda,
        or(
          toAgenda('store.sourceAgendaUids'), // source agendas
          toAgenda('store.originAgendaUid'), // origin agenda
          toOwner,
        ),
      ),
    ),
    labelIds: [
      ['ActivityApps.unpublishEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.unpublishEvent.actor', ['actor']],
      ['ActivityApps.unpublishEvent.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.refuseEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('store.contributorUid'), // to contributor
      and(
        isPublicTargetAgenda,
        or(
          toAgenda('store.sourceAgendaUids'), // source agendas
          toAgenda('store.originAgendaUid'), // origin agenda
          toOwner,
        ),
      ),
    ),
    labelIds: [
      ['ActivityApps.refuseEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.refuseEvent.actor', ['actor']],
      ['ActivityApps.refuseEvent.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  /*
  * agenda.removeEvent:
  *   event -> agenda target -> adminMods
  *         -> contributor
  *         if is published and agenda target is public:
  *           -> source agendas -> adminMods
  *           -> origin agenda -> adminMods
  *           -> event owner
  * */
  'agenda.removeEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('actor.uid'), // to contributor
      and(
        isPublishedEvent,
        isPublicTargetAgenda,
        or(
          toAgenda('sourceAgendaUids'), // source agendas
          toAgenda('store.originAgendaUid'), // origin agenda
          toOwner,
        ),
      ),
    ),
    labelIds: [
      ['ActivityApps.removeEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.removeEvent.actor', ['actor']],
      ['ActivityApps.removeEvent.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        highlight: true,
        // link: '/agendas/:agendaUid/events/:eventUid',
        // filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  /*
  * agenda.removeDeletedEvent:
  *   event -> agenda target -> adminMods
  *         -> contributor
  * */
  'agenda.removeDeletedEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('store.contributorUid'), // to contributor
    ),
    labelIds: [
      ['ActivityApps.removeDeletedEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.removeDeletedEvent.withoutTarget', []],
    ],
    entities: {
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      event: {
        highlight: true,
        // link: '/agendas/:agendaUid/events/:eventUid',
        // filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.systemRemoveEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('store.contributorUid'), // to contributor
    ),
    labelIds: [
      ['ActivityApps.systemRemoveEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.systemRemoveEvent.withoutTarget', []],
    ],
    entities: {
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      event: {
        highlight: true,
        // link: '/agendas/:agendaUid/events/:eventUid',
        // filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  /*
  * agenda.changeEventState:
  *   event -> agenda target -> adminMods
  * */
  'agenda.changeEventState': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to target agenda
      fromAgendaToAdminMod, // to adminMods
    ),
    labelIds: [
      ['ActivityApps.changeEventState.full', ['actor', 'store.labels.target']],
      ['ActivityApps.changeEventState.actor', ['actor']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
      oldState: 'store.oldState',
      newState: 'store.newState',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
      state: {
        highlight: true,
      },
    },
    notifications: {
      groupBy: ['target', 'store.newState'],
    },
  },
  /*
  * agenda.systemUnpublishEvent:
  *   event -> agenda target -> adminMods
  *         -> contributor
  * */
  'agenda.systemUnpublishEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('store.contributorUid'), // to contributor
    ),
    labelIds: [
      ['ActivityApps.systemUnpublishEvent.full', ['store.labels.target']],
      ['ActivityApps.systemUnpublishEvent.withoutTarget', []],
    ],
    entities: {
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.sendInvitation': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: isSuperiorMod,
    labelIds: [
      ['ActivityApps.sendInvitation.full', ['store.labels.target']],
      ['ActivityApps.sendInvitation.withoutTarget', []],
    ],
    entities: {
      userUid: 'actor.uid',
      userName: 'store.labels.actor',
      invited: 'store.labels.object',
      invitedRole: 'store.role',
      agendaUid: 'target.uid',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
      },
      email: {
        highlight: true,
      },
      role: {
        highlight: true,
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target', 'store.role'],
    },
  },
  'agenda.acceptInvitation': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: isSuperiorMod,
    labelIds: [
      ['ActivityApps.acceptInvitation.full', ['store.labels.target']],
      ['ActivityApps.acceptInvitation.withoutTarget', []],
    ],
    entities: {
      userUid: 'object.uid',
      userName: 'store.labels.object',
      invited: 'store.labels.actor',
      invitedRole: 'store.role',
      agendaUid: 'target.uid',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
      },
      email: {
        highlight: true,
      },
      role: {
        highlight: true,
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target', 'store.role'],
    },
  },
  'agenda.addMember': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      userIsNotAdminModOf: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toUser('object.uid'),
      isSuperiorMod,
    ),
    labelIds: [
      ['ActivityApps.addMember.full', ['actor', 'store.labels.target']],
      ['ActivityApps.addMember.actor', ['actor']],
      ['ActivityApps.addMember.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      userName: 'store.labels.actor',
      invitedUid: 'object.uid',
      invitedName: 'store.labels.object',
      invitedRole: 'store.role',
      agendaUid: 'target.uid',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
      },
      role: {
        highlight: true,
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ({ feed, activity }) => {
        if (`${feed.entityType}:${feed.entityUid}` === activity.object) {
          return ['target', 'object', 'store.role'];
        }
        return ['target', 'store.role'];
      },
    },
  },
  'agenda.setMemberRole': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      userIsNotAdminModOf: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toUser('object.uid'),
      isSuperiorMod,
    ),
    labelIds: [
      ['ActivityApps.setMemberRole.full', ['actor', 'store.labels.target']],
      ['ActivityApps.setMemberRole.actor', ['actor']],
      ['ActivityApps.setMemberRole.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      userName: 'store.labels.actor',
      modifiedMember: 'store.labels.object',
      beforeRole: 'store.beforeRole',
      afterRole: 'store.role',
      agendaUid: 'target.uid',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
      },
      role: {
        highlight: true,
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ({ feed, activity }) => {
        if (`${feed.entityType}:${feed.entityUid}` === activity.object) {
          return ['target', 'object', 'store.role'];
        }
        return ['target', 'store.role'];
      },
    },
  },
  'agenda.removeMember': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      userIsNotAdminModOf: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toUser('object.uid'),
      isSuperiorMod,
    ),
    labelIds: [
      ['ActivityApps.removeMember.full', ['actor', 'store.labels.target']],
      ['ActivityApps.removeMember.actor', ['actor']],
      ['ActivityApps.removeMember.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      userName: 'store.labels.actor',
      removedMember: 'store.labels.object',
      removedRole: 'store.role',
      agendaUid: 'target.uid',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
      },
      role: {
        highlight: true,
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ({ feed, activity }) => {
        if (`${feed.entityType}:${feed.entityUid}` === activity.object) {
          return ['target', 'object', 'store.role'];
        }
        return ['target', 'store.role'];
      },
    },
  },
  'agenda.create': {
    labelId: 'ActivityApps.agendaCreate',
    entities: {
      userUid: 'actor.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.addSource': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: isAdminMod,
    labelIds: [
      ['ActivityApps.addSource.full', ['actor', 'store.labels.target']],
      ['ActivityApps.addSource.withoutTarget', []],
    ],
    entities: {
      userUid: 'actor.uid',
      sourceUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      sourceName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.removeSource': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: isAdminMod,
    labelIds: [
      ['ActivityApps.removeSource.full', ['actor', 'store.labels.target']],
      ['ActivityApps.removeSource.withoutTarget', []],
    ],
    entities: {
      userUid: 'actor.uid',
      sourceUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      sourceName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.update': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: isAdminMod,
    labelIds: [
      ['ActivityApps.agendaUpdate.full', ['actor', 'store.labels.target']],
      ['ActivityApps.agendaUpdate.withoutTarget', []],
    ],
    entities: {
      userUid: 'actor.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  'agenda.setOfficial': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: isAdminMod,
    labelIds: [
      ['ActivityApps.setOfficial.full', ['store.labels.target']],
      ['ActivityApps.setOfficial.withoutTarget', []],
    ],
    entities: {
      agendaUid: 'target.uid',
      agendaName: 'store.labels.target',
    },
    tags: {
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: null,
    },
  },
  /*
  * agenda.aggregateEvent:
  *   event -> agenda target -> adminMods
  *         if is published and agenda target is public:
  *           -> source agenda -> adminMods
  *           -> origin agenda -> adminMods
  *           -> event owner
  * */
  'agenda.aggregateEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      and(
        isPublishedEvent,
        isPublicTargetAgenda,
        or(
          toAgenda('actor.uid'), // source agenda
          toAgenda('store.originAgendaUid'), // origin agenda
          toOwner,
        ),
      ),
    ),
    labelIds: [
      ['ActivityApps.aggregateEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.aggregateEvent.actor', ['actor']],
    ],
    entities: {
      sourceAgendaUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      sourceAgendaName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      sourceAgenda: {
        link: '/agendas/:sourceAgendaUid',
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  /*
  * agenda.addEvent:
  *   event -> agenda target -> adminMods
  *         -> contributor
  *         if is published and agenda target is public:
  *           -> source agenda -> adminMods
  *           -> origin agenda -> adminMods
  *           -> event owner
  * */
  'agenda.addEvent': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toAgenda('target.uid'), // to aggregator
      fromAgendaToAdminMod, // to adminMods
      toUser('actor.uid'), // to contributor
      and(
        isPublishedEvent,
        isPublicTargetAgenda,
        or(
          toAgenda('store.sourceAgendaUid'), // source agenda
          toAgenda('store.originAgendaUid'), // origin agenda
          toOwner,
        ),
      ),
    ),
    labelIds: [
      ['ActivityApps.addEvent.full', ['actor', 'store.labels.target']],
      ['ActivityApps.addEvent.actor', ['actor']],
      ['ActivityApps.addEvent.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      eventUid: 'object.uid',
      agendaUid: 'target.uid',
      sourceAgendaUid: 'store.sourceAgendaUid',
      userName: 'store.labels.actor',
      eventName: 'store.labels.object',
      agendaName: 'store.labels.target',
      sourceAgendaName: 'store.labels.sourceAgenda',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      event: {
        link: '/agendas/:agendaUid/events/:eventUid',
        filter: 'object',
      },
      sourceAgenda: {
        link: '/agendas/:sourceAgendaUid',
        filter: 'actor',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: {
      groupBy: ['target'],
    },
  },
  /*
  * location.create:
  *   location -> agenda target -> adminMods
  *            -> locationSet
  *              -> agendas -> adminMods
  *            -> creator
  * */
  'location.create': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toLocationSet(), // to location set
      fromLocationSetToAgenda,
      toAgenda('target.uid'), // to agenda
      fromAgendaToAdminMod, // to adminMods
      toUser('actor.uid'),
    ),
    labelIds: [
      ['ActivityApps.locationCreate.full', ['actor', 'store.labels.target']],
      ['ActivityApps.locationCreate.actor', ['actor']],
      ['ActivityApps.locationCreate.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      locationUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      locationName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      location: {
        highlight: true,
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: null,
  },
  'location.update': {
    mask: async props => {
      const { activity, targetFeed, config } = props;
      const membersSvc = config.services.members;

      // preload member role, avoid double get
      const role = targetFeed.entityType === 'user'
        ? (await getMember(
          membersSvc,
          targetFeed.entityUid,
          getActivityEntity(activity, 'target.uid'),
        ))?.role
        : null;

      const toOmit = await maskFor({
        sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
        otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
        userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      })({ ...props, preloadedRole: role }) || [];

      // Always omit the diff object
      toOmit.push('store.diff');

      if (role) {
        if (!isSuperiorToOrEqual(role, 'administrator')) toOmit.push('store.administratorFields');
        if (!isSuperiorToOrEqual(role, 'moderator')) toOmit.push('store.moderatorFields');
        if (!isSuperiorToOrEqual(role, 'contributor')) toOmit.push('store.contributorFields');
      }

      return toOmit;
    },
    filterFollows: or(
      toLocationSet(), // to location set
      fromLocationSetToAgenda,
      toAgenda('target.uid'), // to agenda
      fromAgendaToAdminMod, // to adminMods
      toUser('actor.uid'),
    ),
    labelIds: [
      ['ActivityApps.locationUpdate.full', ['actor', 'store.labels.target']],
      ['ActivityApps.locationUpdate.actor', ['actor']],
      ['ActivityApps.locationUpdate.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      locationUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      locationName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      location: {
        highlight: true,
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
      singleDiff: {},
      someDiff: {},
      manyDiff: {},
      locationField: {},
      locationFields: {},
    },
    notifications: null,
  },
  'location.merge': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toLocationSet(), // to location set
      fromLocationSetToAgenda,
      toAgenda('target.uid'), // to agenda
      fromAgendaToAdminMod, // to adminMods
      toUser('actor.uid'),
    ),
    labelIds: [
      ['ActivityApps.locationMerge.full', ['actor', 'store.labels.target']],
      ['ActivityApps.locationMerge.actor', ['actor']],
      ['ActivityApps.locationMerge.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      locationUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      locationName: 'store.labels.object',
      agendaName: 'store.labels.target',
      mergedCount: 'store.mergedCount',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      location: {
        highlight: true,
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
      mergedOthers: {},
    },
    notifications: null,
  },
  'location.remove': {
    mask: maskFor({
      sameAgenda: { key: 'target.uid', omit: ['store.labels.target'] },
      otherAgenda: { key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
      userIsNotAdminModOf: { norActor: true, key: 'target.uid', omit: ['actor', 'store.labels.actor'] },
    }),
    filterFollows: or(
      toLocationSet(), // to location set
      fromLocationSetToAgenda,
      toAgenda('target.uid'), // to agenda
      fromAgendaToAdminMod, // to adminMods
      toUser('actor.uid'),
    ),
    labelIds: [
      ['ActivityApps.locationRemove.full', ['actor', 'store.labels.target']],
      ['ActivityApps.locationRemove.actor', ['actor']],
      ['ActivityApps.locationRemove.target', ['store.labels.target']],
    ],
    entities: {
      userUid: 'actor.uid',
      locationUid: 'object.uid',
      agendaUid: 'target.uid',
      userName: 'store.labels.actor',
      locationName: 'store.labels.object',
      agendaName: 'store.labels.target',
    },
    tags: {
      user: {
        highlight: true,
        filter: 'actor',
      },
      location: {
        highlight: true,
        filter: 'object',
      },
      agenda: {
        link: '/agendas/:agendaUid',
        filter: 'target',
      },
    },
    notifications: null,
  },
};

module.exports = activitiesConfig;
