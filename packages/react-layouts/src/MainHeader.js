import React, { Component } from 'react';
import { connect } from 'react-redux';
import OutsideClickHandler from 'react-outside-click-handler';
import classNames from 'classnames';
import notificationsHandler from '@openagenda/activity-apps/dist/client/notifications';
import * as headerActions from './reducers/header';

const pushTo = (history, to, state) => event => {
  event.preventDefault();
  history.push(to, state);
};

const Logo = React.memo(({ user, history }) => (
  user ? (
    <a href="/home" className="navbar-brand" onClick={pushTo(history, '/home')}>
      <img src="/images/openagenda.png" width="125" alt="OpenAgenda" />
    </a>
  ) : (
    <a className="navbar-brand" href="/">
      <img src="/images/openagenda.png" width="125" alt="OpenAgenda" />
    </a>
  )
));

const Search = React.memo(() => (
  <form
    className="navbar-left search-form"
    role="search"
    action="/agendas"
  >
    <input className="search-input" placeholder="Rechercher" type="text" name="search" />
    {/*<input type="hidden" name="lang" value="<%= lang %>" />*/}
    <div className="search-button">
      <button className="search-submit" type="submit"><i className="fa fa-search"></i></button>
    </div>
  </form>
));

const HelpLink = React.memo(() => (
  <div className="help-button-canvas">
    <a
      className="btn btn-primary btn-rounded btn-bordered"
      rel="nofollow"
      target="_blank"
      href="/support"
    >
      <i className="fa fa-question-circle"></i>
      {' '}
      <span>Aide</span>
    </a>
  </div>
));

@connect(
  state => ({
    user: state.header.user,
    apiRoot: state.header.apiRoot,
    inboxLoaded: state.header.inboxLoaded,
    hasInboxNews: state.header.hasInboxNews
  }),
  headerActions
)
export default class MainHeader extends Component {
  state = {
    preToggleUserPanel: false,
    userPanelOpened: false
  };

  componentDidMount() {
    const { apiRoot, inboxLoaded, hasInboxNews } = this.props;

    if (!inboxLoaded) {
      hasInboxNews().catch(() => null);
    }

    notificationsHandler({
      res: {
        getCounter: `${apiRoot}/notifications/count`,
        list: `${apiRoot}/notifications/list`,
        remove: `${apiRoot}/notifications/remove/:notifId`,
        markRead: `${apiRoot}/notifications/mark-read/:notifId`,
        markAllRead: `${apiRoot}/notifications/mark-all-read`,
        seeActivities: `${apiRoot}/home/activities`,
      },
      onSeeActivitiesClick: this.onSeeActivitiesClick
    });
  }

  onSeeActivitiesClick = e => {
    const { history } = this.props;
    const panelElem = document.querySelector('.js_notifications_panel');

    e.preventDefault();

    if (!panelElem.classList.contains('hide')) {
      panelElem.classList.add('hide');
    }

    history.push('/home/activities');
  };

  allowDisplayUserPanel = () => this.setState({
    preToggleUserPanel: true
  });

  toggleUserPanel = () => this.setState(state => ({
    userPanelOpened: !state.userPanelOpened,
    preToggleUserPanel: !state.preToggleUserPanel
  }));

  panelLink = path => event => {
    const { history } = this.props;

    event.preventDefault();
    this.toggleUserPanel();
    history.push(path);
  };

  render() {
    const { user, history, hasInboxNews } = this.props;
    const { preToggleUserPanel, userPanelOpened } = this.state;

    return (
      <>
        <div id="outdated"></div>
        <nav className="oa-page-header navbar navbar-default navbar-static-top" id="nav">
          <div className="container">
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#oa-navbar-collapse"
                aria-expanded="false"
              >
                <i className="fa fa-bars"></i>
              </button>

              <Logo user={user} history={history} />
            </div>

            <div
              className="navbar-collapse collapse"
              id="oa-navbar-collapse"
            >
              <Search />

              <ul className="nav navbar-nav navbar-right">
                <li>
                  <HelpLink />
                </li>

                {/* TODO Language selector for unlogged */}

                {user ? (
                  <li className="inbox">
                    <a href="/home/inbox">
                      <i className="fa fa-envelope" aria-hidden="true"></i>
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
                    <a
                      aria-expanded="false"
                      onMouseDownCapture={this.allowDisplayUserPanel}
                      onMouseUpCapture={preToggleUserPanel ? this.toggleUserPanel : null}
                    >
                      <span>{user.name}</span>
                    </a>
                    <OutsideClickHandler onOutsideClick={this.toggleUserPanel}>
                      <ul
                        className={classNames(
                          'dropdown-menu js_dropdown_menu',
                          {
                            'collapse in': userPanelOpened,
                            'collapsed': !userPanelOpened,
                          }
                        )}
                        role="menu"
                      >
                        <li>
                          <div className="row">
                            <ul className="list-unstyled col-md-6">
                              <li>
                                <h3>Général</h3>
                              </li>
                              <li>
                                <a href="/home/events" onClick={this.panelLink('/home/events')}>
                                  Mes événements
                                </a>
                              </li>
                              <li>
                                <a href="/settings" onClick={this.panelLink('/settings')}>
                                  Paramètres
                                </a>
                              </li>
                              <li>
                                <a href="/signout">Déconnexion</a>
                              </li>
                            </ul>
                            <ul className="list-unstyled col-md-6">
                              <li><h3>Agendas</h3></li>
                              <li><a href="/home" onClick={this.panelLink('/home')}>Mes Agendas</a></li>
                              <li><a href="/agendas">Chercher un agenda</a></li>
                              <li><a href="/new" onClick={this.panelLink('/new')}>Créer un agenda</a></li>
                            </ul>
                          </div>
                        </li>
                      </ul>
                    </OutsideClickHandler>
                  </li>
                ) : (
                  <li className="signin">
                    <a href="/signin">Se connecter</a>
                  </li>
                )}

                {user ? (
                  <li className="notifications js_notifications">
                    <a className="js_notifications_opener">
                      <i className="fa fa-bell" aria-hidden="true"></i>
                      <span className="label label-danger"></span>
                    </a>
                    <div className="js_notifications_panel hide"></div>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </nav>
      </>
    );
  }
}
