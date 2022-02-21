import React, { useState } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';

import geoFields from '@openagenda/agenda-locations/utils/geoFields';
import flattenTagSetLabels from '../flattenTagSetLabels';
import adminLevels from '../adminLevels';

const messages = {
  ...adminLevels,
  ...defineMessages({
    insee: {
      id: 'AgendaLocations.LocationDetails.insee',
      defaultMessage: 'INSEE code',
    },
    description: {
      id: 'AgendaLocations.LocationDetails.description',
      defaultMessage: 'Description',
    },
    access: {
      id: 'AgendaLocations.LocationDetails.access',
      defaultMessage: 'Access',
    },
    noRefAgendas: {
      id: 'AgendaLocations.LocationDetails.noRefAgendas',
      defaultMessage: 'This place is not referenced in any other agenda.',
    },
    hoverInfo: {
      id: 'AgendaLocations.LocationDetails.hoverInfo',
      defaultMessage: 'This information is not correct? Click on the button on top of this menu to detail the changes to bring',
    },
    emptyGeo: {
      id: 'AgendaLocations.LocationDetails.emptyGeo',
      defaultMessage: 'Empty',
    },
    phone: {
      id: 'AgendaLocations.LocationDetails.phone',
      defaultMessage: 'Telephone number',
    },
    email: {
      id: 'AgendaLocations.LocationDetails.email',
      defaultMessage: 'Contact email',
    },
    website: {
      id: 'AgendaLocations.LocationDetails.website',
      defaultMessage: 'Website',
    },
    links: {
      id: 'AgendaLocations.LocationDetails.links',
      defaultMessage: 'Additional links',
    },
    image: {
      id: 'AgendaLocations.LocationDetails.image',
      defaultMessage: 'Image',
    },
    noImage: {
      id: 'AgendaLocations.LocationDetails.noImage',
      defaultMessage: 'No image is defined',
    },
    noValue: {
      id: 'AgendaLocations.LocationDetails.noValue',
      defaultMessage: 'Not specified',
    },
    andOn: {
      id: 'AgendaLocations.LocationDetails.andOn',
      defaultMessage: ' and on',
    },
    refAgendas: {
      id: 'AgendaLocations.LocationDetails.refAgendas',
      defaultMessage: '{count, plural, =0 {nothing} one {This place is also referenced on the agenda} other {This place is also referenced on the agendas}}',
    },
    others: {
      id: 'AgendaLocations.LocationDetails.others',
      defaultMessage: '{count, plural, =0 {nothing} one {one other} other {#  others}}',
    },
    noContent: {
      id: 'AgendaLocations.LocationDetails.noContent',
      defaultMessage: 'No content {lang} is defined',
    },
    extId: {
      id: 'AgendaLocations.LocationDetails.extId',
      defaultMessage: 'External Identifier',
    },
  })
};

const mapValues = location => ({
  '{w}': 500,
  '{h}': 160,
  '{z}': 14,
  '{lon}': location.longitude,
  '{lat}': location.latitude
});

const getPreferredLang = (obj, lang) => (
  (Object.keys(obj || {}).includes(lang)
    ? lang
    : Object.keys(obj || {}).pop()) || lang
);

const getExistingLangs = location => (
  ['description', 'access'].reduce((langs, field) => {
    for (const fieldLang of Object.keys(location[field] || {})) {
      if (!langs.includes(fieldLang)) {
        langs.push(fieldLang);
      }
    }
    return langs;
  }, [])
);

const LocationDetails = ({
  location,
  agenda,
  lang,
  res,
  settings,
  hover,
  staticTiles
}) => {
  const intl = useIntl();
  const [contentLang, setContentLang] = useState(getPreferredLang(location.description, lang));
  const linkedAgendas = location?.linkedAgendas || [];
  const hoverInfo = hover ? intl.formatMessage(messages.hoverInfo) : null;
  const existingLangs = getExistingLangs(location);
  const staticMap = staticTiles?.replace(/{w}|{h}|{lon}|{lat}|{z}/gi, matched => mapValues(location)[matched]);

  const toggleCurrentLang = (newContentLang, e) => {
    e.preventDefault();
    setContentLang(newContentLang);
  };

  const renderLinkedAgendas = () => {
    const filteredLAgendas = linkedAgendas.filter(a => a.uid !== agenda.uid);
    const nbAgendasRendered = filteredLAgendas.length > 3 ? 3 : filteredLAgendas.length;
    const nbAgendasUnrendered = filteredLAgendas.length - nbAgendasRendered;
    const link = `${res.agendaSearch}?uid[]=${filteredLAgendas.map(a => a.uid).join('&uid[]=')}`;

    if (nbAgendasRendered === 0) {
      return (<p><FormattedMessage {...messages.noRefAgendas} /></p>);
    }
    return (
      <div>
        <p>
          <span><FormattedMessage values={{ count: nbAgendasRendered }} {...messages.refAgendas} /></span>
          {filteredLAgendas.slice(0, nbAgendasRendered - 1).map(a => (
            <>
              <a href={`${res.agendaSearch}/${a.uid}`}>{a.title}</a>
              <span>, </span>
            </>
          ))}
          <a href={`${res.agendaSearch}/${filteredLAgendas[nbAgendasRendered - 1].uid}`}>{filteredLAgendas[nbAgendasRendered - 1].title}</a>
          {nbAgendasUnrendered !== 0 ? <span><FormattedMessage {...messages.andOn} /></span> : null}
          {nbAgendasUnrendered !== 0 ? <a href={link}><FormattedMessage values={{ count: nbAgendasUnrendered }} {...messages.others} /> </a> : null}
        </p>
      </div>
    );
  };

  return (
    <div>
      <div className="margin-bottom-md">
        {!linkedAgendas ? (
          <i style={{ padding: '0.2em 0.65em' }}>
            <Spinner
              mode="inline"
              options={{
                width: 2,
                length: 3,
                radius: 4,
                color: '#666',
              }}
            />
          </i>
        ) : (
          renderLinkedAgendas()
        )}
        <p title={hoverInfo}>{location.address}</p>
        <a
          title={hoverInfo}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=17/${location.latitude}/${location.longitude}`}
        >
          <img
            className="img-responsive"
            src={staticMap}
            alt=""
          />
        </a>
      </div>
      <div className="margin-bottom-md">
        <ul className="list-inline">
          {geoFields(location.countryCode).fields.map(f => (
            <li key={`geo-${f.field}`}>
              <div
                className={
                  `badge badge-default margin-bottom-xs
                    ${(location[f.field]
                    ? 'badge-outline-primary'
                    : 'badge-outline-default')}`
                }
              >
                <span>
                  {intl.formatMessage(messages[f.label])}:
                  {location[f.field] || intl.formatMessage(messages.emptyGeo)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {settings?.tagSet
        ? flattenTagSetLabels(settings.tagSet, lang).groups.map(
          group => (
            <div key={`tag-group-${group}`} className="margin-top-sm">
              <label htmlFor="group-name">{group.name}</label>
              <ul
                className="list-unstyled"
                title={hoverInfo}
              >
                {group.tags.map(tag => (
                  <li key={`tag-${tag.id}`}>
                    <div
                      className={
                        (location.tags || []).filter(t => t.id === tag.id)
                          .length
                          ? 'badge badge-default badge-outline-primary margin-bottom-xs'
                          : 'badge badge-muted margin-bottom-xs'
                      }
                    >
                      <span>{tag.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        )
        : null}
      <ul className="list-unstyled" title={hoverInfo}>
        {location.extId ? (
          <li>
            <label htmlFor="extId">{intl.formatMessage(messages.extId)} </label>:{' '}
            <span>{location.extId}</span>
          </li>
        ) : null}
        <li>
          <label htmlFor="phone">{intl.formatMessage(messages.phone)} </label>:{' '}
          {location.phone
            ? (
              <span><a href={`tel:${location.phone}`}>{location.phone}</a></span>
            )
            : (
              <span><i>{intl.formatMessage(messages.noValue)}</i></span>
            )}
        </li>
        <li>
          <label htmlFor="email">{intl.formatMessage(messages.email)} </label>:{' '}
          {location.email
            ? (
              <span><a href={`mailto:${location.email}`}>{location.email}</a></span>
            )
            : (
              <span><i>{intl.formatMessage(messages.noValue)}</i></span>
            )}
        </li>
        <li style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '400px',
          whiteSpace: 'nowrap',
          display: 'block'
        }}
        >
          <label htmlFor="website">{intl.formatMessage(messages.website)} </label>:{' '}
          {location.website
            ? (
              <span>
                <a href={location.website}>{location.website}</a>
              </span>
            )
            : (
              <span><i>{intl.formatMessage(messages.noValue)}</i></span>
            )}
        </li>
        <li>
          <label htmlFor="links">{intl.formatMessage(messages.links)} </label>:
          {(location.links || []).length ? (
            location.links.map(l => (
              <div
                className="margin-bottom-xs"
                key={`l-link-${l}`}
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '400px',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}
              >
                <a target="_blank" rel="noopener noreferrer" href={l}>
                  {l}
                </a>
              </div>
            ))
          ) : (
            <i>{intl.formatMessage(messages.noValue)}</i>
          )}
        </li>
      </ul>
      <div className="padding-v-sm" title={hoverInfo}>
        <label htmlFor="image">{intl.formatMessage(messages.image)}</label>
        {location.image ? (
          <img className="img-responsive" src={location.image} alt="" />
        ) : (
          <p>
            <i>{intl.formatMessage(messages.noImage)}</i>
          </p>
        )}
      </div>
      <div>
        <ul className="nav nav-pills pull-right">
          {existingLangs.map(fieldLang => (
            <li
              key={`lang-tab-${fieldLang}`}
              onClick={toggleCurrentLang.bind(this, fieldLang)}
              role="presentation"
              className={fieldLang === contentLang ? 'active' : ''}
            >
              <button type="button" className="btn btn-link"> {fieldLang.toUpperCase()} </button>
            </li>
          ))}
        </ul>
        <div className="padding-top-md" title={hoverInfo}>
          {['description', 'access'].map(mlField => (
            <div key={`field-${mlField}`}>
              <label htmlFor="mlField"><FormattedMessage {...messages[mlField]} /></label>
              <p>
                {location[mlField] && location[mlField][contentLang] ? (
                  location[mlField][contentLang]
                ) : (
                  <i>
                    {existingLangs.length
                      ? <FormattedMessage values={{ lang: contentLang.toUpperCase() }} {...messages.noContent} />
                      : <FormattedMessage {...messages.noValue} />}
                  </i>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
