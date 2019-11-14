import React, { useState, useCallback, useEffect } from 'react';
import * as ReactIs from 'react-is';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import OutsideClickHandler from 'react-outside-click-handler';
import ErrorBoundary from 'react-error-boundary';
import classNames from 'classnames';
import notificationsHandler from '@openagenda/activity-apps/dist/client/notifications';
import * as mainActions from '../reducers/main';

const messages = defineMessages({
  search: {
    id: 'react-layouts.MainLayout.search',
    defaultMessage: 'Search'
  },
  help: {
    id: 'react-layouts.MainLayout.help',
    defaultMessage: 'Help'
  },
  general: {
    id: 'react-layouts.MainLayout.general',
    defaultMessage: 'General'
  },
  myEvents: {
    id: 'react-layouts.MainLayout.myEvents',
    defaultMessage: 'My events'
  },
  settings: {
    id: 'react-layouts.MainLayout.settings',
    defaultMessage: 'Settings'
  },
  signout: {
    id: 'react-layouts.MainLayout.signout',
    defaultMessage: 'Signout'
  },
  myAgendas: {
    id: 'react-layouts.MainLayout.myAgendas',
    defaultMessage: 'My agendas'
  },
  searchAgenda: {
    id: 'react-layouts.MainLayout.searchAgenda',
    defaultMessage: 'Search an agenda'
  },
  createAgenda: {
    id: 'react-layouts.MainLayout.createAgenda',
    defaultMessage: 'Create an agenda'
  },
  signin: {
    id: 'react-layouts.MainLayout.signin',
    defaultMessage: 'Signin'
  }
});

const pushTo = (history, to, state) => event => {
  event.preventDefault();
  history.push(to, state);
};

const Logo = React.memo(({ user, history }) => (user ? (
  <a href="/home" className="navbar-brand" onClick={pushTo(history, '/home')}>
    <img src="/images/openagenda.png" width="125" alt="OpenAgenda" />
  </a>
) : (
  <a className="navbar-brand" href="/">
    <img src="/images/openagenda.png" width="125" alt="OpenAgenda" />
  </a>
)));

const Search = React.memo(() => {
  const intl = useIntl();

  return (
    <form className="navbar-left search-form" role="search" action="/agendas">
      <input
        className="search-input"
        placeholder={intl.formatMessage(messages.search)}
        type="text"
        name="search"
      />
      {/* <input type="hidden" name="lang" value="<%= lang %>" /> */}
      <div className="search-button">
        <button className="search-submit" type="submit">
          <i className="fa fa-search" />
        </button>
      </div>
    </form>
  );
});

const HelpLink = React.memo(() => {
  const intl = useIntl();

  return (
    <div className="help-button-canvas">
      <a
        className="btn btn-primary btn-rounded btn-bordered"
        rel="nofollow"
        target="_blank"
        href="/support"
      >
        <i className="fa fa-question-circle" />{' '}
        <span>{intl.formatMessage(messages.help)}</span>
      </a>
    </div>
  );
});

function MainLayout({
  history,
  layout: Layout,
  component: Comp,
  onError,
  FallbackComponent,
  extraProps
}) {
  const intl = useIntl();

  const [userPanelOpened, setUserPanelOpened] = useState(false);

  const lang = useSelector(state => state.main.lang);
  const user = useSelector(state => state.main.user, shallowEqual);
  const apiRoot = useSelector(state => state.main.apiRoot);
  const inboxLoaded = useSelector(state => state.main.inboxLoaded);
  const hasInboxNews = useSelector(state => state.main.hasInboxNews);

  const dispatch = useDispatch();

  const checkInboxNews = useCallback(
    () => dispatch(mainActions.checkInboxNews()),
    [dispatch]
  );

  const toggleUserPanel = useCallback(
    () => setUserPanelOpened(state => !state),
    [setUserPanelOpened]
  );

  const closeUserPanel = useCallback(() => {
    if (userPanelOpened) {
      setTimeout(() => setUserPanelOpened(false));
    }
  }, [userPanelOpened, setUserPanelOpened]);

  const onSeeActivitiesClick = useCallback(
    e => {
      const panelElem = document.querySelector('.js_notifications_panel');

      e.preventDefault();

      if (!panelElem.classList.contains('hide')) {
        panelElem.classList.add('hide');
      }

      history.push('/home/activities');
    },
    [history]
  );

  const panelLink = useCallback(
    path => event => {
      event.preventDefault();
      toggleUserPanel();
      history.push(path);
    },
    [history, toggleUserPanel]
  );

  useEffect(() => {
    if (!inboxLoaded) {
      checkInboxNews().catch(() => null);
    }

    notificationsHandler({
      res: {
        getCounter: `${apiRoot}/notifications/count`,
        list: `${apiRoot}/notifications/list`,
        remove: `${apiRoot}/notifications/remove/:notifId`,
        markRead: `${apiRoot}/notifications/mark-read/:notifId`,
        markAllRead: `${apiRoot}/notifications/mark-all-read`,
        seeActivities: `${apiRoot}/home/activities`
      },
      onSeeActivitiesClick
    });
  }, [inboxLoaded, checkInboxNews, apiRoot, onSeeActivitiesClick]);

  const ErrorComponent = useCallback(
    props => React.createElement(FallbackComponent, { ...props, lang }),
    [FallbackComponent, lang]
  );

  const content = ReactIs.isValidElementType(Comp)
    ? React.createElement(Comp, { onError, extraProps })
    : Comp;

  return (
    <>
      <div id="outdated" />
      <nav
        className="oa-page-header navbar navbar-default navbar-static-top"
        id="nav"
      >
        <div className="container">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle collapsed"
              data-toggle="collapse"
              data-target="#oa-navbar-collapse"
              aria-expanded="false"
            >
              <i className="fa fa-bars" />
            </button>

            <Logo user={user} history={history} />
          </div>

          <div className="navbar-collapse collapse" id="oa-navbar-collapse">
            <Search />

            <ul className="nav navbar-nav navbar-right">
              <li>
                <HelpLink />
              </li>

              {/* TODO Language selector for unlogged */}

              {user ? (
                <li className="inbox">
                  <a href="/home/inbox">
                    <i className="fa fa-envelope" aria-hidden="true" />
                    {hasInboxNews ? (
                      <span className="label label-danger ">
                        <i className="fa fa-exclamation" />
                      </span>
                    ) : null}
                  </a>
                </li>
              ) : null}

              {user ? (
                <li className="profile" style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={toggleUserPanel}
                    aria-expanded={userPanelOpened}
                    className="btn btn-link-inline"
                  >
                    <span>{user.name}</span>
                  </button>
                  <OutsideClickHandler onOutsideClick={closeUserPanel}>
                    <ul
                      className={classNames('dropdown-menu js_dropdown_menu', {
                        'collapse in': userPanelOpened,
                        collapsed: !userPanelOpened
                      })}
                      role="menu"
                    >
                      <li>
                        <div className="row">
                          <ul className="list-unstyled col-md-6">
                            <li>
                              <h3>{intl.formatMessage(messages.general)}</h3>
                            </li>
                            <li>
                              <a
                                href="/home/events"
                                onClick={panelLink('/home/events')}
                              >
                                {intl.formatMessage(messages.myEvents)}
                              </a>
                            </li>
                            <li>
                              <a
                                href="/settings"
                                onClick={panelLink('/settings')}
                              >
                                {intl.formatMessage(messages.settings)}
                              </a>
                            </li>
                            <li>
                              <a href="/signout">
                                {intl.formatMessage(messages.signout)}
                              </a>
                            </li>
                          </ul>
                          <ul className="list-unstyled col-md-6">
                            <li>
                              <h3>Agendas</h3>
                            </li>
                            <li>
                              <a href="/home" onClick={panelLink('/home')}>
                                {intl.formatMessage(messages.myAgendas)}
                              </a>
                            </li>
                            <li>
                              <a href="/agendas">
                                {intl.formatMessage(messages.searchAgenda)}
                              </a>
                            </li>
                            <li>
                              <a href="/new" onClick={panelLink('/new')}>
                                {intl.formatMessage(messages.createAgenda)}
                              </a>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </OutsideClickHandler>
                </li>
              ) : (
                <li className="signin">
                  <a href="/signin">{intl.formatMessage(messages.signin)}</a>
                </li>
              )}

              {user ? (
                <li className="notifications js_notifications">
                  <button
                    type="button"
                    className="js_notifications_opener btn btn-link-inline"
                  >
                    <i className="fa fa-bell" aria-hidden="true" />
                    <span className="label label-danger" />
                  </button>
                  <div className="js_notifications_panel hide" />
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </nav>

      <ErrorBoundary onError={onError} FallbackComponent={ErrorComponent}>
        {ReactIs.isValidElementType(Layout) ? (
          <Layout extraProps={extraProps}>{content}</Layout>
        ) : (
          content
        )}
      </ErrorBoundary>
    </>
  );
}

MainLayout.layoutName = 'MainLayout';

export default React.memo(MainLayout);
