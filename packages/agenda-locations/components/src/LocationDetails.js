import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';

import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-locations/form';
import confirmationLabels from '@openagenda/labels/agenda-locations/confirmation';
import { Spinner } from '@openagenda/react-components';
import get from '@openagenda/utils/get';

import extraGeoFields from './extraGeoFields';
import flattenTagSetLabels from './flattenTagSetLabels';

const log = debug('locationDetails');
const getFormLabel = makeLabelGetter(labels);
const getLabel = makeLabelGetter(confirmationLabels);

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

class LocationDetails extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    staticTiles: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired,
    hover: PropTypes.bool.isRequired,
    agenda: PropTypes.object.isRequired,
    res: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      contentLang: getPreferredLang(
        this.props.location.description,
        props.lang
      ),
      linkedAgendas: null,
    };
  }

  componentDidMount() {
    const { location, res } = this.props;
    get(res.get.replace(':locationUid', location.uid), { includeLinkedAgendas: true },
      (err, resp) => {
        this.setState({
          linkedAgendas: resp.linkedAgendas
        });
        return resp.linkedAgendas;
      });
  }

  toggleCurrentLang(contentLang, e) {
    e.preventDefault();
    this.setState({ contentLang });
  }

  renderLinkedAgendas() {
    const { agenda, lang, res } = this.props;
    const { linkedAgendas } = this.state;

    const filteredLAgendas = linkedAgendas.filter(a => a.uid !== agenda.uid);
    const nbAgendasRendered = filteredLAgendas.length > 3 ? 3 : filteredLAgendas.length;
    const nbAgendasUnrendered = filteredLAgendas.length - nbAgendasRendered;
    const link = `${res.agendaSearch}?uid[]=${filteredLAgendas.map(a => a.uid).join('&uid[]=')}`;

    if (nbAgendasRendered === 0) {
      return (<p>{ getLabel('noRefAgendas', lang) }</p>);
    }
    return (
      <div>
        <p>
          {nbAgendasRendered === 1
            ? <span>{ getLabel('oneRefAgendas', lang) }</span>
            : <span>{ getLabel('multiRefAgendas', lang) }</span>}
          {filteredLAgendas.slice(0, nbAgendasRendered - 1).map(a => (
            <>
              <a href={`${res.agendaSearch}/${a.uid}`}>{a.title}</a>
              <span>, </span>
            </>
          ))}
          <a href={`${res.agendaSearch}/${filteredLAgendas[nbAgendasRendered - 1].uid}`}>{filteredLAgendas[nbAgendasRendered - 1].title}</a>
          {nbAgendasUnrendered !== 0 ? <span>{ getLabel('andOn', lang) }</span> : null}
          {nbAgendasUnrendered === 1 ? <a href={link}>{ getLabel('oneOther', lang) }</a> : null}
          {nbAgendasUnrendered > 1 ? <a href={link}>{nbAgendasUnrendered}{ getLabel('others', lang) }</a> : null}
        </p>
      </div>
    );
  }

  render() {
    const {
      location, lang, settings, hover, staticTiles
    } = this.props;
    const { contentLang, linkedAgendas } = this.state;

    const hoverInfo = hover ? getLabel('hoverInfo', lang) : null;
    const staticMap = staticTiles?.replace(/{w}|{h}|{lon}|{lat}|{z}/gi, matched => mapValues(location)[matched]);
    const existingLangs = getExistingLangs(location);
    log('lang:', lang, ' settings:', settings, 'static:', staticMap);
    return (
      <div>
        <div className="margin-bottom-md">
          <label htmlFor="location-name">{location.name}</label>
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
            this.renderLinkedAgendas()
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
        <ul className="list-unstyled" title={hoverInfo}>
          <li>
            <label htmlFor="phone">{getFormLabel('phone', lang)} </label>:{' '}
            <span>{location.phone || <i>{getLabel('noValue', lang)}</i>}</span>
          </li>
          <li>
            <label htmlFor="email">{getFormLabel('email', lang)} </label>:{' '}
            <span>{location.email || <i>{getLabel('noValue', lang)}</i>}</span>
          </li>
          <li>
            <label htmlFor="website">{getFormLabel('website', lang)} </label>:{' '}
            <span>
              {location.website || <i>{getLabel('noValue', lang)}</i>}
            </span>
          </li>
          <li>
            <label htmlFor="links">{getFormLabel('links', lang)} </label>:
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
        <div className="padding-v-sm" title={hoverInfo}>
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
          <div className="padding-top-md" title={hoverInfo}>
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
