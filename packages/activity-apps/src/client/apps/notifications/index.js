import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import labels from '@openagenda/labels/activities/notifications';
import makeLabelGetter from '@openagenda/labels';
import notificationFormatMaker from '@openagenda/activities/dist/formatNotification';

import 'moment/locale/fr';

const ucfirst = s => s.substr( 0, 1 ).toUpperCase() + s.substring( 1 );

export default function ( options ) {

  const { lang, notifications, userUid } = Object.assign( {
    notifications: [],
    userUid: null,
    lang: 'fr'
  }, options );
  const formatNotification = notificationFormatMaker( null, labels, { userUid } );

  const getLabel = makeLabelGetter( labels, lang );

  return (
    <div className="notifications-body">
      <div className="list-group">
        {(notifications && notifications.length > 0) && <div className="list-group-item read-all-item">
          <div className="pull-left">
            <button className="btn btn-link see-activities">{getLabel( 'viewAllActivities' )}</button>
          </div>
          <div className="text-right">
            <button className="btn btn-link read-all">{getLabel( 'markAllAsRead' )}</button>
          </div>
        </div>}

        {!notifications || !notifications.length && <div className="list-group-item no-notif">
          <div className="text-center padding-all-sm">{getLabel( 'noNotif' )}</div>
          <button className="btn btn-link see-activities center-block">{getLabel( 'viewAllActivities' )}</button>
        </div>}

        {notifications
          .map( v => ({ notification: v, ...formatNotification( v, lang ), lang }) )
          .map( renderNotification )}

        {(notifications && notifications.length > 0) && <div className="list-group-item next-item">
          <div className="text-center">
            <button className="btn btn-link next">{getLabel( 'next' )}</button>
          </div>
        </div>}
      </div>
    </div>
  );

}

function renderNotification( { notification, content, url, lang } ) {

  let date = moment( notification.updatedAt );
  let now = moment();

  if ( date.diff( now ) > 0 ) {
    date = now;
  }

  return (
    <a
      href={url}
      className={classNames( 'list-group-item', { read: notification.state === 2 } )}
      key={notification.id}
      data-id={notification.id}
    >
      <div className="pull-right">
        <button className="btn btn-link remove">
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <button className="btn btn-link mark-read">
          <i className="fa fa-check-circle" aria-hidden="true"></i>
        </button>
      </div>
      <div className="notif-item" dangerouslySetInnerHTML={{ __html: content }} />
      <div className="datetime text-muted">
        {ucfirst( date.locale( lang ).fromNow() )}
      </div>
    </a>
  );

}
