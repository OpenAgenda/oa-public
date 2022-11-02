import _ from 'lodash';
import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';
import OutsideClickHandler from 'react-outside-click-handler';
import classNames from 'classnames';
import { useCookie, useInterval } from 'react-use';
import { css } from '@emotion/react';
import session from '@openagenda/sessions/client';
import Notifications from '@openagenda/activity-apps/dist/client/components/Notifications';
import * as mainActions from '../reducers/main';
import ChildLayouts from '../components/ChildLayouts';
import ErrorBoundary from '../components/ErrorBoundary';
import Loading from '../components/Loading';
import Logo from '../components/Logo';
import Search from '../components/Search';
import HelpLink from '../components/HelpLink';
import Announcement from '../components/Announcement';
import FlashModal from '../components/FlashModal';

const STORAGE_ANNOUNCEMENT_KEY = 'oa:announcement';

const messages = defineMessages({
  general: {
    id: 'react-layouts.MainLayout.general',
    defaultMessage: 'General',
  },
  myEvents: {
    id: 'react-layouts.MainLayout.myEvents',
    defaultMessage: 'My events',
  },
  settings: {
    id: 'react-layouts.MainLayout.settings',
    defaultMessage: 'Settings',
  },
  signout: {
    id: 'react-layouts.MainLayout.signout',
    defaultMessage: 'Signout',
  },
  myAgendas: {
    id: 'react-layouts.MainLayout.myAgendas',
    defaultMessage: 'My agendas',
  },
  searchAgenda: {
    id: 'react-layouts.MainLayout.searchAgenda',
    defaultMessage: 'Search an agenda',
  },
  createAgenda: {
    id: 'react-layouts.MainLayout.createAgenda',
    defaultMessage: 'Create an agenda',
  },
  signin: {
    id: 'react-layouts.MainLayout.signin',
    defaultMessage: 'Signin',
  },
  translate: {
    id: 'react-layouts.MainLayout.translate',
    defaultMessage: 'Translate',
  },
});

function TranslateLink() {
  const intl = useIntl();

  // Not come from cookie because of SSR
  const translateMode = useSelector(state => state.main.translateMode);

  const [, setTranslateMode, deleteTranslateMode] = useCookie('translateMode');

  const toggleTranslateMode = useCallback(() => {
    if (translateMode) {
      deleteTranslateMode();
    } else {
      setTranslateMode('true');
    }

    window.location.reload();
  }, [translateMode, setTranslateMode, deleteTranslateMode]);

  return (
    <button
      type="button"
      className={translateMode ? 'btn btn-default active' : 'btn btn-link'}
      css={css`
        padding: 13px;
        font-size: 22px;
        line-height: 14px;
      `}
      title={intl.formatMessage(messages.translate)}
      onClick={toggleTranslateMode}
    >
      <i className="fa fa-language" />
    </button>
  );
}

const getDefaultSessionUser = () => session.getUser();

function MainLayout({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
  history,
}) {
  const intl = useIntl();

  const [userPanelOpened, setUserPanelOpened] = useState(false);

  const user = useSelector(state => state.main.user, shallowEqual);
  const userLoaded = useSelector(state => state.main.userLoaded);
  const userLoading = useSelector(state => _.get(state, 'main.userLoading', true));
  const inboxLoaded = useSelector(state => state.main.inboxLoaded);
  const hasInboxNews = useSelector(state => state.main.hasInboxNews);
  const isTranslator = useSelector(state => state.main.isTranslator);
  const translateMode = useSelector(state => state.main.translateMode);
  const activitiesConfig = useSelector(state => state.settings.activities);

  const dispatch = useDispatch();

  const loadLayoutData = useCallback(
    () => dispatch(mainActions.getUser()),
    [dispatch]
  );

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

  const panelLink = useCallback(
    path => event => {
      event.preventDefault();
      toggleUserPanel();
      history.push(path);
    },
    [history, toggleUserPanel]
  );

  const ErrorComponent = useCallback(
    props => React.createElement(FallbackComponent, { ...props, lang: intl.locale }),
    [FallbackComponent, intl.locale]
  );

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
      return window.location.reload();
    }

    loadLayoutData().catch(() => null);
  }, 5000);

  useEffect(() => {
    if (!userLoaded) {
      loadLayoutData().catch(() => null);
    }
  }, [loadLayoutData, userLoaded]);

  useEffect(() => {
    if (!inboxLoaded) {
      checkInboxNews().catch(() => null);
    }
  }, [inboxLoaded, checkInboxNews]);

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
      <Helmet>
        <html lang={intl.locale} />
      </Helmet>

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
              {isTranslator || translateMode ? (
                <li>
                  <TranslateLink />
                </li>
              ) : null}

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
                        <span className="label label-danger">
                          <b>!</b>
                        </span>
                      ) : null}
                    </Link>
                  </li>

                  <Notifications
                    user={user}
                    activitiesConfig={activitiesConfig}
                    locale={intl.locale}
                  />

                  <li className="profile" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={toggleUserPanel}
                      aria-expanded={userPanelOpened}
                      className="btn btn-link-inline"
                    >
                      {user.image ? (
                        <img alt="user thumbnail" src={user.image} />
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
                            collapsed: !userPanelOpened,
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
        <Announcement
          kind={user.announcement.kind}
          content={user.announcement.content}
          onClose={hideAnnouncement}
        />
      ) : null}

      <ErrorBoundary onError={onError} FallbackComponent={ErrorComponent}>
        {userLoading ? (
          <Loading />
        ) : (
          <ChildLayouts
            layouts={childLayouts}
            extraProps={extraProps}
            onError={onError}
            FallbackComponent={ErrorComponent}
            // additional extraProps
            user={user}
            lang={intl.locale}
          >
            {children}
          </ChildLayouts>
        )}

        <FlashModal />
      </ErrorBoundary>
    </>
  );
}

MainLayout.layoutName = 'MainLayout';

export default MainLayout;
