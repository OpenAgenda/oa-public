"use strict";

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');

const agendaParser = require('../agenda').parser;
const getRoleSlug = require('@openagenda/members').utils.getRoleSlug;

const makeLabelGetter = require('@openagenda/labels');
const flattenLabels = require('@openagenda/labels/flatten');

const tabReference = require('./tabs.json');

const headerLabels = require('@openagenda/labels/agenda-admin/header');
const tabLabels = require('@openagenda/labels/agenda-admin/tabs');
const getHeaderLabels = makeLabelGetter(headerLabels);
const getTabLabels = makeLabelGetter(tabLabels);

module.exports = {
  parent: 'main',
  render: _.template(fs.readFileSync(__dirname + '/layout.tpl', 'utf-8')),
  parser
}

function parser(data) {

  const { agenda, lang, selectedTab, role } = data;

  const tabs = tabReference
    .filter(tab => _includeTab(agenda, tab, typeof role === 'string' ? role : getRoleSlug(role)))
    .map(tab => _formatTab({ agenda, tab, lang, selectedTab }));

  const adminData = ih(agendaParser(data), {
    adminLabels: { $set: flattenLabels(headerLabels, data.lang, 'en') },
    tabLabels: { $set: flattenLabels(tabLabels, data.lang, 'en') },
    sections: {
      $set: ['manage', 'export', 'settings'].map(s => ({
        label: getHeaderLabels(s, lang),
        tabs: tabs.filter(t => t.section === s)
      }))
    }
  });

  _.set(adminData, 'scripts.bottom',
    _.get(adminData, 'scripts.bottom', []).concat({
      src: '/js/verifiedLocationsCounter.js'
    })
  );

  return adminData;

}

function _includeTab(agenda, tab, role) {

  if (tab.roles && !tab.roles.includes(role)) return false

  if (!tab.credential) return true;

  return agenda.credentials[tab.credential];

}

function _formatTab({ agenda, tab, lang, selectedTab }) {

  return ih(tab, {
    label: {
      $set: getTabLabels(tab.name, lang)
    },
    link: {
      $set: `/${agenda.slug}/admin${tab.route !== undefined ? tab.route : '/' + tab.name}`
    },
    selected: {
      $set: selectedTab === tab.name
    }
  });

}
