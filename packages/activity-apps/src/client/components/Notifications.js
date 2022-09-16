import React, { useState, useEffect, useCallback, useRef } from 'react';
import { defineMessages, IntlProvider, useIntl } from 'react-intl';
import classNames from 'classnames';
import moment from 'moment';
import sessions from '@openagenda/sessions/client';
import { Spinner, useApiClient } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import notifications from '../../notifications';

const ucfirst = s => s[0].toUpperCase() + s.substring(1);

const messages = defineMessages({
  viewAllActivities: {
    id: 'ActivityApps.Notifications.viewAllActivities',
    defaultMessage: 'View all activities'
  },
  noNotif: {
    id: 'ActivityApps.Notifications.noNotif',
    defaultMessage: 'No notification.'
  },
  markAllAsRead: {
    id: 'ActivityApps.Notifications.markAllAsRead',
    defaultMessage: 'Mark all as read'
  },
  next: {
    id: 'ActivityApps.Notifications.next',
    defaultMessage: 'Next'
  },
});

function useOnClickOutside(ref, handler) {
  useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler],
  );
}

function NotificationItem({
  notification,
  user,
  activitiesConfig,
  onRemove,
  onRead,
}) {
  const intl = useIntl();
  const { label, url } = notifications[notification.verb]?.(
    notification,
    {
      intl,
      config: activitiesConfig[notification.verb],
      userUid: user.uid,
      renderHighlight: v => <b>{v}</b>,
    },
  );

  const date = moment(notification.updatedAt);

  return (
    <a href={url} className={classNames('list-group-item', { read: notification.state === 2 })}>
      <div className="pull-right">
        <button className="btn btn-link remove" onClick={() => onRemove(notification.id)}>
          <i className="fa fa-times" aria-hidden="true" />
        </button>
        <button className="btn btn-link mark-read" onClick={() => onRead(notification.id)}>
          <i className="fa fa-check-circle" aria-hidden="true" />
        </button>
      </div>
      <div className="notif-item">
        {label}
      </div>
      <div className="datetime text-muted">
        {ucfirst(date.locale(intl.locale).fromNow())}
      </div>
    </a>
  );
}

const NotificationsBody = React.forwardRef(function NotificationsBody({
  user,
  setCounter,
  activitiesConfig,
}, ref) {
  const apiClient = useApiClient();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(null);
  const [lastPage, setLastPage] = useState(false);

  const getNotifications = useCallback(async () => {
    const { data } = await apiClient.get('/notifications/list');
    setNotifications(data.notifications);
    setLastPage(data.lastPage);
  }, []);

  const onNext = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/notifications/list?fromId=${notifications[notifications.length - 1].id}`);

      setNotifications(prev => [...prev, ...data.notifications]);
      setLastPage(data.lastPage);
    } catch (e) {
      console.log('Can\'t load next notifications', e);
    }
  }, [apiClient, notifications]);

  const onReadAll = useCallback(async () => {
    try {
      await apiClient.get('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => {
        n.state = 2;
        return n;
      }));
      setCounter(0);
    } catch (e) {
      console.log('Can\'t mark notifications as read', e);
    }
  }, [apiClient]);

  const onSeeActivities = useCallback(() => {
    // go to '/home/activities'
  }, []);

  const onRemove = useCallback(async id => {
    try {
      await apiClient.get(`/notifications/remove/${id}`);
      const lastId = notifications[notifications.length - 1].id;
      const { data } = apiClient.get(`/notifications/list?fromId=${lastId}&justOne=1`);
      setNotifications(prev => [
        ...prev.filter(v => v.id !== id),
        ...data.notifications
      ]);
    } catch (e) {
      console.log(`Can\'t remove notifications ${id}`, e);
    }
  }, [apiClient, notifications]);

  const onRead = useCallback(async id => {
    try {
      await apiClient.get(`/notifications/mark-read/${id}`);
      setNotifications(prev => prev.map(v => {
        if (v.id === id) {
          v.state = 2;
        }
        return v;
      }));
    } catch (e) {
      console.log(`Can\'t read notifications ${id}`, e);
    }
  }, [apiClient]);

  useEffect(() => {
    getNotifications()
      .then(() => setLoading(false))
      .catch(e => console.log('Can\'t list notifications:', e));
  }, []);

  if (loading) {
    return (
      <div className="notifications-body loading" ref={ref}>
        <Spinner />
      </div>
    );
  }



  return (
    <div className="notifications-body" ref={ref}>
      {notifications?.length ? (
        <div className="read-all-item">
          <div className="pull-left">
            <button
              className="btn btn-link-inline see-activities"
              onClick={onSeeActivities}
            >
              {intl.formatMessage(messages.viewAllActivities)}
            </button>
          </div>
          <div className="text-right">
            <button
              className="btn btn-link-inline read-all"
              onClick={onReadAll}
            >
              {intl.formatMessage(messages.markAllAsRead)}
            </button>
          </div>
        </div>
      ) : (
        <div className="no-notif">
          <div className="text-center padding-all-sm">
            {intl.formatMessage(messages.noNotif)}
          </div>
          <button className="btn btn-link see-activities center-block">
            {intl.formatMessage(messages.viewAllActivities)}
          </button>
        </div>
      )}

      <div className="list-group">
        {notifications?.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            user={user}
            activitiesConfig={activitiesConfig}
            onRemove={onRemove}
            onRead={onRead}
          />
        ))}

        {!lastPage ? (
          <div className="list-group-item next-item">
            <div className="text-center">
              <button className="btn btn-link next" onClick={onNext}>
                {intl.formatMessage(messages.next)}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default function Notifications({ user, activitiesConfig, locale }) {
  const apiClient = useApiClient();

  const [open, setOpen] = useState(false);
  const [counter, setCounter] = useState(0);

  const ref = useRef();

  const onClickOutside = useCallback(() => setOpen(false), []);

  useOnClickOutside(ref, onClickOutside);

  useEffect(() => {
    (async () => {
      const count = sessions.notifications.getCount();

      if (count !== null) {
        setCounter(count);
        return;
      }

      const { data } = await apiClient.get('/notifications/count');

      sessions.notifications.setCount(data.counter);
      setCounter(data.counter);
    })();
  }, []);

  return (
    <IntlProvider
      key={locale}
      locale={locale}
      messages={{}}
      defaultLocale={getSupportedLocale(locale)}
    >
      <li className="notifications">
        <button
          type="button"
          className="btn btn-link-inline"
          onClick={() => setOpen(prev => !prev)}
        >
          <i className="fa fa-bell" aria-hidden="true" />
          {counter ? (
            <span className="label label-danger">{counter}</span>
          ) : null}
        </button>
        {open ? (
          <NotificationsBody
            ref={ref}
            user={user}
            setCounter={setCounter}
            activitiesConfig={activitiesConfig}
          />
        ) : null}
      </li>
    </IntlProvider>
  );
};
