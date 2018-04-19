"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var get = require('lodash/get');
var merge = require('lodash/merge');
var without = require('lodash/without');
var escape = require('lodash/escape');
var reduce = require('lodash/reduce');
var mapValues = require('lodash/mapValues');

var makeLabelGetter = require('@openagenda/labels/makeLabelGetter');
var credentialLabels = require('@openagenda/labels/contributors/credentials');
var stateLabels = require('@openagenda/labels/event/states');
var credentialTypes = require('@openagenda/agenda-stakeholders/dist/iso/credentialTypes');

var groupBy = require('./service/notifications/lib/groupBy');

var eventStateCodeToLabel = function eventStateCodeToLabel(code) {
  return ['tocontrol', 'controlled', 'published'][code];
};

var defaultGetUrl = function defaultGetUrl(notification, subjects, userUid, labelSuffix) {

  if (['agenda.addMember', 'agenda.setMemberRole'].includes(notification.verb) && userUid && notification.store.objects.includes('user:' + userUid)) {

    if (credentialTypes.isSuperiorTo(notification.store.credential, credentialTypes.get('contributor'))) {

      return '/agendas/:agenda/admin/members';
    }

    return '/agendas/:agenda';
  }

  var urls = {
    'agenda.sendInvitation': {
      singSing: '/agendas/:agenda/admin/members',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.acceptInvitation': {
      singSing: '/agendas/:agenda/admin/members',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.addMember': {
      singSing: '/agendas/:agenda/admin/members',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.setMemberRole': {
      singSing: '/agendas/:agenda',
      singPlur: '/agendas/:agenda/admin/members',
      plurSing: '/agendas/:agenda/admin/members',
      plurPlur: '/agendas/:agenda/admin/members'
    },
    'agenda.create': {
      sing: '/agendas/:agenda'
    },
    'agenda.updateContribution': {
      sing: '/agendas/:agenda/admin/settings/contribution',
      plur: '/agendas/:agenda/admin/settings/contribution'
    },
    'agenda.updateProfile': {
      sing: '/agendas/:agenda/admin/settings/profile',
      plur: '/agendas/:agenda/admin/settings/profile'
    },
    'agenda.rename': {
      sing: '/agendas/:agenda',
      plur: '/agendas/:agenda'
    },
    'agenda.setOfficial': {
      sing: '/agendas/:agenda'
    },
    'agenda.setUnofficial': {
      sing: '/agendas/:agenda'
    },
    'agenda.changeEventState': {
      singSing: '/agendas/:agenda/events/:event',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda/events/:event',
      plurPlur: '/agendas/:agenda'
    },
    'agenda.publishEvent': {
      singSing: '/agendas/:agenda/events/:event',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda/events/:event',
      plurPlur: '/agendas/:agenda'
    },
    'agenda.unpublishEvent': {
      singSing: '/agendas/:agenda/events/:event',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda/events/:event',
      plurPlur: '/agendas/:agenda'
    },
    'agenda.removeEvent': {
      singSing: '/agendas/:agenda',
      singPlur: '/agendas/:agenda',
      plurSing: '/agendas/:agenda',
      plurPlur: '/agendas/:agenda'
    },
    'event.create': {
      singSing: '/agendas/:agenda/events/:event', // one user, one event
      singPlur: '/agendas/:agenda', // one user, multiple events
      plurPlur: '/agendas/:agenda' // multiple users, multiple events
    },
    'event.update': {
      singSing: '/agendas/:agenda/events/:event', // one user, one event
      singPlur: '/agendas/:agenda', // one user, multiple events
      plurSing: '/agendas/:agenda/events/:event', // multiple users, one event
      plurPlur: '/agendas/:agenda' // multiple users, multiple events
    }
  };

  return urls[notification.verb] && urls[notification.verb][lowerFirstLetter(labelSuffix)] || null;
};

module.exports = function (getUrl, labels) {
  var userUid = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var defaultLang = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'fr';


  if (!getUrl) getUrl = defaultGetUrl;

  return function (notification) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultLang;


    var getLabel = makeLabelGetter(labels, lang);
    var getCredentialLabel = makeLabelGetter(credentialLabels, lang);
    var getStateLabel = makeLabelGetter(stateLabels, lang);

    var getEventTitle = function getEventTitle(eventLabels) {
      var keys = Object.keys(eventLabels);
      return keys.find(function (v) {
        return v === lang;
      }) ? eventLabels[lang] : eventLabels[keys[0]];
    };

    var labelSuffix = '';
    var firstUids = {};

    var ignoredSubjects = notification.groupBy.split('|').map(function (v) {
      return v.split(':')[0];
    });
    var subjects = ['actor', 'object', 'target'].reduce(function (result, item) {
      var _getLabel3;

      if (!notification.store[item + 's'] || !notification.store[item + 's'].length) return result;

      var length = notification.store[item + 's'].length;
      var name = notification.store[item + 's'][0].split(':')[0];

      firstUids[name] = notification.store[item + 's'][0].split(':')[1];

      var value = void 0;
      if (name === 'event') {
        value = escape(getEventTitle(notification.store.labels[item]));
      } else {
        value = escape(notification.store.labels[item]);
      }

      if (ignoredSubjects.includes(item)) {
        result[item] = value;
        return result;
      }

      switch (length) {
        case 1:
          result[item] = getLabel(name + 'Singular', _defineProperty({}, name, value));
          labelSuffix += 'Sing';
          break;
        case 2:
          result[item] = getLabel(name + 'OneMore', _defineProperty({}, name, value));
          labelSuffix += 'Plur';
          break;
        default:
          result[item] = getLabel(name + 'Plural', (_getLabel3 = {}, _defineProperty(_getLabel3, name, value), _defineProperty(_getLabel3, 'nbr', length >= 100 ? '99+' : length - 1), _getLabel3));
          labelSuffix += 'Plur';
      }

      return result;
    }, {});

    var additionalSubjects = without(groupBy[notification.verb], 'actor', 'object', 'target').reduce(function (result, path) {

      result[path.replace('store.', '')] = get(notification, path);
      return result;
    }, {});

    Object.assign(subjects, additionalSubjects);

    var url = getUrl(notification, subjects, userUid, lowerFirstLetter(labelSuffix)) || null;

    if (url) {
      url = Object.keys(firstUids).reduce(function (prev, next) {
        return prev.replace(':' + next, firstUids[next]);
      }, url);
    }

    if (subjects.credential) {
      subjects.credential = getCredentialLabel(credentialTypes.codes.get(subjects.credential)).toLowerCase();
    }

    if (notification.verb === 'agenda.changeEventState') {
      subjects.newState = getStateLabel(eventStateCodeToLabel(subjects.newState));
    }

    if (notification.verb === 'agenda.setOfficial' && !notification.store.officialized) {
      notification.verb = 'agenda.setUnofficial';
    }

    var labelName = '' + notification.verb + (labelSuffix ? '.' : '') + lowerFirstLetter(labelSuffix);

    if (['agenda.addMember', 'agenda.setMemberRole'].includes(notification.verb) && userUid && notification.store.objects.includes('user:' + userUid)) {

      labelName = notification.verb + '.withYou';
    }

    return {
      content: getLabel(labelName, mapValues(subjects, function (v) {
        return '<span class="notif-highlight">' + v + '</span>';
      })),
      url: url
    };
  };
};

module.exports.defaultGetUrl = defaultGetUrl;

function lowerFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
//# sourceMappingURL=formatNotification.js.map