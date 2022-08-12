import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { defineMessages, useIntl } from 'react-intl';

import Spinner from './Spinner';

const infoTypes = {
  warning: 'warning-outline'
};

const messages = defineMessages({
  emptyList: {
    id: 'ReactShared.EventSelection.emptyList',
    defaultMessage: 'No matching events were found'
  },
  undefinedTitle: {
    id: 'ReactShared.EventSelection.undefinedTitle',
    defaultMessage: 'Draft event without title'
  },
  undefinedDescription: {
    id: 'ReactShared.EventSelection.undefinedDescription',
    defaultMessage: 'Undefined description'
  }
});

const thumbnail = ({
  filename,
  base,
  variants
}) => base + ((variants ?? []).find(v => v.type === 'thumbnail')?.filename ?? filename);

const flat = (obj, locale) => {
  if (!obj) return '';

  if (obj[locale]) {
    return obj[locale];
  }

  const fallbackLang = Object.keys(obj).shift();

  return obj[fallbackLang];
};

const actionLink = (event, link) => link
  .replace('{event.uid}', event.uid)
  .replace('{event.slug}', event.slug);

const Canvas = ({
  title,
  info,
  infoType,
  children
}) => (
  <>
    {title ? <h2>{title}</h2> : null}
    {info ? (
      <div className={`info-block-sm margin-bottom-sm ${infoTypes[infoType] ?? ''}`}>
        {info}
      </div>
    ) : null}
    {children}
  </>
);

const EmptyList = ({ intl }) => (
  <div className="margin-v-sm">
    {intl.formatMessage(messages.emptyList)}
  </div>
);

const EventItem = ({
  event,
  locale,
  actions,
  m
}) => (
  <li className="event-item media compact margin-v-md" key={`event-selection-item-${event.uid}`}>
    <div className="media-left">
      <img
        className="media-object ill avatar"
        src={thumbnail(event.image)}
        alt=""
      />
    </div>
    <div className="media-body">
      <div className="title media-heading">
        <strong>{event.title ? flat(event.title, locale) : m(messages.undefinedTitle)}</strong>
      </div>
      <div className="event-detaile-part">
        {event.description ? flat(event.description, locale) : m(messages.undefinedDescription)}
        {event.dateRange ? ` - ${flat(event.dateRange, locale)}` : ''}
      </div>
      {actions.length ? (
        <div className="actions">
          {actions.map(action => (
            <a
              className="margin-right-sm"
              href={actionLink(event, action.link)}
            >
              {action.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  </li>
);

const Selection = ({
  events,
  intl,
  actions,
  m
}) => {
  if (!events.length) {
    return <EmptyList intl={intl} />;
  }

  return (
    <ul className="list-unstyled padding-v-sm">
      {events.map(event => (
        <EventItem
          event={event}
          locale={intl.locale}
          actions={actions}
          m={m}
        />
      ))}
    </ul>
  );
};

export default function EventSelection({
  title,
  info,
  infoType,
  res,
  actions = []
}) {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(res).then(({ data }) => {
      setEvents(data.events);
      setIsLoading(false);
    });
  }, [res]);

  return (
    <Canvas title={title} info={info} infoType={infoType}>
      {isLoading ? (
        <div className="padding-v-md">
          <Spinner />
        </div>
      ) : (
        <Selection
          intl={intl}
          events={events}
          actions={actions}
          m={intl.formatMessage}
        />
      )}
    </Canvas>
  );
}
