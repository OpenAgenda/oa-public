import _ from 'lodash';
import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';
import OutsideClickHandler from 'react-outside-click-handler';
import classNames from 'classnames';
import { useInterval } from 'react-use';
import ReactMarkdown from 'react-markdown';
import session from '@openagenda/sessions/client';
import notificationsHandler from '@openagenda/activity-apps/dist/client/notifications';
import { Modal } from '@openagenda/react-components';
import { useMemoOne } from '@openagenda/react-shared';
import useChildLayouts from '../hooks/useChildLayouts';
import * as mainActions from '../reducers/main';
import ErrorBoundary from '../components/ErrorBoundary';
import Loading from '../components/Loading';

const STORAGE_ANNOUNCEMENT_KEY = 'oa:announcement';

const getTarget = uri => (uri.match(/^(https?:|)\/\//) ? '_blank' : undefined);

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

const getDefaultSessionUser = () => session.getUser();

const Logo = React.memo(({ user }) => (user ? (
  <Link to="/home" className="navbar-brand">
    <img src="/images/openagenda.png" width="125" alt="OpenAgenda" />
  </Link>
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

function Announcement({ data, onClose }) {
  const kind = data.kind || 'info';

  return (
    <div className={`announcement bg-${kind}`}>
      <div className={`container text-${kind}`}>
        <div className="row padding-top-sm padding-right-sm padding-left-md">
          <div className="pull-right">
            <button
              type="button"
              className={`btn btn-link-inline text-${kind}`}
              onClick={onClose}
            >
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>

          <ReactMarkdown linkTarget={getTarget} source={data.content} />
        </div>
      </div>
    </div>
  );
}

function MainLayout({
  childLayouts,
  children,
  history,
  onError,
  FallbackComponent,
  lang
}) {
  const intl = useIntl();

  const [userPanelOpened, setUserPanelOpened] = useState(false);

  const user = useSelector(state => state.main.user, shallowEqual);
  const userLoaded = useSelector(state => state.main.userLoaded);
  const userLoading = useSelector(state => _.get(state, 'main.userLoading', true));
  const apiRoot = useSelector(state => state.main.apiRoot);
  const inboxLoaded = useSelector(state => state.main.inboxLoaded);
  const hasInboxNews = useSelector(state => state.main.hasInboxNews);

  const dispatch = useDispatch();

  const loadLayoutData = useCallback(() => {
    if (!userLoaded) {
      dispatch(mainActions.getUser());
    }
  }, [dispatch, userLoaded]);

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

  const ErrorComponent = useCallback(
    props => React.createElement(FallbackComponent, { ...props, lang }),
    [FallbackComponent, lang]
  );

  const extraProps = useMemoOne(
    () => ({
      user,
      lang
    }),
    [user, lang]
  );

  const [flashMessage, setFlashMessage] = useState(null);

  const removeMessage = useCallback(() => setFlashMessage(null), [
    setFlashMessage
  ]);

  useEffect(() => setFlashMessage(session.flash()), [setFlashMessage]);

  const [sessionUser, setSessionUser] = useState(
    typeof document !== 'undefined' ? getDefaultSessionUser : null
  );

  useInterval(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const freshSessionUser = session.getUser();

    if (shallowEqual(sessionUser, freshSessionUser)) {
      return;
    }

    setSessionUser(freshSessionUser);

    if (!freshSessionUser) {
      // reload page if user is disconnected
      window.location.reload();
    }
  }, 5000);

  useEffect(() => {
    loadLayoutData();
  }, [loadLayoutData]);

  useEffect(() => {
    if (!inboxLoaded) {
      checkInboxNews().catch(() => null);
    }
  }, [inboxLoaded, checkInboxNews]);

  useEffect(() => {
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
  }, [apiRoot, onSeeActivitiesClick]);

  const getContent = useChildLayouts(
    children,
    { extraProps, onError, FallbackComponent },
    childLayouts
  );

  const [viewedAnnoucement, setViewedAnnoucement] = useState(true);

  useEffect(() => {
    setViewedAnnoucement(
      user?.announcement
        && window.localStorage.getItem(STORAGE_ANNOUNCEMENT_KEY)
          === user.announcement.id
    );
  }, [user]);

  const hideAnnouncement = useCallback(() => {
    window.localStorage.setItem(STORAGE_ANNOUNCEMENT_KEY, user.announcement.id);
    setViewedAnnoucement(true);
  }, [user]);

  return (
    <>
      {lang ? (
        <Helmet>
          <html lang={lang} />
        </Helmet>
      ) : null}

      <div id="outdated" />

      <nav
        id="nav"
        className="oa-page-header navbar navbar-default navbar-static-top"
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

              {!userLoading && user ? (
                <>
                  <li className="inbox">
                    <Link to="/home/inbox">
                      <i className="fa fa-envelope" aria-hidden="true" />
                      {hasInboxNews ? (
                        <span className="label label-danger ">
                          <i className="fa fa-exclamation" />
                        </span>
                      ) : null}
                    </Link>
                  </li>

                  <li className="profile" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={toggleUserPanel}
                      aria-expanded={userPanelOpened}
                      className="btn btn-link-inline"
                    >
                      {user.thumbnail ? (
                        <img alt="user thumbnail" src={user.thumbnail} />
                      ) : (
                        <span>{user.fullName}</span>
                      )}
                    </button>
                    <OutsideClickHandler onOutsideClick={closeUserPanel}>
                      <ul
                        className={classNames(
                          'dropdown-menu js_dropdown_menu',
                          {
                            'collapse in': userPanelOpened,
                            collapsed: !userPanelOpened
                          }
                        )}
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
                </>
              ) : null}

              {!userLoading && !user ? (
                <li className="signin">
                  <a href="/signin">{intl.formatMessage(messages.signin)}</a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </nav>

      {user?.announcement && !viewedAnnoucement ? (
        <Announcement data={user.announcement} onClose={hideAnnouncement} />
      ) : null}

      <ErrorBoundary onError={onError} FallbackComponent={ErrorComponent}>
        {userLoading ? <Loading /> : getContent()}

        {flashMessage && flashMessage !== '' ? (
          <Modal>
            <div className="text-center">
              <p className="margin-top-sm">{flashMessage}</p>

              <button
                type="button"
                onClick={removeMessage}
                className="btn btn-primary"
              >
                Ok
              </button>
            </div>
          </Modal>
        ) : null}
      </ErrorBoundary>
    </>
  );
}

MainLayout.layoutName = 'MainLayout';

export default MainLayout;
