"use strict";

import React from 'react';
import classNames from 'classnames';
import labels from 'labels/activities/notifications';
import makeLabelGetter from 'labels';
import notificationFormatMaker from 'activities/formatNotification';
import moment from 'moment';

import 'moment/locale/fr';

const ucfirst = s => s.substr( 0, 1 ).toUpperCase() + s.substring( 1 );

export default function ( options ) {

  const { lang, notifications, userUid } = Object.assign( {
    notifications: [],
    userUid: null,
    lang: 'fr'
  }, options );
  const formatNotification = notificationFormatMaker( null, labels, userUid );

  const getLabel = makeLabelGetter( labels, lang );
  let date = moment( notification.createdAt );
  let now = moment();

  if ( date.diff( now ) > 0 ) {
    date = now;
  }

  return (
    <div className="notifications-body">
      <div className="list-group">
        {(notifications && notifications.length > 0) && <div className="list-group-item read-all-item">
          <div className="text-right">
            <button className="btn btn-link read-all">{getLabel( 'markAllAsRead' )}</button>
          </div>
        </div>}
        {!notifications || !notifications.length && <div className="list-group-item no-notif">
          <div className="text-center padding-all-sm">{getLabel( 'noNotif' )}</div>
        </div>}
        {notifications
          .map( v => ({ notification: v, ...formatNotification( v, lang ) }) )
          .map( ( { notification, content, url } ) => (
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
              <div dangerouslySetInnerHTML={{ __html: content }} />
              <div className="datetime text-muted">
                {ucfirst( date.locale( lang ).fromNow() )}
              </div>
            </a>
          ) )}
        {(notifications && notifications.length > 0) && <div className="list-group-item next-item">
          <div className="text-center">
            <button className="btn btn-link next">{getLabel( 'next' )}</button>
          </div>
        </div>}
      </div>
    </div>
  );

}
