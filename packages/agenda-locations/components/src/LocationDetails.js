import React, { Component } from 'react';
import PropTypes, { string } from 'prop-types';

import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-locations/form';
import confirmationLabels from '@openagenda/labels/agenda-locations/confirmation';

import extraGeoFields from './extraGeoFields';
import flattenTagSetLabels from './flattenTagSetLabels';
import debug from 'debug';

const log = debug('locationDetails');
const getFormLabel = makeLabelGetter(labels);
const getLabel = makeLabelGetter(confirmationLabels);

const mapValues = (location) => {
  return {
    '{w}': 500,
    '{h}': 160,
    '{z}': 14,
    '{lon}': location.longitude,
    '{lat}': location.latitude
  }
};

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

class LocationDetails extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    staticTiles: PropTypes.string,
    lang: PropTypes.string,
    settings: PropTypes.object,
    hover: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      contentLang: getPreferredLang(
        this.props.location.description,
        props.lang
      ),
    };
  }

  toggleCurrentLang(contentLang, e) {
    e.preventDefault();
    this.setState({ contentLang });
  }

  render() {
    const { location, lang, settings, hover, staticTiles } = this.props;
    const { contentLang } = this.state;

    const hoverInfo = hover ? getLabel('hoverInfo', lang) : null;
    const staticMap = staticTiles?.replace(/{w}|{h}|{lon}|{lat}|{z}/gi, (matched) => mapValues(location)[matched]);
    const existingLangs = getExistingLangs(location);
    log('lang:', lang, ' settings:', settings, 'static:', staticMap);
    return (
      <div>
        <div className="margin-bottom-md">
          <label htmlFor="location-name">{location.name}</label>
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
            {extraGeoFields.map(f => (
              <li key={`geo-${f}`}>
                <div
                  className={
                    `badge badge-default margin-bottom-xs
                    ${(location[f]
                      ? 'badge-outline-primary'
                      : 'badge-outline-default')}`
                  }
                >
                  <span>
                    {getFormLabel(f, lang)}:
                    {location[f] || getLabel('emptyGeo', lang)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {settings?.tagSet
          ? flattenTagSetLabels(settings.tagSet, lang).groups.map(
            (group, i) => (
              <div key={`tag-group-${i}`} className="margin-top-sm">
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
        <ul className="list-unstyled" title={getLabel('hoverInfo', lang)}>
          <li>
            <label htmlFor="phone">{getFormLabel('phone', lang)} </label>:{' '}
            <span>{location.phone || <i>{getLabel('noValue', lang)}</i>}</span>
          </li>
          <li>
            <label htmlFor="email">{getFormLabel('email', lang)} </label>:{' '}
            <span>{location.email || <i>{getLabel('noValue', lang)}</i>}</span>
          </li>
          <li>
            <label htmlFor="website">{getFormLabel('website', lang)} </label>:{' '}
            <span>
              {location.website || <i>{getLabel('noValue', lang)}</i>}
            </span>
          </li>
          <li>
            <label htmlFor="links">{getFormLabel('links', lang)} </label>:
            {(location.links || []).length ? (
              location.links.map((l, i) => (
                <div className="margin-bottom-xs" key={`l-link-${i}`}>
                  <a target="_blank" rel="noopener noreferrer" href={l}>
                    {l}
                  </a>
                </div>
              ))
            ) : (
              <i>{getLabel('noValue', lang)}</i>
            )}
          </li>
        </ul>
        <div className="padding-v-sm" title={getLabel('hoverInfo', lang)}>
          <label htmlFor="image">{getLabel('image', lang)}</label>
          {location.image ? (
            <img className="img-responsive" src={location.image} alt="" />
          ) : (
            <p>
              <i>{getLabel('noImage', lang)}</i>
            </p>
          )}
        </div>
        <div>
          <ul className="nav nav-pills pull-right">
            {existingLangs.map(fieldLang => (
              <li
                key={`lang-tab-${fieldLang}`}
                onClick={this.toggleCurrentLang.bind(this, fieldLang)}
                role="presentation"
                className={fieldLang === contentLang ? 'active' : ''}
              >
                <a href="#">{fieldLang.toUpperCase()}</a>
              </li>
            ))}
          </ul>
          <div className="padding-top-md" title={getLabel('hoverInfo', lang)}>
            {['description', 'access'].map(mlField => (
              <div key={`field-${mlField}`}>
                <label htmlFor="mlField">{getLabel(mlField, lang)}</label>
                <p>
                  {location[mlField] && location[mlField][contentLang] ? (
                    location[mlField][contentLang]
                  ) : (
                    <i>
                      {getLabel(
                        existingLangs.length ? 'noContent' : 'noValue',
                        { lang: contentLang.toUpperCase() },
                        lang
                      )}
                    </i>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default LocationDetails;