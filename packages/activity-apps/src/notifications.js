import { getLocaleValue } from '@openagenda/intl';
import { defineMessages } from 'react-intl';
import get from 'lodash/get.js';
import escape from 'lodash/escape.js';
import notificationsMessages from './client/messages/notifications.js';
import formatState from './client/utils/formatState.js';
import { formatRole } from './client/utils/formatRole.js';

const subjectTypeLabels = defineMessages({
  user: {
    id: 'ActivityApps.notifications.user',
    defaultMessage:
      '{others, plural, =0 {{user}} one {{user} and 1 other user} other {{user} and {others} other users}}',
  },
  agenda: {
    id: 'ActivityApps.notifications.agenda',
    defaultMessage:
      '{others, plural, =0 {{agenda}} one {{agenda} and 1 other agenda} other {{agenda} and {others} other agendas}}',
  },
  event: {
    id: 'ActivityApps.notifications.event',
    defaultMessage:
      '{others, plural, =0 {{event}} one {{event} and 1 other event} other {{event} and {others} other events}}',
  },
  email: {
    id: 'ActivityApps.notifications.email',
    defaultMessage:
      '{others, plural, =0 {{email}} one {{email} and 1 other} other {{email} and {others} others}}',
  },
});

function isAdminMod(role) {
  return [2, 3, '2', '3', 'administrator', 'moderator'].includes(role);
}

function getGroupBy({ groupBy }) {
  if (!groupBy) return [];

  return groupBy.split('|').map((v) => v.split(':')[0]);
}

// actor, object, target related
// return type, counter, firstUid, label for each
function getSubjectsProps({ store }) {
  return ['actor', 'object', 'target'].reduce((accu, columnName) => {
    if (!store[columnName]?.length) {
      return accu;
    }

    const columnStore = store[columnName]; // array like with 0 and length keys
    const [type, firstUid] = columnStore[0].split(':');
    const counter = columnStore.length;
    const label = store.labels[columnName];

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
      return accu;
    }

    const { type, label, counter } = subjectsProps[columnName];

    if (groupBy.includes(columnName)) {
      // unique
      accu[columnName] = getLocaleValue(label, intl.locale);
    } else {
      // multiple
      accu[columnName] = intl.formatMessage(subjectTypeLabels[type], {
        [type]: getLocaleValue(label, intl.locale),
        others: counter >= 100 ? '99+' : counter - 1,
      });
    }

    return accu;
  }, {});
}

function getAdditionalSubjects({ locale }, config, notification) {
  const { entities } = config;

  return Object.keys(entities).reduce((result, key) => {
    const path = entities[key];

    if (
      path.startsWith('actor.')
      || path.startsWith('object.')
      || path.startsWith('target.')
      || path.match(/store\.labels\.((actor)|(object)|(target))/)
    ) {
      return result;
    }

    const value = get(notification, path);

    if (value !== undefined) {
      result[key] = getLocaleValue(value, locale);
    }

    return result;
  }, {});
}

function formatUrl(url, subjectsProps) {
  let result = url;

  for (const key in subjectsProps) {
    if (Object.hasOwn(subjectsProps, key)) {
      result = result.replace(`:${key}`, subjectsProps[key].firstUid);
    }
  }

  return result;
}

// xCount, xMore for subjects
// highlight, state, role
function getLabelValues(
  intl,
  { subjects, subjectsProps, additionalSubjects },
  options,
) {
  const { renderHighlight, escape: isEscaped } = options;
  const renders = {
    hl: (chunks) => renderHighlight(chunks[0]),
    state: (chunks) => formatState(intl, chunks[0]),
    role: (chunks) => formatRole(intl, chunks[0]),
  };

  const additionalValues = Object.keys(additionalSubjects).reduce(
    (result, key) => {
      const value = additionalSubjects[key];
      if (typeof value === 'number') {
        result[key] = value;
        return result;
      }

      result[key] = isEscaped ? escape(value) : value;
      return result;
    },
    {},
  );

  return Object.keys(subjects).reduce(
    (result, key) => {
      const { counter } = subjectsProps[key];
      const value = isEscaped ? escape(subjects[key]) : subjects[key];
      result[key] = renderHighlight(value);
      result[`${key}Count`] = counter;
      result[`${key}More`] = counter - 1;
      return result;
    },
    { ...renders, ...additionalValues },
  );
}

function getProps(notification, options) {
  const { intl, config } = options;

  const subjectsProps = getSubjectsProps(notification);
  const subjects = getSubjects(intl, notification, subjectsProps);
  const additionalSubjects = getAdditionalSubjects(intl, config, notification);
  const values = getLabelValues(
    intl,
    { subjects, subjectsProps, additionalSubjects },
    options,
  );

  return {
    subjectsProps,
    subjects,
    additionalSubjects,
    values,
  };
}

const toExports = {};

toExports['event.create'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const label = intl.formatMessage(
    notificationsMessages['event.create'],
    values,
  );

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['event.duplicate'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'event.duplicate'
    : 'event.duplicate.withoutActor';
  const label = intl.formatMessage(notificationsMessages[messageKey], values);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['event.update'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'event.update'
    : 'event.update.withoutActor';
  const label = intl.formatMessage(notificationsMessages[messageKey], values);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['event.delete'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'event.delete'
    : 'event.delete.withoutActor';

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

toExports['agenda.publishEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'agenda.publishEvent'
    : 'agenda.publishEvent.withoutActor';
  const label = intl.formatMessage(notificationsMessages[messageKey], values);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['agenda.unpublishEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'agenda.unpublishEvent'
    : 'agenda.unpublishEvent.withoutActor';

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

toExports['agenda.refuseEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'agenda.refuseEvent'
    : 'agenda.refuseEvent.withoutActor';

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

toExports['agenda.removeEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'agenda.removeEvent'
    : 'agenda.removeEvent.withoutActor';

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

toExports['agenda.removeDeletedEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(
      notificationsMessages['agenda.removeDeletedEvent'],
      values,
    ),
  };
};

toExports['agenda.systemRemoveEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(
      notificationsMessages['agenda.systemRemoveEvent'],
      values,
    ),
  };
};

toExports['agenda.changeEventState'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const label = intl.formatMessage(
    notificationsMessages['agenda.systemRemoveEvent'],
    values,
  );

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['agenda.systemUnpublishEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const label = intl.formatMessage(
    notificationsMessages['agenda.systemUnpublishEvent'],
    values,
  );

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['agenda.systemChangeEventState'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const label = intl.formatMessage(
    notificationsMessages['agenda.systemChangeEventState'],
    values,
  );

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['agenda.sendInvitation'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/members', subjectsProps),
    label: intl.formatMessage(
      notificationsMessages['agenda.sendInvitation'],
      values,
    ),
  };
};

toExports['agenda.acceptInvitation'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/members', subjectsProps),
    label: intl.formatMessage(
      notificationsMessages['agenda.acceptInvitation'],
      values,
    ),
  };
};

toExports['agenda.addMember'] = (notification, options, userUid) => {
  const { intl } = options;
  const { subjectsProps, additionalSubjects, values } = getProps(
    notification,
    options,
  );

  const url = isAdminMod(additionalSubjects.invitedRole)
    ? '/agendas/:target/admin/members'
    : '/agendas/:target';

  let messageKey = 'agenda.addMember';

  if (subjectsProps.object.firstUid === userUid) {
    messageKey += '.withYou';
  }
  if (!subjectsProps.actor) {
    messageKey += '.withoutActor';
  }

  return {
    url: formatUrl(url, subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

toExports['agenda.setMemberRole'] = (notification, options, userUid) => {
  const { intl } = options;
  const { subjectsProps, additionalSubjects, values } = getProps(
    notification,
    options,
  );

  const url = isAdminMod(additionalSubjects.afterRole)
    ? '/agendas/:target/admin/members'
    : '/agendas/:target';

  let messageKey = 'agenda.setMemberRole';

  if (subjectsProps.object.firstUid === userUid) {
    messageKey += '.withYou';
  }
  if (!subjectsProps.actor) {
    messageKey += '.withoutActor';
  }

  return {
    url: formatUrl(url, subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

toExports['agenda.removeMember'] = (notification, options, userUid) => {
  const { intl } = options;
  const { subjectsProps, additionalSubjects, values } = getProps(
    notification,
    options,
  );

  const url = isAdminMod(additionalSubjects.removedRole)
    ? '/agendas/:target/admin/members'
    : '/agendas/:target';

  let messageKey = 'agenda.removeMember';

  if (subjectsProps.object.firstUid === userUid) {
    messageKey += '.withYou';
  }
  if (!subjectsProps.actor) {
    messageKey += '.withoutActor';
  }

  return {
    url: formatUrl(url, subjectsProps),
    label: intl.formatMessage(notificationsMessages[messageKey], values),
  };
};

toExports['agenda.create'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.create'], values),
  };
};

toExports['agenda.addSource'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/sources', subjectsProps),
    label: intl.formatMessage(
      notificationsMessages['agenda.addSource'],
      values,
    ),
  };
};

toExports['agenda.removeSource'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target/admin/sources', subjectsProps),
    label: intl.formatMessage(
      notificationsMessages['agenda.removeSource'],
      values,
    ),
  };
};

toExports['agenda.update'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(notificationsMessages['agenda.update'], values),
  };
};

toExports['agenda.setOfficial'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label: intl.formatMessage(
      notificationsMessages['agenda.setOfficial'],
      values,
    ),
  };
};

toExports['agenda.aggregateEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const label = intl.formatMessage(
    notificationsMessages['agenda.aggregateEvent'],
    values,
  );

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

toExports['agenda.addEvent'] = (notification, options) => {
  const { intl } = options;
  const { subjectsProps, values } = getProps(notification, options);

  const messageKey = subjectsProps.actor
    ? 'agenda.addEvent'
    : 'agenda.addEvent.withoutActor';
  const label = intl.formatMessage(notificationsMessages[messageKey], values);

  // If 1 event, go to the event
  if (subjectsProps.object.counter === 1) {
    return {
      url: formatUrl('/agendas/:target/events/:object', subjectsProps),
      label,
    };
  }

  return {
    url: formatUrl('/agendas/:target', subjectsProps),
    label,
  };
};

export default toExports;
