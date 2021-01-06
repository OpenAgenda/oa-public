import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-locations/form';
import confirmationLabels from '@openagenda/labels/agenda-locations/confirmation';

import extraGeoFields from './extraGeoFields';
import flattenTagSetLabels from './flattenTagSetLabels';

const SIZE = {
  W: 500,
  H: 160,
};

const getFormLabel = makeLabelGetter(labels);
const getLabel = makeLabelGetter(confirmationLabels);

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


const staticLink = (location, mapboxKey) =>
  `https://api.tiles.mapbox.com/v4/foursquare.meku766r/pin-m-circle+41acdd(${location.longitude},${location.latitude})/${location.longitude},${location.latitude},14/${SIZE.W}x${SIZE.H}.png?access_token=${mapboxKey}`;

class LocationConfirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contentLang: getPreferredLang(
        this.props.location.description,
        props.lang
      ),
      suggestChangeMessage: false,
    };
  }

  toggleCurrentLang(contentLang, e) {
    e.preventDefault();
    this.setState({ contentLang });
  }

  render() {
    const {
      res,
      location,
      lang,
      settings,
      onConfirm,
      onCancel,
      mapboxKey,
    } = this.props;

    const existingLangs = getExistingLangs(location);

    const { contentLang } = this.state;

    return (
      <div>
        <h1>THIS</h1>
        <div className="margin-top-md">
          <label>{getLabel('guide', lang)}</label>
          <p>{getLabel('guideDetail', lang)}</p>
        </div>
        <div className="info-block margin-bottom-md text-center">
          <div>
            <a
              target="_blank"
              href={res.suggestChange.replace(':locationUid', location.uid)}
              onClick={() => this.setState({ suggestChangeMessage: true })}
              className="btn btn-default margin-h-sm margin-bottom-sm"
            >
              {getLabel('suggest', lang)}
            </a>
            <button
              onClick={onCancel}
              className="btn btn-default margin-bottom-sm"
            >
              {getLabel('cancel', lang)}
            </button>
            {this.state.suggestChangeMessage ? (
              <div className="margin-bottom-sm">
                {getLabel('suggestChangeMessage', lang)}
              </div>
            ) : null}
          </div>
          <div>
            <button onClick={onConfirm} className="btn btn-primary margin-h-sm">
              {getLabel('confirm', lang)}
            </button>
          </div>
        </div>
        <div className="margin-bottom-md">
          <label>{location.name}</label>
          <p title={getLabel('hoverInfo', lang)}>{location.address}</p>
          <a
            title={getLabel('hoverInfo', lang)}
            target="_blank"
            href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=17/${location.latitude}/${location.longitude}`}
          >
            <img
              className="img-responsive"
              src={staticLink(location, mapboxKey)}
            />
          </a>
        </div>
        <div className="margin-top-sm" title={getLabel('hoverInfo', lang)}>
          <ul className="list-inline">
            {extraGeoFields.map(f => (
              <li key={'geo-' + f}>
                <div
                  className={
                    'badge badge-default margin-bottom-xs ' +
                    (location[f]
                      ? 'badge-outline-primary'
                      : 'badge-outline-default')
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
        {settings.tagSet
          ? flattenTagSetLabels(settings.tagSet, lang).groups.map(
              (group, i) => (
                <div key={'tag-group-' + i} className="margin-top-sm">
                  <label>{group.name}</label>
                  <ul
                    className="list-unstyled"
                    title={getLabel('hoverInfo', lang)}
                  >
                    {group.tags.map(tag => (
                      <li key={'tag-' + tag.id}>
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
            <label>{getFormLabel('phone', lang)} </label>:{' '}
            <span>{location.phone || <i>{getLabel('noValue', lang)}</i>}</span>
          </li>
          <li>
            <label>{getFormLabel('email', lang)} </label>:{' '}
            <span>{location.email || <i>{getLabel('noValue', lang)}</i>}</span>
          </li>
          <li>
            <label>{getFormLabel('website', lang)} </label>:{' '}
            <span>
              {location.website || <i>{getLabel('noValue', lang)}</i>}
            </span>
          </li>
          <li>
            <label>{getFormLabel('links', lang)} </label>:
            {(location.links || []).length ? (
              location.links.map((l, i) => (
                <div className="margin-bottom-xs" key={'l-link-' + i}>
                  <a target="_blank" href={l}>
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
          <label>{getLabel('image', lang)}</label>
          {location.image ? (
            <img className="img-responsive" src={location.image} />
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
              <div key={'field-' + mlField}>
                <label>{getLabel(mlField, lang)}</label>
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

export default props => <LocationConfirmation {...props} />;
