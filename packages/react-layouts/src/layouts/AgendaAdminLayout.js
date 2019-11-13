import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import * as ReactIs from 'react-is';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useLocation, matchPath, Link } from 'react-router-dom';
import ErrorBoundary from 'react-error-boundary';
import Image from '@openagenda/react-components/build/Image';
import Spinner from '@openagenda/react-components/build/Spinner';
import * as agendaAdminActions from '../reducers/agendaAdmin';
import MainLayout from './MainLayout';

const TABS_IN_APP = [
  'sources',
  'settings_profile',
  'settings_contribution',
  'settings_advanced'
];

function Sections() {
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

      {section.tabs.map(({ name, label, link }) => {
        const selected = matchPath(link, location.pathname);
        const tabInApp = TABS_IN_APP.includes(name);

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

function AgendaAdminLayout({
  history,
  component: Comp,
  onError,
  FallbackComponent
}) {
  const { params } = useMemo(
    () => matchPath(history.location.pathname, '/:slug'),
    [history.location.pathname]
  );

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
    state => _.get(state, 'agendaAdmin.data', null),
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

  const extraProps = useMemo(() => ({ agenda, role, sections }), [
    agenda,
    role,
    sections
  ]);

  const Loading = useCallback(
    () => (
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
    ),
    []
  );

  const ErrorComponent = useCallback(
    props => React.createElement(FallbackComponent, { ...props, lang }),
    [FallbackComponent, lang]
  );

  const layout = useCallback(
    ({ children }) => (isLoading ? (
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
              <Sections />
            </ul>
          </div>

          <div className="col col-sm-9 body" style={{ paddingTop: 0 }}>
            <ErrorBoundary
              onError={onError}
              FallbackComponent={ErrorComponent}
            >
              {children}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    )),
    [isLoading, agenda, onError, ErrorComponent]
  );

  const content = useMemo(
    () => (ReactIs.isValidElementType(Comp)
      ? React.createElement(Comp, { onError, extraProps })
      : Comp),
    [Comp, onError, extraProps]
  );

  if (loadError) {
    if (user) {
      history.replace('/home');
    } else {
      window.location.href = '/';
    }

    // Display Loading waiting redirection
    return <MainLayout history={history} component={Loading} />;
  }

  return (
    <MainLayout
      history={history}
      layout={layout}
      component={content}
      extraProps={extraProps}
    />
  );
}

AgendaAdminLayout.layoutName = 'AgendaAdminLayout';

export default AgendaAdminLayout;
