import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import {
  useHistory, useLocation, matchPath, Link
} from 'react-router-dom';
import compareRoles from '@openagenda/members/build/compareRoles';
import Image from '@openagenda/react-components/build/Image';
import Spinner from '@openagenda/react-components/build/Spinner';
import { useMemoOne } from '@openagenda/react-shared/dist/hooks/useMemoOne';
import * as agendaAdminActions from '../reducers/agendaAdmin';
import useChildLayouts from '../hooks/useChildLayouts';
import ErrorBoundary from '../components/ErrorBoundary';

const TABS_IN_APP = [
  'members',
  'sources',
  'inbox',
  'activities',
  'settings_profile',
  'settings_contribution',
  'settings_advanced'
];

function Sections({ agenda, role }) {
  const location = useLocation();

  const sections = useSelector(
    state => _.get(state, 'agendaAdmin.sections', null),
    shallowEqual
  );
  const locationCount = useSelector(state => _.get(state, 'agendaAdmin.locationCount', null));

  return (sections || []).map(section => (section && section.tabs.length ? (
    <React.Fragment key={section.label}>
      <li>
        <h2>{section.label}</h2>
      </li>

      {section.tabs.map(tab => {
        const { name, label, link } = tab;
        const selected = matchPath(location.pathname, link);
        const tabInApp = TABS_IN_APP.includes(name);

        const authorizedTab = compareRoles.isSuperiorToOrEqual(
          role,
          tab.roles
        );

        if (!authorizedTab) {
          if (selected) {
            window.location.href = `/${agenda.slug}/admin`;
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
                <span className="badge badge-warning">{locationCount}</span>
              </>
            ) : null}
          </li>
        );
      })}
    </React.Fragment>
  ) : null));
}

const Loading = () => (
  <div
    className="text-center margin-top-lg"
    style={{
      minHeight: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Spinner
      mode="inline"
      options={{
        scale: 1,
        width: 1
      }}
    />
  </div>
);

function AgendaAdminLayout({
  childLayouts,
  children,
  onError,
  FallbackComponent,
  extraProps: parentExtraProps
}) {
  const history = useHistory();
  const location = useLocation();

  const { params } = useMemo(() => matchPath(location.pathname, '/:slug'), [
    location.pathname
  ]);

  const dispatch = useDispatch();
  const loadLayoutData = useCallback(
    () => dispatch(agendaAdminActions.load(params.slug)),
    [dispatch, params.slug]
  );
  const verifyLocationCount = useCallback(
    () => dispatch(agendaAdminActions.verifyLocationCount(params.slug)),
    [dispatch, params.slug]
  );

  useEffect(() => {
    loadLayoutData();
  }, [loadLayoutData]);

  useEffect(() => {
    verifyLocationCount();
  }, [verifyLocationCount]);

  const lang = useSelector(state => state.main.lang);
  const user = useSelector(state => _.get(state, 'main.settings', null));
  const isLoading = useSelector(state => _.get(state, 'agendaAdmin.loading', true));
  const loadError = useSelector(state => _.get(state, 'agendaAdmin.error', null));
  const agenda = useSelector(
    state => _.get(state, 'agendaAdmin.agenda', null),
    shallowEqual
  );
  const agendaSchema = useSelector(
    state => _.get(state, 'agendaAdmin.agendaSchema', null),
    shallowEqual
  );
  const member = useSelector(
    state => _.get(state, 'agendaAdmin.member', null),
    shallowEqual
  );
  const role = useSelector(
    state => _.get(state, 'agendaAdmin.role', null),
    shallowEqual
  );
  const sections = useSelector(
    state => _.get(state, 'agendaAdmin.sections', null),
    shallowEqual
  );

  const extraProps = useMemoOne(
    () => ({
      ...parentExtraProps,
      agenda,
      agendaSchema,
      role,
      sections,
      member
    }),
    [parentExtraProps, agenda, member, role, sections]
  );

  const ErrorComponent = useCallback(
    props => React.createElement(FallbackComponent, { ...props, lang }),
    [FallbackComponent, lang]
  );

  const getContent = useChildLayouts(
    children,
    { extraProps, onError, FallbackComponent },
    childLayouts
  );

  if (loadError) {
    if (user) {
      history.replace('/home');
    } else {
      window.location.href = '/';
    }

    // Display Loading waiting redirection
    return <Loading />;
  }

  return isLoading ? (
    <Loading />
  ) : (
    <div className="container agenda-admin">
      <div className="row wsq header">
        {agenda.image ? (
          <div className="col col-sm-2">
            <a className="agenda-logo" href={`/${agenda.slug}`}>
              <Image
                src={agenda.image}
                fallbackSrc={
                  process.env.NODE_ENV === 'development'
                    ? agenda.image.replace('cibuldev', 'cibul')
                    : null
                }
                alt={agenda.title}
              />
            </a>
          </div>
        ) : null}

        <div className={`col col-sm-${agenda.image ? '10' : '12'}`}>
          <h1>{agenda.title}</h1>
          <p>Administration</p>
          <a className="url" href={`/${agenda.slug}`}>
            Retour
          </a>
        </div>
      </div>

      <div className="row wsq">
        <div className="col col-sm-3 nav">
          <ul className="list-unstyled">
            <Sections agenda={agenda} role={role} />
          </ul>
        </div>

        <div className="col col-sm-9 body" style={{ paddingTop: 0 }}>
          <ErrorBoundary onError={onError} FallbackComponent={ErrorComponent}>
            {getContent()}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

AgendaAdminLayout.layoutName = 'AgendaAdminLayout';

export default AgendaAdminLayout;
