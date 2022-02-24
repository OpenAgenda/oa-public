'use strict';

import React from 'react';
import displayExportButton from './displayExportButton';
import displayAggregateButton from './displayAggregateButton';
import trackConsent from './trackConsent';
import addGoogleAnalyticsTracker from './addGoogleAnalyticsTracker';

const controllers = require('../../widgets/controller/main'),
  qs = require('qs'),
  debug = require('debug'),
  // deprecate this
  cn = require('../../js/lib/common/common.mod'),
  // in favor of this
  du = require('@openagenda/dom-utils'),
  _ = {
    includes: require('lodash/includes'),
  },
  get = require('@openagenda/utils/get'),
  list = require('./list'),
  timeliner = require('./timeliner'),
  documentLocation = require('@openagenda/dom-utils/documentLocation'),
  config = require('./config'),
  favorites = require('./favorites'),
  widgets = {
    search: require('../../widgets/search/search'),
    tags: require('../../widgets/tags/tags'),
    categories: require('../../widgets/categories/categories'),
    map: require('../../widgets/map/map'),
    calendar: require('../../widgets/calendar/calendar'),
    activeFilters: require('../../widgets/activeFilters/activeFilters'),
    organizations: require('../../widgets/organizations/organizations'),
  },
  params = {
    selectors: {
      list: '.js_list_content',
      add: '.js_add_button',
      admin: '.js_admin_button',
      org: '.js_org_widget',
      titleSection: '.js_agenda_title',
      searchLinks: '.js_use_search', // add search params to links with this class
      export: '.js_export',
      exportAll: '.js_export_all',
      aggregate: '.js_aggregate',
    },
    res: {
      role: '/session/agendas/:agendaUid/role',
    },
    classes: {
      displayNone: 'display-none',
    },
  },
  totalLib = require('./total'),
  session = require('@openagenda/sessions/client');

let uid, log, total;

if (_.includes(['tpl', 'development'], window.env)) {
  debug.enable('*');

  if (window.env === 'tpl') params.res.role = 'role.txt';
}

window.asap(options => {
  log = debug('agendaPage');
  const exportRef = React.createRef();

  log('initing', options);

  let controller = window.cibul.getController(options.uid),
    loader,
    uid = options.uid,
    timeline = timeliner(options.lang),
    total = totalLib('.js_total', options.lang);

  const initialQuery = window.location.href;

  trackConsent(options, {
    onConsentConfirmed: () => addGoogleAnalyticsTracker({
      agendaUID: uid,
      googleAnalyticsID: options.googleAnalyticsID
    })
  });

  favorites.init({
    agendaUid: options.uid,
    res: options.res,
  });

  try {
    if (window.location.href.split('?').pop().indexOf('lang=') !== -1) {
      cn.el(params.selectors.add).setAttribute(
        'href',
        cn.el(params.selectors.add).getAttribute('href') +
          '?lang=' +
          window.location.href.split('lang=').pop().substr(0, 2)
      );
    }
  } catch (e) {
    console.log('could not assign language to contribute button', e);
  }

  get(params.res.role.replace(':agendaUid', uid), (err, res) => {
    controller.getControlData(ctl => {
      if (parseInt(ctl.c) !== 0) {
        if (!ctl.prv || res !== 'reader') _displayAddButton();
      }

      if (!ctl.prv) {
        const sessionUser = session.getUser();
        const routes =  {
          agendaExportSettings: `${options.root}/agendas/:agendaUid/settings/exports`,
          me: '/api/me',
          export: {
            jsonV1: `${options.root}/agendas/:agendaUid/events.json`,
            jsonV2: `${options.apiRoot}/v2/agendas/:agendaUid/events`,
            pdf: `${options.root}/agendas/:agendaUid/events.pdf`,
            xlsx: `${options.root}/agendas/:agendaUid/events.v2.xlsx`,
            gcal: `${options.root}/agendas/:agendaUid/events.v2.ics`,
            ical: `${options.root}/agendas/:agendaUid/events.v2.ics`,
            csv: `${options.root}/agendas/:agendaUid/events.v2.csv`,
            ics: `${options.root}/agendas/:agendaUid/events.v2.ics`,
            rss: `${options.root}/agendas/:agendaUid/events.rss`,
          }
        }
        displayExportButton(exportRef, params, routes, uid, controller, options, { exportAll: true }, !!sessionUser);
        displayExportButton(exportRef, params, routes, uid, controller, options, { exportAll: false }, !!sessionUser);
        displayAggregateButton(params, options, initialQuery, !!sessionUser);
      }

      if (['administrator', 'moderator'].indexOf(res) !== -1) {
        _displayAddButton();

        _displayAdminButton();

        _removeAddButtonAsPrimary();
      }
    });
  });

  if (!options.empty) {
    favorites.sweep();

    list.init({
      total: options.total,
      perPage: options.perPage,
      onLoad: function (err, data) {
        timeline.dom();

        favorites.sweep();

        total(data.total);
      },
    });

    _onWidgetLoaded(function () {
      log('widgets are loaded and initialized');
    });

    _onControllerChange(controller, function (newSearchValues) {
      log('query values changed to %s', JSON.stringify(newSearchValues));

      let newQuery = {
        oaq: newSearchValues,
      };

      if (documentLocation.getQueryPart('lang')) {
        newQuery.lang = documentLocation.getQueryPart('lang');
      }

      if (exportRef.current) {
        exportRef.current.displayButton(!!Object.keys(newSearchValues).length);
      }

      documentLocation.setQueryPart(newQuery);

      list.reset(window.location.href);

      _copyToSearch(newSearchValues);
    });

    _showOptionalWidgets(controller);
  }
});

function _removeAddButtonAsPrimary() {
  let addButton = cn.el(params.selectors.add);

  cn.addClass(addButton, 'btn-default');
  cn.removeClass(addButton, 'btn-primary');
}

function _displayAdminButton() {
  let adminButton = cn.el(params.selectors.admin);

  adminButton.setAttribute('href', adminButton.getAttribute('data-href'));

  cn.removeClass(adminButton, params.classes.displayNone);
}

function _showOptionalWidgets(controller) {
  controller.getControlData(function (data) {
    cn.forEach(
      [
        {
          sel: '.js_category_widget',
          key: 'ct',
        },
        {
          sel: '.js_tags_widget',
          key: 't',
        },
        {
          sel: '.js_org_widget',
          key: 'org',
        },
      ],
      function (cfg) {
        if (typeof data[cfg.key] !== 'undefined' && data[cfg.key].length && cn.el(cfg.sel)) {
          cn.removeClass(cn.el(cfg.sel), params.classes.displayNone);
        }
      }
    );
  });
}

function _onWidgetLoaded(cb) {
  log('setting widget ready callbacks');

  var loadCount = 0,
    _onReady = function () {
      loadCount++;

      if (loadCount == cn.size(widgets)) {
        cb();
      }
    };

  for (var widgetName in widgets) {
    widgets[widgetName].setOnReady(_onReady);
  }
}

function _displayAddButton() {
  cn.removeClass(cn.el(params.selectors.add), params.classes.displayNone);
}

function _copyToSearch(values) {
  cn.forEach(cn.els(params.selectors.searchLinks) || [], function (el) {
    var href = el.getAttribute('href').split('?')[0] + '?' + qs.stringify({ oaq: values });

    el.setAttribute('href', href);
  });
}

function _onControllerChange(controller, cb) {
  var currentSearchValues = controller.getCurrentQuery();

  log('registering page list as widget');

  controller.register({
    name: 'site',
    enable: function (newValues) {
      if (!controller.isDifferent(currentSearchValues)) {
        return;
      }

      currentSearchValues = cn.extend({}, newValues);

      cb(newValues);
    },
  });
}
