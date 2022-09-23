'use strict';

const { getLocaleValue } = require('@openagenda/intl');
const { defineMessages } = require('react-intl');
const get = require('lodash/get');
const escape = require('lodash/escape');
const notificationsMessages = require('./client/messages/notifications');
const formatState = require('./client/utils/formatState');
const formatRole = require('./client/utils/formatRole');

const subjectTypeLabels = defineMessages({
  user: {
    id: 'ActivityApps.notifications.user',
    defaultMessage: '{others, plural, =0 {{user}} one {{user} and 1 other user} other {{user} and {others} other users}}'
  },
  agenda: {
    id: 'ActivityApps.notifications.agenda',
    defaultMessage: '{others, plural, =0 {{agenda}} one {{agenda} and 1 other agenda} other {{agenda} and {others} other agendas}}'
  },
  event: {
    id: 'ActivityApps.notifications.event',
    defaultMessage: '{others, plural, =0 {{event}} one {{event} and 1 other event} other {{event} and {others} other events}}'
  },
  email: {
    id: 'ActivityApps.notifications.email',
    defaultMessage: '{others, plural, =0 {{email}} one {{email} and 1 other} other {{email} and {others} others}}'
  }
});

function isAdminMod(role) {
  return [2, 3, '2', '3', 'administrator', 'moderator'].includes(role);
}

function getGroupBy(notification) {
  if (!notification.groupBy) return [];

  return notification.groupBy.split('|').map(v => v.split(':')[0]);
}

// actor, object, target related
// return type, counter, firstUid, label for each
function getSubjectsProps(notification) {
  return ['actor', 'object', 'target'].reduce((accu, columnName) => {
    if (!notification.store[columnName]?.length) {
      return result;
    }

    const columnStore = notification.store[columnName]// array like with 0 and length keys
    const [type, firstUid] = columnStore[0].split(':');
    const counter = columnStore.length;
    const label = notification.store.labels[columnName];

    accu[columnName] = {
      type,
      firstUid,
      counter,
      label,
    };

    return accu;
  }, {});
}

function getSubjects(intl, notification, subjectsProps) {
  const groupBy = getGroupBy(notification);

  return ['actor', 'object', 'target'].reduce((accu, columnName) => {
    if (!subjectsProps[columnName]) {
      return result;
    }

    const { type, label, counter } = subjectsProps[columnName];

    if (groupBy.includes(columnName)) { // unique
      accu[columnName] = getLocaleValue(label, intl.locale);
    } else { // multiple
      accu[columnName] = intl.formatMessage(subjectTypeLabels[type], {
        [type]: getLocaleValue(label, intl.locale),
        others: counter >= 100 ? '99+' : counter - 1,
      });
    }

    return accu;
  }, {});
}

function getAdditionalSubjects(intl, config, notification) {
  const { entities } = config;

  return Object.keys(entities).reduce((result, key) => {
    const path = entities[key];

    if (
      path.startsWith('actor.') || path.startsWith('object.') || path.startsWith('target.')
      || path.match(/store\.labels\.((actor)|(object)|(target))/)
    ) {
      return result;
    }

    const value = get(notification, path);

    if (value !== undefined) {
      result[key] = getLocaleValue(value, intl.locale);
    }

    return result;
  }, {});
}

function formatUrl(url, subjectsProps) {
  let result = url;

  for (const key in subjectsProps) {
    result = result.replace(`:${key}`, subjectsProps[key].firstUid);
  }

  return result;
}

// xCount, xMore for subjects
// highlight, state, role
function getLabelValues(intl, { subjects, subjectsProps, additionalSubjects }, options) {
  const {
    renderHighlight,
    escape: isEscaped
  } = options;
  const renders = {
    hl: chunks => renderHighlight(chunks[0]),
    state: chunks => formatState(intl, chunks[0]),
    role: chunks => formatRole(intl, chunks[0]),
  };

  const additionalValues = Object.keys(additionalSubjects).reduce((result, key) => {
    const value = additionalSubjects[key];
    if (typeof value === 'number') {
      result[key] = value;
      return result;
    }

    result[key] = isEscaped ? escape(value) : value;
    return result;
  }, {});

  return Object.keys(subjects).reduce((result, key) => {
    const { counter } = subjectsProps[key];
    const value = isEscaped ? escape(subjects[key]) : escape(subjects[key]);
    result[key] = renderHighlight(value);
    result[`${key}Count`] = counter;
    result[`${key}More`] = counter - 1;
    return result;
  }, { ...renders, ...additionalValues });
}

function getProps(notification, options) {
  const { intl, config } = options;

  const subjectsProps = getSubjectsProps(notification);
  const subjects = getSubjects(intl, notification, subjectsProps);
  const additionalSubjects = getAdditionalSubjects(intl, config, notification);
  const values = getLabelValues(intl, { subjects, subjectsProps, additionalSubjects }, options);

  return {
    subjectsProps,
    subjects,
    additionalSubjects,
    values,
  };
}

exports['event.create'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['event.create'], values),
    };
  }

  return {
    url: '/agendas/:target',
    label: intl.formatMessage(notificationsMessages['event.create'], values),
  };
};

exports['event.duplicate'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['event.duplicate'], values),
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['event.duplicate'], values),
  };
};

exports['event.update'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['event.update'], values),
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['event.update'], values),
  };
};

exports['event.delete'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['event.delete'], values),
  };
};

exports['agenda.publishEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['agenda.publishEvent'], values),
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.publishEvent'], values),
  };
};

exports['agenda.unpublishEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.unpublishEvent'], values),
  };
};

exports['agenda.refuseEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.refuseEvent'], values),
  };
};

exports['agenda.removeEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.removeEvent'], values),
  };
};

exports['agenda.removeDeletedEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.removeDeletedEvent'], values),
  };
};

exports['agenda.systemRemoveEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.systemRemoveEvent'], values),
  };
};

exports['agenda.changeEventState'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['agenda.systemRemoveEvent'], values),
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.systemRemoveEvent'], values),
  };
};

exports['agenda.systemUnpublishEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['agenda.systemUnpublishEvent'], values),
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.systemUnpublishEvent'], values),
  };
};

exports['agenda.sendInvitation'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/members', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.sendInvitation'], values),
  };
};

exports['agenda.acceptInvitation'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/members', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.acceptInvitation'], values),
  };
};

exports['agenda.addMember'] = (notification, options, userUid) => {
  const { intl } = options;
  const { subjectsProps, additionalSubjects, values } = getProps(notification, options);

  const url = isAdminMod(additionalSubjects.invitedRole)
    ? '/agendas/:target/admin/members'
    : '/agendas/:target';

  const messageKey = subjectsProps.object.firstUid === userUid
    ? 'agenda.addMember.withYou'
    : 'agenda.addMember'

  return {
    url: formatUrl(url, subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

exports['agenda.setMemberRole'] = (notification, options, userUid) => {
  const { intl } = options;
  const { subjectsProps, additionalSubjects, values } = getProps(notification, options);

  const url = isAdminMod(additionalSubjects.afterRole)
    ? '/agendas/:target/admin/members'
    : '/agendas/:target';

  const messageKey = subjectsProps.object.firstUid === userUid
    ? 'agenda.addMember.withYou'
    : 'agenda.addMember'

  return {
    url: formatUrl(url, subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

exports['agenda.removeMember'] = (notification, options, userUid) => {
  const { intl } = options;
  const { subjectsProps, additionalSubjects, values } = getProps(notification, options);

  const url = isAdminMod(additionalSubjects.removedRole)
    ? '/agendas/:target/admin/members'
    : '/agendas/:target';

  const messageKey = subjectsProps.object.firstUid === userUid
    ? 'agenda.addMember.withYou'
    : 'agenda.addMember'

  return {
    url: formatUrl(url, subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

exports['agenda.create'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.create'], values),
  };
};

exports['agenda.addSource'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/sources', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.addSource'], values),
  };
};

exports['agenda.removeSource'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/sources', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.removeSource'], values),
  };
};

exports['agenda.update'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.update'], values),
  };
};

exports['agenda.setOfficial'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.setOfficial'], values),
  };
};

exports['agenda.aggregateEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['agenda.aggregateEvent'], values),
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.aggregateEvent'], values),
  };
};

exports['agenda.addEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label: intl.formatMessage(notificationsMessages['agenda.addEvent'], values),
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.addEvent'], values),
  };
};
