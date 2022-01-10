import React from 'react';
import { Image } from '@openagenda/react-shared';

const getEventEditLink = (res, event) => res.edit
  .replace(':slug', event.agenda && event.agenda.slug)
  .replace(':eventUid', event.uid);

const getEventShowLink = (res, event) => {
  if (event.draft) {
    return getEventEditLink(res, event);
  }

  if (!event.agenda) {
    return '#';
  }

  return res[event.private ? 'showPrivate' : 'show']
    .replace(':slug', event.agenda.slug)
    .replace(':eventSlug', event.slug);
};

const getImagePath = image => {
  const thumbnail = Array.isArray(image.variants)
    ? image.variants.find(v => v.type === 'thumbnail')
    : null;

  const { filename } = thumbnail || image;
  const { base } = image;

  const trailingBaseSlash = base.slice(-1) === '/';
  const leadingFilenameSlash = filename.slice(1) === '/';

  if (trailingBaseSlash && leadingFilenameSlash) {
    return base.slice(0, -1) + filename;
  }

  if (trailingBaseSlash || leadingFilenameSlash) {
    return base + filename;
  }

  return `${base}/${filename}`;
};

const getMultilangLabel = (field, lang, defaultValue = '') => {
  if (field === null || typeof field !== 'object') {
    return field || defaultValue;
  }
  return field[lang] || field[Object.keys(field)[0]] || defaultValue;
};

function EventItem({
  event, res, getLabel, lang
}) {
  return (
    <li
      key={event.uid}
      className={`event-item media${event.draft ? ' draft' : ''}`}
    >
      <div className="padding-all-md" title={getLabel('show')}>
        <div className="media-left">
          <a href={getEventShowLink(res, event)}>
            <Image
              src={getImagePath(event.image)}
              fallbackSrc={getImagePath(event.image).replace(
                'cibuldev',
                'cibul'
              )}
              className="media-object ill avatar"
              alt={getMultilangLabel(event.title, lang, getLabel('noTitle'))}
            />
          </a>
        </div>
        <div className="media-body">
          <a href={getEventShowLink(res, event)}>
            <div className="title media-heading">
              {event.agenda ? (
                <div className="agenda">{event.agenda.title}</div>
              ) : null}
              <strong>
                {getMultilangLabel(event.title, getLabel('noTitle'))}
              </strong>
              {event.private ? (
                <div className="tooltip-icon">
                  <i className="fa fa-unlock-alt" />
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      {getLabel('privateEvent')}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="event-detail-part">
              {[
                event.location?.name ?? getLabel('noLocation'),
                event.timerange,
              ].join(' - ')}
            </div>
          </a>

          {event.agenda ? (
            <div className="actions">
              {event.draft ? (
                <span className="badge badge-sm badge-default padding-top-xs">
                  {getLabel('draft')}
                </span>
              ) : (
                <a
                  className="btn btn-link padding-top-xs padding-left-z"
                  href={getEventShowLink(res, event)}
                >
                  {getLabel('show')}
                </a>
              )}
              <a
                className="btn btn-link padding-top-xs padding-left-z"
                href={getEventEditLink(res, event)}
              >
                {getLabel('modify')}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default EventItem;
