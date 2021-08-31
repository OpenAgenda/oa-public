import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import Spinner from '@openagenda/react-shared/src/components/Spinner';
import get from '@openagenda/utils/get';

import extraGeoFields from './extraGeoFields';
import flattenTagSetLabels from './flattenTagSetLabels';

const log = debug('locationDetails');

const messages = defineMessages({
  district: {
    id: 'AgendaLocations.LocationDetails.district',
    defaultMessage: 'District',
  },
  city: {
    id: 'AgendaLocations.LocationDetails.city',
    defaultMessage: 'City',
  },
  region: {
    id: 'AgendaLocations.LocationDetails.region',
    defaultMessage: 'Region',
  },
  department: {
    id: 'AgendaLocations.LocationDetails.department',
    defaultMessage: 'Department',
  },
  postalCode: {
    id: 'AgendaLocations.LocationDetails.postalCode',
    defaultMessage: 'Postal code',
  },
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
});

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
    intl: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      contentLang: getPreferredLang(
        props.location.description,
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
    const { agenda, res } = this.props;
    const { linkedAgendas } = this.state;

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
  }

  render() {
    const {
      location, lang, settings, hover, staticTiles, intl
    } = this.props;
    const { contentLang, linkedAgendas } = this.state;

    const hoverInfo = hover ? intl.formatMessage(messages.hoverInfo) : null;
    const staticMap = staticTiles?.replace(/{w}|{h}|{lon}|{lat}|{z}/gi, matched => mapValues(location)[matched]);
    const existingLangs = getExistingLangs(location);
    log('lang:', lang, ' settings:', settings, 'static:', staticMap);
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
                    <FormattedMessage {...messages[f]} />:
                    {location[f] || intl.formatMessage(messages.emptyGeo)}
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
          {location.extId ? (
            <li>
              <label htmlFor="extId">{intl.formatMessage(messages.extId)} </label>:{' '}
              <span>{location.extId}</span>
            </li>
          ) : null}
          <li>
            <label htmlFor="phone">{intl.formatMessage(messages.phone)} </label>:{' '}
            <span>{location.phone || <i>{intl.formatMessage(messages.noValue)}</i>}</span>
          </li>
          <li>
            <label htmlFor="email">{intl.formatMessage(messages.email)} </label>:{' '}
            <span>{location.email || <i>{intl.formatMessage(messages.noValue)}</i>}</span>
          </li>
          <li>
            <label htmlFor="website">{intl.formatMessage(messages.website)} </label>:{' '}
            <span>
              {location.website || <i>{intl.formatMessage(messages.noValue)}</i>}
            </span>
          </li>
          <li>
            <label htmlFor="links">{intl.formatMessage(messages.links)} </label>:
            {(location.links || []).length ? (
              location.links.map((l, i) => (
                <div className="margin-bottom-xs" key={`l-link-${i}`}>
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
  }
}

export default injectIntl(LocationDetails);
