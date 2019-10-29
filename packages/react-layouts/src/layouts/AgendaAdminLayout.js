import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import * as ReactIs from 'react-is';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, matchPath } from 'react-router-dom';
import ErrorBoundary from 'react-error-boundary';
import shallowEqual from 'shallowequal';
import Image from '@openagenda/react-components/build/Image';
import Spinner from '@openagenda/react-components/build/Spinner';
import * as agendaAdminActions from '../reducers/agendaAdmin';
import MainLayout from './MainLayout';

function AgendaAdminLayout({ component: Comp, onError, FallbackComponent, params }) {
  const history = useHistory();

  const dispatch = useDispatch();
  const loadAgenda = useCallback(
    () => dispatch(agendaAdminActions.load(params.slug)),
    [dispatch, params.slug]
  );
  const verifyLocationCount = useCallback(
    () => dispatch(agendaAdminActions.verifyLocationCount(params.slug)),
    [dispatch, params.slug]
  );

  useEffect(
    () => {
      loadAgenda();
    },
    [loadAgenda]
  );

  useEffect(
    () => {
      verifyLocationCount();
    },
    [verifyLocationCount]
  );

  const lang = useSelector(state => state.main.lang);
  const user = useSelector(state => _.get(state, 'main.settings', null));
  const isLoading = useSelector(state => _.get(state, 'agendaAdmin.loading', true));
  const agenda = useSelector(state => _.get(state, 'agendaAdmin.data')) || {};
  const role = useSelector(state => _.get(state, 'agendaAdmin.role', null));
  const sections = useSelector(state => _.get(state, 'agendaAdmin.sections')) || [];
  const locationCount = useSelector(state => _.get(state, 'agendaAdmin.locationCount', null));

  const extraProps = useMemo(
    () => ({ agenda, role, sections }),
    [agenda, role, sections]
  );

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

  const Sections = useCallback(
    ({ location }) => sections.map(section => (
      section && section.tabs.length ? (
        <React.Fragment key={section.label}>
          <li>
            <h2>{section.label}</h2>
          </li>

          {section.tabs.map(({ name, label, link, scriptAnchor }) => {
            const selected = matchPath(link, location.pathname);

            return (
              <li
                key={name}
                className={`menu-item js_menu_item js_menu_item_${name}${selected ? ` selected` : ''}`}
              >
                <a className={selected ? 'active' : ''} href={link}>
                  {label}
                </a>
                {name === 'locations' && locationCount ? (
                  <>
                    {' '}<span className="badge badge-warning">{locationCount}</span>
                  </>
                ) : null}
              </li>
            );
          })}
        </React.Fragment>
      ) : null
    )),
    [sections, locationCount]
  );

  const component = useCallback(
    () => (
      <div className="container agenda-admin">
        <div className="row wsq header">
          {agenda.image ? (
            <div className="col col-sm-2">
              <a className="agenda-logo" href={`/${agenda.slug}`}>
                <Image
                  src={agenda.image}
                  fallbackSrc={__DEVELOPMENT__ ? agenda.image.replace('cibuldev', 'cibul') : null}
                  alt={agenda.title}
                />
              </a>
            </div>
          ) : null}

          <div className={`col col-sm-${agenda.image ? '10' : '12'}`}>
            <h1>{agenda.title}</h1>
            <p>Administration</p>
            <a className="url" href={`/${agenda.slug}`}>Retour</a>
          </div>
        </div>

        <div className="row wsq">
          <div className="col col-sm-3 nav">
            <ul className="list-unstyled">
              <Sections location={history.location} />
            </ul>
          </div>

          <div className="col col-sm-9 body" style={{ paddingTop: 0 }}>
            <ErrorBoundary onError={onError} FallbackComponent={ErrorComponent}>
              {ReactIs.isValidElementType(Comp)
                ? React.createElement(Comp, { onError, extraProps })
                : Comp}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    ),
    [Comp, Sections, agenda.slug, agenda.title, agenda.image]
  );

  if (!isLoading && !agenda.uid) {
    if (user) {
      history.replace('/home');
    } else {
      window.location.href = '/';
    }

    // Display Loading waiting redirection
    return <MainLayout component={Loading} params={params} />;
  }

  return <MainLayout component={isLoading ? Loading : component} params={params} />;
}

export default React.memo(AgendaAdminLayout, (prevProps, nextProps) => (
  prevProps.component === nextProps.component
  && shallowEqual(prevProps.params, nextProps.params)
  && shallowEqual(prevProps.match, nextProps.match)
));
