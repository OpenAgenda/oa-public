import fs from 'node:fs';
import _ from 'lodash';
import ih from 'immutability-helper';
import { utils as membersUtils } from '@openagenda/members';
import makeLabelGetter from '@openagenda/labels';
import flattenLabels from '@openagenda/labels/flatten.js';
import headerLabels from '@openagenda/labels/agenda-admin/header.js';
import tabLabels from '@openagenda/labels/agenda-admin/tabs.js';
import agendaLayout from '../agenda/index.js';

const tabReference = JSON.parse(
  fs.readFileSync(new URL('./tabs.json', import.meta.url), 'utf-8'),
);

const getHeaderLabels = makeLabelGetter(headerLabels);
const getTabLabels = makeLabelGetter(tabLabels);

const { getRoleSlug } = membersUtils;

function _includeTab(agenda, tab, role) {
  if (tab.roles && !tab.roles.includes(role)) return false;

  if (!tab.credential) return true;

  return agenda.credentials[tab.credential];
}

function _formatTab({ agenda, tab, lang, selectedTab }) {
  return ih(tab, {
    label: {
      $set: getTabLabels(tab.name, lang),
    },
    link: {
      $set: `/${agenda.slug}/admin${tab.route !== undefined ? tab.route : `/${tab.name}`}`,
    },
    selected: {
      $set: selectedTab === tab.name,
    },
  });
}

function parser(data) {
  const { agenda, lang, selectedTab, role } = data;

  const tabs = tabReference
    .filter((tab) =>
      _includeTab(
        agenda,
        tab,
        typeof role === 'string' ? role : getRoleSlug(role),
      ))
    .map((tab) => _formatTab({ agenda, tab, lang, selectedTab }));

  const adminData = ih(agendaLayout.parser(data), {
    adminLabels: { $set: flattenLabels(headerLabels, data.lang, 'en') },
    tabLabels: { $set: flattenLabels(tabLabels, data.lang, 'en') },
    sections: {
      $set: ['manage', 'export', 'settings'].map((s) => ({
        label: getHeaderLabels(s, lang),
        tabs: tabs.filter((t) => t.section === s),
      })),
    },
  });

  _.set(
    adminData,
    'scripts.bottom',
    _.get(adminData, 'scripts.bottom', []).concat({
      src: '/js/verifiedLocationsCounter.js',
    }),
  );

  return adminData;
}

export default {
  parent: 'main',
  render: _.template(
    fs.readFileSync(`${import.meta.dirname}/layout.tpl`, 'utf-8'),
  ),
  parser,
};
