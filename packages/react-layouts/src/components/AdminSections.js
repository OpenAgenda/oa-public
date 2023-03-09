import _ from 'lodash';
import React from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { useIntl, defineMessages } from 'react-intl';
import { useSelector } from 'react-redux';
import compareRoles from '@openagenda/members/build/compareRoles';

const TABS_IN_APP = [
  'events',
  'members',
  'sources',
  'inbox',
  'activities',
  'statistics',
  'embeds',
  'settings_profile',
  'settings_contribution',
  'settings_advanced',
  'schema',
  'locations',
];

const messages = defineMessages({
  newTab: {
    id: 'react-layouts.AdminSections.newTab',
    defaultMessage: 'New !',
  },
});

export default function AdminSections({ sections, agenda, role }) {
  const location = useLocation();
  const intl = useIntl();

  const locationCount = useSelector(state =>
    _.get(state, 'agendaAdmin.locationCount', null));

  if (!sections) {
    return null;
  }

  return (
    <ul className="list-unstyled">
      {sections.map(section =>
        (section && section.tabs.length ? (
          <React.Fragment key={section.label}>
            <li>
              <h2>{section.label}</h2>
            </li>

            {section.tabs.map(tab => {
              const { name, label, link, newFeature } = tab;
              const selected = matchPath(location.pathname, {
                path: link,
                exact: name === 'events',
              });
              const tabInApp = TABS_IN_APP.includes(name);

              const authorizedTab = compareRoles.isSuperiorToOrEqual(
                role,
                tab.roles,
              );

              if (!authorizedTab) {
                if (selected) {
                  window.location.href = `/${agenda.slug}/admin/events`;
                }

                return null;
              }

              return (
                <li
                  key={name}
                  className={`menu-item js_menu_item js_menu_item_${name}${
                    selected ? ' selected' : ''
                  }`}
                >
                  {tabInApp ? (
                    <Link to={link}>{label}</Link>
                  ) : (
                    <a className={selected ? 'active' : ''} href={link}>
                      {label}
                    </a>
                  )}
                  {name === 'locations' && locationCount ? (
                    <>
                      {' '}
                      <span className="badge badge-warning">
                        {locationCount}
                      </span>
                    </>
                  ) : null}
                  {newFeature ? (
                    <span className="badge badge-default badge-outline-primary badge-baseline margin-left-sm">
                      {intl.formatMessage(messages.newTab)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </React.Fragment>
        ) : null))}
    </ul>
  );
}
