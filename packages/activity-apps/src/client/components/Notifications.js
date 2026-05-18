import React, { useState, useEffect, useCallback, useRef } from 'react';
import { defineMessages, IntlProvider, useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';
import { Spinner } from '@openagenda/react-shared';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import * as commonLocales from '@openagenda/common-labels';
import notificationsConfig from '../../notifications.js';
import * as appLocales from '../../locales-compiled/index.js';

const locales = mergeLocales(appLocales, commonLocales);

const ucfirst = (s) => s[0].toUpperCase() + s.substring(1);

const messages = defineMessages({
  viewHistory: {
    id: 'ActivityApps.Notifications.viewHistory',
    defaultMessage: 'View history',
  },
  noNotif: {
    id: 'ActivityApps.Notifications.noNotif',
    defaultMessage: 'No notification.',
  },
  markAllAsRead: {
    id: 'ActivityApps.Notifications.markAllAsRead',
    defaultMessage: 'Mark all as read',
  },
  markAsRead: {
    id: 'ActivityApps.Notifications.markAsRead',
    defaultMessage: 'Mark as read',
  },
  next: {
    id: 'ActivityApps.Notifications.next',
    defaultMessage: 'Next',
  },
  delete: {
    id: 'ActivityApps.Notifications.delete',
    defaultMessage: 'Delete',
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
  const { label, url } = notificationsConfig[notification.verb]?.(notification, {
    intl,
    config: activitiesConfig[notification.verb],
    userUid: user.uid,
    renderHighlight: (v) => <b>{v}</b>,
  }) ?? {};

  const date = moment(notification.updatedAt);

  return (
    <a
      href={url}
      className={classNames('list-group-item', {
        read: notification.state === 2,
      })}
    >
      <div className="pull-right">
        <button
          type="button"
          className="btn btn-link remove"
          onClick={() => onRemove(notification.id)}
          aria-label={intl.formatMessage(messages.delete)}
        >
          <i className="fa fa-times" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-link mark-read"
          onClick={() => onRead(notification.id)}
          aria-label={intl.formatMessage(messages.markAsRead)}
        >
          <i className="fa fa-check-circle" aria-hidden="true" />
        </button>
      </div>
      <div className="notif-item">{label}</div>
      <div className="datetime text-muted">
        {ucfirst(date.locale(intl.locale).fromNow())}
      </div>
    </a>
  );
}

const NotificationsBody = React.forwardRef(function NotificationsBody(
  { user, setCounter, closePanel, activitiesConfig },
  ref,
) {
  const intl = useIntl();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(null);
  const [lastPage, setLastPage] = useState(false);

  const getNotifications = useCallback(async () => {
    const data = await fetch('/notifications/list').then((response) => {
      if (!response.ok) {
        throw new Error("Can't list notifications");
      }
      return response.json();
    });
    setNotifications(data.notifications);
    setLastPage(data.lastPage);
  }, []);

  const onNext = useCallback(async () => {
    try {
      const last = notifications[notifications.length - 1];
      const url = `/notifications/list?fromId=${last.id}&fromUpdatedAt=${encodeURIComponent(last.updatedAt)}`;
      const data = await fetch(url).then((response) => {
        if (!response.ok) {
          throw new Error("Can't list notifications");
        }
        return response.json();
      });

      setNotifications((prev) => [...prev, ...data.notifications]);
      setLastPage(data.lastPage);
    } catch (e) {
      console.log("Can't load next notifications", e);
    }
  }, [notifications]);

  const onReadAll = useCallback(async () => {
    try {
      await fetch('/notifications/mark-all-read').then((response) => {
        if (!response.ok) {
          throw new Error("Can't mark notifications as read");
        }
        return response.json();
      });
      setNotifications((prev) =>
        prev.map((n) => {
          n.state = 2;
          return n;
        }));
      setCounter(0);
    } catch (e) {
      console.log("Can't mark notifications as read", e);
    }
  }, []);

  const onSeeActivities = useCallback(() => {
    closePanel();
    history.push('/home/activities');
  }, [closePanel, history]);

  const onRemove = useCallback(
    async (id) => {
      const wasUnread = notifications.find((n) => n.id === id)?.state !== 2;
      try {
        await fetch(`/notifications/remove/${id}`).then((response) => {
          if (!response.ok) {
            throw new Error("Can't remove notification");
          }
          return response.json();
        });
        const last = notifications[notifications.length - 1];
        const url = `/notifications/list?fromId=${last.id}&fromUpdatedAt=${encodeURIComponent(last.updatedAt)}&justOne=1`;
        const data = fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error("Can't list notifications");
          }
          return response.json();
        });
        setNotifications((prev) => [
          ...prev.filter((v) => v.id !== id),
          ...data.notifications,
        ]);
        if (wasUnread) setCounter((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.log(`Can't remove notifications ${id}`, e);
      }
    },
    [notifications, setCounter],
  );

  const onRead = useCallback(
    async (id) => {
      try {
        await fetch(`/notifications/mark-read/${id}`).then((response) => {
          if (!response.ok) {
            throw new Error("Can't mark notification as read");
          }
          return response.json();
        });
        setNotifications((prev) =>
          prev.map((v) => {
            if (v.id === id) {
              v.state = 2;
            }
            return v;
          }));
        setCounter((prev) => Math.max(0, prev - 1));
      } catch (e) {
        console.log(`Can't read notifications ${id}`, e);
      }
    },
    [setCounter],
  );

  useEffect(() => {
    getNotifications()
      .then(() => setLoading(false))
      .catch((e) => console.log("Can't list notifications:", e));
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
              type="button"
              className="btn btn-link-inline see-activities"
              onClick={onSeeActivities}
            >
              {intl.formatMessage(messages.viewHistory)}
            </button>
          </div>
          <div className="text-right">
            <button
              type="button"
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
          <button
            type="button"
            className="btn btn-link see-activities center-block"
            onClick={onSeeActivities}
          >
            {intl.formatMessage(messages.viewHistory)}
          </button>
        </div>
      )}

      <div className="list-group">
        {notifications?.map((notification) => (
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
              <button
                type="button"
                className="btn btn-link next"
                onClick={onNext}
              >
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
  const [open, setOpen] = useState(false);
  const [counter, setCounter] = useState(0);
  const location = useLocation();

  const ref = useRef();

  const closePanel = useCallback(() => setOpen(false), []);

  useOnClickOutside(ref, closePanel);

  const refreshCount = useCallback(async () => {
    try {
      const data = await fetch('/notifications/count').then((response) => {
        if (!response.ok) throw new Error("Can't count notifications");
        return response.json();
      });
      setCounter(data.counter);
    } catch (e) {
      console.log("Can't count notifications", e);
    }
  }, []);

  useEffect(() => {
    refreshCount();
  }, [location.pathname, refreshCount]);

  return (
    <IntlProvider
      key={locale}
      locale={locale}
      messages={locales[locale]}
      defaultLocale={getSupportedLocale(locale)}
    >
      <li className="notifications">
        <button
          type="button"
          className="btn btn-link-inline"
          onClick={() => setOpen((prev) => !prev)}
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
            closePanel={closePanel}
            activitiesConfig={activitiesConfig}
          />
        ) : null}
      </li>
    </IntlProvider>
  );
}
