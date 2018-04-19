"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var merge = require('lodash/merge');
var escape = require('lodash/escape');

var makeLabelGetter = require('@openagenda/labels/makeLabelGetter');
var credentialLabels = require('@openagenda/labels/contributors/credentials');
var stateLabels = require('@openagenda/labels/event/states');
var credentialTypes = require('@openagenda/agenda-stakeholders/dist/iso/credentialTypes');

var getUid = function getUid(str) {
  return str.split(':')[1];
};

var eventStateCodeToLabel = function eventStateCodeToLabel(code) {
  return ['refused', 'tocontrol', 'tobecontrolled', 'controlled', 'published'][code];
};

module.exports = function (urls, labels) {
  var defaultLang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'fr';


  urls = merge({
    'agenda.sendInvitation': {
      agenda: '/agendas/:agenda'
    },
    'agenda.acceptInvitation': {
      agenda: '/agendas/:agenda'
    },
    'agenda.addMember': {
      agenda: '/agendas/:agenda'
    },
    'agenda.setMemberRole': {
      agenda: '/agendas/:agenda'
    },
    'agenda.create': {
      agenda: '/agendas/:agenda'
    },
    'agenda.updateContribution': {
      agenda: '/agendas/:agenda'
    },
    'agenda.updateProfile': {
      agenda: '/agendas/:agenda'
    },
    'agenda.rename': {
      agenda: '/agendas/:agenda'
    },
    'agenda.changeEventState': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'agenda.publishEvent': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'agenda.unpublishEvent': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'agenda.removeEvent': {
      agenda: '/agendas/:agenda'
    },
    'agenda.setOfficial': {
      agenda: '/agendas/:agenda'
    },
    'event.create': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    },
    'event.update': {
      agenda: '/agendas/:agenda',
      event: '/agendas/:agenda/events/:event'
    }
  }, urls);

  return function (activity) {
    var lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultLang;
    var withFilterIcons = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


    var getLabel = makeLabelGetter(labels, lang);
    var getCredentialLabel = makeLabelGetter(credentialLabels, lang);
    var getStateLabel = makeLabelGetter(stateLabels, lang);

    var getEventTitle = function getEventTitle(labels) {
      if ((typeof labels === 'undefined' ? 'undefined' : _typeof(labels)) !== 'object') return labels;

      var keys = Object.keys(labels);
      return keys.find(function (v) {
        return v === lang;
      }) ? labels[lang] : labels[keys[0]];
    };

    var getIcon = function getIcon(activity, type) {
      if (!withFilterIcons) return '';
      return '<i class="fa fa-filter" aria-hidden="true" data-filterlabel="' + escape(getEventTitle(activity.store.labels[type])) + '" data-filtertype="' + type + '" data-filtervalue="' + activity[type] + '"></i>';
    };

    var makeUrl = function makeUrl(entityType, values, label, filterType) {
      if (!urls[activity.verb] || !urls[activity.verb][entityType]) return escape(label);

      var url = Object.keys(values).reduce(function (prev, next) {
        return prev.replace(':' + next, values[next]);
      }, urls[activity.verb][entityType]);

      var icon = '<i class="fa fa-filter" aria-hidden="true" data-filterlabel="' + escape(getEventTitle(label)) + '" data-filtertype="' + escape(filterType) + '" data-filtervalue="' + entityType + ':' + values[entityType] + '"></i>';

      return '<span class="activity-highlight"><a href="' + url + '">' + escape(label) + '</a>' + (withFilterIcons ? icon : '') + '</span>';
    };

    var agendaUrl = void 0;
    var eventUrl = void 0;

    switch (activity.verb) {

      case 'agenda.sendInvitation':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.sendInvitation', {
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          email: '<span class="activity-highlight">' + escape(activity.store.labels.object) + getIcon(activity, 'object') + '</span>',
          credential: getCredentialLabel(credentialTypes.codes.get(activity.store.credential)).toLowerCase(),
          agenda: agendaUrl
        });

      case 'agenda.acceptInvitation':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.acceptInvitation', {
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          originMember: '<span class="activity-highlight">' + escape(activity.store.labels.object) + getIcon(activity, 'object') + '</span>',
          credential: getCredentialLabel(credentialTypes.codes.get(activity.store.credential)).toLowerCase(),
          agenda: agendaUrl
        });

      case 'agenda.addMember':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.addMember', {
          originMember: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          user: '<span class="activity-highlight">' + escape(activity.store.labels.object) + getIcon(activity, 'object') + '</span>',
          credential: getCredentialLabel(credentialTypes.codes.get(activity.store.credential)).toLowerCase(),
          agenda: agendaUrl
        });

      case 'agenda.setMemberRole':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target);

        return getLabel('agenda.setMemberRole', {
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          originMember: '<span class="activity-highlight">' + escape(activity.store.labels.object) + getIcon(activity, 'object') + '</span>',
          credential: getCredentialLabel(credentialTypes.codes.get(activity.store.credential)).toLowerCase(),
          beforeCredential: getCredentialLabel(credentialTypes.codes.get(activity.store.beforeCredential)).toLowerCase(),
          agenda: agendaUrl
        });

      case 'agenda.create':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.create', {
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          agenda: agendaUrl
        });

      case 'agenda.updateContribution':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.updateContribution', {
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          agenda: agendaUrl
        });

      case 'agenda.updateProfile':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.updateProfile', {
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          agenda: agendaUrl
        });

      case 'agenda.rename':

        return getLabel('agenda.rename', {
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          before: makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.beforeTitle),
          after: makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.afterTitle)
        });

      case 'agenda.setOfficial':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.' + (activity.store.officialized ? 'setOfficial' : 'setUnofficial'), {
          agenda: agendaUrl
        });

      case 'agenda.changeEventState':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');
        eventUrl = makeUrl('event', {
          agenda: getUid(activity.target),
          event: getUid(activity.object)
        }, getEventTitle(activity.store.labels.object), 'object');

        return getLabel('agenda.changeEventState', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          event: eventUrl,
          before: getStateLabel(eventStateCodeToLabel(activity.store.oldState)),
          after: getStateLabel(eventStateCodeToLabel(activity.store.newState))
        });

      case 'agenda.publishEvent':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');
        eventUrl = makeUrl('event', {
          agenda: getUid(activity.target),
          event: getUid(activity.object)
        }, getEventTitle(activity.store.labels.object), 'object');

        return getLabel('agenda.publishEvent', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          event: eventUrl
        });

      case 'agenda.unpublishEvent':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');
        eventUrl = makeUrl('event', {
          agenda: getUid(activity.target),
          event: getUid(activity.object)
        }, getEventTitle(activity.store.labels.object), 'object');

        return getLabel('agenda.unpublishEvent', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          event: eventUrl
        });

      case 'agenda.removeEvent':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');

        return getLabel('agenda.removeEvent', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          event: '<span class="activity-highlight">' + getEventTitle(activity.store.labels.object) + getIcon(activity, 'object') + '</span>'
        });

      case 'event.create':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');
        eventUrl = makeUrl('event', {
          agenda: getUid(activity.target),
          event: getUid(activity.object)
        }, getEventTitle(activity.store.labels.object), 'object');

        return getLabel('event.create', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          event: eventUrl
        });

      case 'event.update':

        agendaUrl = makeUrl('agenda', { agenda: getUid(activity.target) }, activity.store.labels.target, 'target');
        eventUrl = makeUrl('event', {
          agenda: getUid(activity.target),
          event: getUid(activity.object)
        }, getEventTitle(activity.store.labels.object), 'object');

        return getLabel('event.update', {
          agenda: agendaUrl,
          user: '<span class="activity-highlight">' + escape(activity.store.labels.actor) + getIcon(activity, 'actor') + '</span>',
          event: eventUrl
        });

      default:

        return 'Activity label missing for verb ' + activity.verb;

    }
  };
};
//# sourceMappingURL=formatActivity.js.map