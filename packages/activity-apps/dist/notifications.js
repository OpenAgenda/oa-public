"use strict";

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var du = require('@openagenda/dom-utils');
var dl = require('@openagenda/dom-utils/documentLocation');
var sessions = require('@openagenda/sessions/client');
var get = require('@openagenda/utils/get');
var merge = require('lodash/merge');
var Spinner = require('spin.js');

var anchorElem = void 0;
var labelElem = void 0;
var openerElem = void 0;
var panelElem = void 0;
var params = void 0;
var myScroll = void 0;

var notifsCount = null;
var panelClicked = false;
var panelOpened = false;

var notifications = void 0;
var lastPage = false;

module.exports = function (options) {

  params = merge({
    selectors: {
      notifications: '.js_notifications',
      notificationsLabel: '.js_notifications .label',
      notificationsOpener: '.js_notifications_opener',
      notificationsPanel: '.js_notifications_panel',
      notificationsBody: '.notifications-body',
      next: '.js_notifications .next',
      readAll: '.js_notifications .read-all',
      seeActivities: '.js_notifications .see-activities'
    },
    classes: {
      hide: 'hide'
    },
    res: {
      getCounter: '/notifications/count',
      list: '/notifications/list',
      remove: '/notifications/remove/:notifId',
      markRead: '/notifications/mark-read/:notifId',
      markAllRead: '/notifications/mark-all-read',
      seeActivities: '/home/activities'
    }
  }, options);

  var lang = dl.getQueryPart('lang', 'fr');
  var user = sessions.getUser();

  if (!user) return;

  params.res = (0, _keys2.default)(params.res).reduce(function (prev, next) {
    var actualUrl = params.res[next];
    return (0, _assign2.default)({}, prev, (0, _defineProperty3.default)({}, next, actualUrl.indexOf('?') !== -1 ? actualUrl + '&lang=' + lang : actualUrl + '?lang=' + lang));
  }, {});

  anchorElem = document.querySelector(params.selectors.notifications);
  labelElem = document.querySelector(params.selectors.notificationsLabel);
  openerElem = document.querySelector(params.selectors.notificationsOpener);
  panelElem = document.querySelector(params.selectors.notificationsPanel);

  if (!anchorElem) return;

  getCounter(function (err, nbr) {

    if (err) return;

    if (du.hasClass(anchorElem, params.classes.hide)) {
      du.removeClass(anchorElem, params.classes.hide);
    }

    setCounter(nbr);
  });

  // On panel opener
  du.addEvent(openerElem, 'click', function (e) {

    du.preventDefault(e);

    if (panelOpened) {
      panelOpened = false;
      return du.addClass(panelElem, params.classes.hide);
    }

    if (notifsCount === null) return;

    setLoading(true);

    get(params.res.list, function (err, result) {

      setLoading(false);

      if (err || !result) return;

      notifications = result.notifications;
      lastPage = result.lastPage;

      setCounter(result.counter);

      panelElem.innerHTML = result.html;
      du.removeClass(panelElem, params.classes.hide);

      panelOpened = true;

      if (lastPage) {
        var nextElem = document.querySelector(params.selectors.next);
        if (nextElem) {
          nextElem.parentNode.parentNode.remove();
        }
      }

      refreshScroll();

      setListeners();
    });
  });

  du.addEvent(panelElem, 'click', function () {
    panelClicked = true;
  });

  du.addEvent(panelElem, 'mousedown', function () {
    panelClicked = true;
  });

  du.addEvent(document.documentElement, 'click', function () {

    if (panelOpened && !panelClicked) {
      panelOpened = false;
      du.addClass(panelElem, params.classes.hide);
      myScroll = null;
    }

    panelClicked = false;
  });
};

function onRemoveClick(elem) {

  return function (e) {

    du.preventDefault(e);
    e.stopPropagation();

    var notifElem = elem.parentNode.parentNode;
    var id = notifElem.getAttribute('data-id');

    get(params.res.remove.replace(':notifId', id), function (err, data) {

      if (err || !data) return;

      get(params.res.list + '&fromId=' + notifications[notifications.length - 1].id + '&justOne=1', function (err, result) {

        if (err || !result) return;

        notifications = notifications.filter(function (v) {
          return v.id !== parseInt(id);
        });
        notifElem.remove();

        appendNotifications(result);
      });
    });

    return false;
  };
}

function onMarkReadClick(elem) {

  return function (e) {

    du.preventDefault(e);
    e.stopPropagation();

    var notifElem = elem.parentNode.parentNode;
    var id = notifElem.getAttribute('data-id');

    get(params.res.markRead.replace(':notifId', id), function (err) {

      if (err) return;

      if (!du.hasClass(notifElem, 'read')) du.addClass(notifElem, 'read');
    });

    return false;
  };
}

function onNextClick() {

  return function (e) {

    du.preventDefault(e);

    get(params.res.list + '&fromId=' + notifications[notifications.length - 1].id, function (err, result) {

      if (err || !result) return;

      appendNotifications(result);
    });
  };
}

function onReadAllClick() {

  return function (e) {

    du.preventDefault(e);

    get(params.res.markAllRead, function (err, result) {

      if (err || !result) return;

      (0, _from2.default)(panelElem.querySelectorAll('a.list-group-item')).map(function (el) {

        if (!du.hasClass(el, 'read')) du.addClass(el, 'read');
      });

      setCounter(0);
    });
  };
}

function onSeeActivitiesClick() {

  return function (e) {

    du.preventDefault(e);

    window.location.href = params.res.seeActivities;
  };
}

function appendNotifications(result) {

  notifications = notifications.concat(result.notifications);
  lastPage = result.lastPage;

  var nextElem = document.querySelector(params.selectors.next);

  if (lastPage && nextElem) {
    nextElem.parentNode.parentNode.remove();
  }

  var div = document.createElement('div');
  div.innerHTML = result.html;
  var receivedList = div.querySelectorAll('a.list-group-item');

  if (result.notifications.length && receivedList && receivedList.length) {

    (0, _from2.default)(receivedList).forEach(function (el) {
      var removeElem = el.querySelector('.remove');
      var markReadElem = el.querySelector('.mark-read');
      du.addEvent(removeElem, 'click', onRemoveClick(removeElem));
      du.addEvent(markReadElem, 'click', onMarkReadClick(markReadElem));
      if (nextElem) {
        nextElem.parentNode.parentNode.insertAdjacentElement('beforebegin', el);
      } else {
        var listElems = panelElem.querySelectorAll('a.list-group-item');
        listElems[listElems.length - 1].insertAdjacentElement('afterend', el);
      }
    });
  } else if (!notifications.length) {

    panelElem.innerHTML = result.html;
  }

  setCounter(result.counter);
  refreshScroll();
}

function onNotifClick(elem) {

  return function (e) {

    du.preventDefault(e);

    var id = elem.getAttribute('data-id');
    var href = elem.getAttribute('href');

    if (!href) return;

    get(params.res.markRead.replace(':notifId', id), function () {

      window.location.href = href;
    });
  };
}

function getCounter(cb) {

  var counter = sessions.notifications.getCount();

  if (counter) {

    return cb(null, counter);
  }

  get(params.res.getCounter, function (err, data) {

    cb(err, data && data.counter);
  });
}

function setCounter(nbr) {

  sessions.notifications.setCount(nbr);

  notifsCount = nbr;
  labelElem.innerHTML = nbr;

  (!nbr ? du.addClass : du.removeClass)(labelElem, params.classes.hide);
}

function refreshScroll() {

  if (myScroll) return myScroll.refresh();

  var elem = document.querySelector(params.selectors.notificationsBody);

  if (!elem.children.length) return;

  myScroll = new IScroll(elem, {
    scrollbars: true,
    mouseWheel: true,
    interactiveScrollbars: true,
    shrinkScrollbars: 'scale'
    // fadeScrollbars: true
  });
}

function setLoading() {
  var loading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;


  if (loading) {

    panelElem.innerHTML = '<div class="notifications-body loading"></div>';

    new Spinner({
      width: 1,
      length: 6,
      radius: 10,
      color: '#666'
    }).spin(panelElem.querySelector('.notifications-body'));

    du.removeClass(panelElem, params.classes.hide);
  } else {

    panelElem.innerHTML = '';
    du.addClass(panelElem, params.classes.hide);
  }
}

function setListeners() {

  du.addEvent(document.querySelector(params.selectors.next), 'click', onNextClick());

  du.addEvent(document.querySelector(params.selectors.readAll), 'click', onReadAllClick());

  du.addEvent(document.querySelector(params.selectors.seeActivities), 'click', onSeeActivitiesClick());

  (0, _from2.default)(panelElem.querySelectorAll('.list-group-item')).map(function (el) {
    du.addEvent(el, 'click', onNotifClick(el));
  });

  (0, _from2.default)(panelElem.querySelectorAll('a.list-group-item .remove')).map(function (el) {
    du.addEvent(el, 'click', onRemoveClick(el));
  });

  (0, _from2.default)(panelElem.querySelectorAll('a.list-group-item .mark-read')).map(function (el) {
    du.addEvent(el, 'click', onMarkReadClick(el));
  });
}
//# sourceMappingURL=notifications.js.map