import { Image } from '@openagenda/react-shared';
import { getLocaleValue } from '@openagenda/intl';

const isDev = process.env.NODE_ENV === 'development';

const getEventEditLink = (res, event) =>
  res.edit
    .replace(':slug', event.agenda && event.agenda.slug)
    .replace(':eventUid', event.uid);

const getEventShowLink = (res, event, lang) => {
  if (event.draft) {
    return getEventEditLink(res, event);
  }

  if (!event.agenda) {
    return '#';
  }

  return res[event.private ? 'showPrivate' : 'show']
    .replace(':locale', lang)
    .replace(':slug', event.agenda.slug)
    .replace(':eventSlug', event.slug);
};

const getImagePath = (image) => {
  const thumbnail = Array.isArray(image.variants)
    ? image.variants.find((v) => v.type === 'thumbnail')
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

function EventItem({ event, res, getLabel, lang, onDuplicate }) {
  return (
    <li
      key={event.uid}
      className={`event-item media${event.draft ? ' draft' : ''}`}
    >
      <div className="padding-all-md" title={getLabel('show')}>
        <div className="media-left">
          <a href={getEventShowLink(res, event, lang)}>
            <Image
              src={getImagePath(event.image)}
              fallbackSrc={
                isDev ? getImagePath(event.image).replace('dev', 'main') : null
              }
              className="media-object ill avatar"
              alt={getLocaleValue(event.title, lang) || getLabel('noTitle')}
            />
          </a>
        </div>
        <div className="media-body">
          <a href={getEventShowLink(res, event, lang)}>
            <div className="title media-heading">
              {event.agenda ? (
                <div className="agenda">{event.agenda.title}</div>
              ) : null}
              <strong>
                {getLocaleValue(event.title, lang) || getLabel('noTitle')}
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
                  href={getEventShowLink(res, event, lang)}
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
              {onDuplicate && event.agendaUid ? (
                <button
                  type="button"
                  className="btn btn-link padding-top-xs padding-left-z"
                  onClick={() => onDuplicate(event)}
                >
                  {getLabel('duplicate')}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default EventItem;
