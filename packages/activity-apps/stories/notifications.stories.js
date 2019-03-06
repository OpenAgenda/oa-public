import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import notificationsHandler from '../src/client/notifications';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
const apiRoot = `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`;

class Wrapper extends Component {
  componentDidMount() {
    const { onDidMount } = this.props;

    if ( onDidMount ) {
      onDidMount();
    }
  }

  render() {
    return this.props.children;
  }
}


storiesOf( 'Notifications', module )
  .add( 'app', () => (
    <Wrapper
      onDidMount={() => {
        const canvas = document.querySelector( '.js_call_to_action_canvas' );

        if ( canvas ) {
          canvas.remove();
        }

        notificationsHandler( {
          res: {
            getCounter: `${apiRoot}/notifications/count`,
            list: `${apiRoot}/notifications/list`,
            remove: `${apiRoot}/notifications/remove/:notifId`,
            markRead: `${apiRoot}/notifications/mark-read/:notifId`,
            markAllRead: `${apiRoot}/notifications/mark-all-read`,
            seeActivities: `${apiRoot}/home/activities`,
          }
        } );
      }}
    >
      <div className="container">
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-nav navbar-right">
            <li className="notifications js_notifications">
              <a className="js_notifications_opener">
                <i className="fa fa-bell" aria-hidden="true"></i>
                <span className="label label-danger"></span>
              </a>
              <div className="js_notifications_panel"></div>
            </li>
          </ul>
        </div>
      </div>
    </Wrapper>
  ) );
