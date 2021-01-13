import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import get from '@openagenda/utils/get';
import GroupTagSelector from '@openagenda/react-form-components/build/GroupTagSelector';
import { ImageInput } from '@openagenda/react-shared';
import InputField from '@openagenda/react-form-components/build/InputField';
import LanguageBar from '@openagenda/react-form-components/build/LanguageBar';
import MultiInputField from '@openagenda/react-form-components/build/MultiInputField';
import MultilingualInputField from '@openagenda/react-form-components/build/MultilingualInputField';
import { Spinner } from '@openagenda/react-components';
import utils from '@openagenda/utils';
import debug from 'debug';

import errorLabels from '@openagenda/labels/errors';
import formLabels from '@openagenda/labels/agenda-locations/form';

import post from './post';
import actions from './formActions';
import CountryField from './CountryField';
import flattenTagSetLabels from './flattenTagSetLabels';
import LocationMap from './LocationMap';
import StateToggler from './StateToggler';
import suggestionHelpers from './suggestions.helpers';
import validate from './validate';
import extraGeoFields from './extraGeoFields';

const alternativeMaxLength = 50;
const log = debug('LocationForm');
const labels = {
  ...formLabels,
  ...errorLabels,
};

class LocationForm extends Component {
  static propTypes = {
    lang: PropTypes.string.isRequired, // server endpoints for set, merge and geocode
    enableGeocode: PropTypes.bool, // enable geocoder
    showToggler: PropTypes.bool, // show verified toggler
    detailedInfo: PropTypes.bool, // toggle display of location detailed info fields (description, website, phone...)
    cancel: PropTypes.bool,
    disableNoAlternatives: PropTypes.bool,
    displayLanguageTabs: PropTypes.bool,
    res: PropTypes.object,
    location: PropTypes.object, // if set, we are editing a location
    settings: PropTypes.object, // optional settings of agenda (such as tags requirements)
    labels: PropTypes.object, // overloading labels
    onSuccess: PropTypes.func, // takes location and update mode (true if is)
    onCancel: PropTypes.func,
    alternatives: PropTypes.array, // alternative to loaded location values
  };

  static defaultProps = {
    cancel: false, // cancel link if different
    showToggler: false,
    enableGeocode: true,
    detailedInfo: false,
    settings: {},
    labels: {},
    alternatives: [],
    disableNoAlternatives: false,
    displayLanguageTabs: true,
  };

  constructor(props) {
    super(props);

    this.actions = actions({
      getState: () => this.state,
      setState: newState => {
        this.setState(newState);
      },
    });

    log(props);
    const initState = this.actions.initialize(props);

    log('initializing form state: %j', initState);

    this.state = initState;

    // Binding
    this.getLabel = this.getLabel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onLanguagesChange = this.onLanguagesChange.bind(this);
    this.renderTagAlternative = this.renderTagAlternative.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.renderGeocodeButton = this.renderGeocodeButton.bind(this);
    this.onMarkerDragged = this.onMarkerDragged.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.setState({
      originScrollPosition:
        (window.pageYOffset || document.documentElement.scrollTop)
        - (document.documentElement.clientTop || 0),
    });
  }

  componentDidMount() {
    this.setState(
      {
        originScrollPosition:
          (window.pageYOffset || document.documentElement.scrollTop)
          - (document.documentElement.clientTop || 0),
      },
      () => {
        window.scrollTo(0, this.formPos());
      }
    );
  }

  componentWillUnmount() {
    const { originScrollPosition } = this.state;

    setTimeout(() => {
      window.scrollTo(0, originScrollPosition);
    }, 100);
  }

  onChange(name, value) {
    const updated = { location: {} };

    updated.location[name] = { $set: value };

    this.setState(update(this.state, updated));
  }

  onLanguagesChange(newLanguages) {
    const currentLanguages = this.getLanguages();
    const { location } = this.state;

    // description field serves as ref for language state
    // this should change but as long as its the only multi-l
    // field, this is how it is
    const description = JSON.parse(
      JSON.stringify(this.getMultilingual('description'))
    );

    currentLanguages.forEach(l => {
      if (newLanguages.indexOf(l) === -1) {
        delete description[l];
      }
    });

    newLanguages.forEach(l => {
      if (currentLanguages.indexOf(l) === -1) {
        description[l] = '';
      }
    });

    this.setState({
      location: update(location, {
        description: {
          $set: description,
        },
      }),
    });
  }

  onMarkerDragged(pos) {
    const { enableGeocode } = this.state;
    this.setState(
      update(this.state, {
        autoGeocode: { $set: false },
        location: {
          latitude: { $set: pos.latitude },
          longitude: { $set: pos.longitude },
        },
      })
    );

    if (!enableGeocode) return;

    this.updateLocationReverseGeocode(pos.latitude, pos.longitude);
  }

  onAddressChange(name, value) {
    const { autoGeocode, enableGeocode } = this.state;
    if (!autoGeocode || !enableGeocode) {
      return this.setState(
        update(this.state, {
          showGeocodeLink: { $set: true },
          location: {
            address: {
              $set: value,
            },
          },
        })
      );
    }
    // auto-geocode is on; we wait for the user to stop typing away
    // for a short while and we launch the request only if something has been typed.

    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
    }

    const doGeocode = value && value.trim().length >= 2;

    const updated = update(this.state, {
      geocodeLoading: { $set: doGeocode },
      location: {
        address: {
          $set: value,
        },
      },
    });

    this.setState(updated);

    if (!doGeocode) {
      return;
    }

    this.bufferTimeout = setTimeout(() => {
      this.updateLocationGeocode(value);
    }, 2000);
  }

  onCancel(e) {
    const { onCancel } = this.props;
    const { location } = this.state;
    e.preventDefault();
    onCancel(location);
  }

  setGeocodeFieldValue(field, value) {
    const updated = {
      location: {},
    };

    updated.location[field] = { $set: value };

    updated.geocodeEdit = { $set: null };

    this.setState(update(this.state, updated));
  }

  getLabel(name, values) {
    const { settings, lang, labels: propsLabels } = this.props;
    let str;
    let k;

    // see if label is defined in agenda settings
    if (settings?.labels?.[name]) {
      const l = settings.labels[name];
      str = _.get(l, lang, l[_.first(_.keys(l))]);
    } else if (propsLabels[name] || labels[name]) {
      const l = propsLabels[name] || labels[name];
      str = _.get(l, lang, l[_.first(_.keys(l))]);
    }

    if (!str) {
      return null;
    }

    if (values) {
      for (k in values) {
        str = str.replace(`%${k}%`, values[k]);
      }
    }

    return str;
  }

  getMultilingual(field) {
    const { lang } = this.props;
    const { location } = this.state;
    const data = location[field];
    const defaultData = {};

    defaultData[lang] = '';

    if (data && typeof data === 'object') {
      return data;
    } if (typeof data === 'string') {
      defaultData[lang] = data;
      return defaultData;
    }

    return data || defaultData;
  }

  getLanguages() {
    const { lang } = this.props;
    const languages = Object.keys(this.getMultilingual('description'));

    if (!languages.length) {
      languages.push(lang);
    }

    return languages;
  }

  getSetType(args) {
    const { location } = this.state;
    if (args.length === 2) {
      const [field, value] = args;
      return {
        data: { [field]: value },
        partial: true,
      };
    }
    return {
      data: location,
      partial: false,
    };
  }

  set(field, value, ...args) {
    let clean;
    const { settings } = this.props;
    const { location } = this.state;

    // if stuff is given in args, we need to do a partial update only
    const { data, partial } = this.getSetType([field, value].concat(args));

    try {
      clean = validate(data, settings, partial);
    } catch (errors) {
      log('validation errors', errors);
      return this.actions.setError(errors);
    }

    if (partial || !this.isNew()) {
      clean.uid = location.uid;
    }

    this.actions.setStart(this.getLabel('saving'));

    this.post(partial, clean);
  }

  post(partial, clean) {
    const { getSetRes, postRes, onSuccess } = this.props;
    log('post', clean);
    post(
      getSetRes ? getSetRes() : postRes,
      clean,
      (err, result) => {
        if (err) {
          log('error', err);
          return this.actions.setErrorResponse(this.getLabel('loadingError'));
        }

        if (!result.success) {
          return this.actions.setErrorResponse(this.getLabel('loadingError'));
        }

        this.actions.setSuccess(result.location);

        if (result.success) {
          onSuccess(result.location, !partial);
        }
      }
    );
  }

  formPos() {
    let obj = this['location-form'];
    let o = 0;

    if (obj.offsetParent) {
      do {
        o += obj.offsetTop;
      } while ((obj = obj.offsetParent));
    }

    return o;
  }

  isNew() {
    const { location } = this.props;
    return !(location && location.uid);
  }

  isFieldEnabled(name) {
    const { disableNoAlternatives, alternatives } = this.props;
    if (!disableNoAlternatives) {
      return true;
    }
    return suggestionHelpers.fieldHasAlternative(name, alternatives);
  }

  editGeocode(field, value) {
    this.setState({ geocodeEdit: field, geocodeEditValue: value });
  }

  cancelEditGeocode() {
    this.setState({ geocodeEdit: false });
  }

  updateLocationReverseGeocode(latitude, longitude) {
    const { res } = this.props;
    this.setState({
      geocodeLoading: true,
      geocodeEdit: false,
    });

    log(
      'reverse geocode from latitude %s and longitude %s',
      latitude,
      longitude
    );

    get(
      res.reverseGeocode,
      {
        latitude,
        longitude,
      },
      (err, result) => {
        if (err) {
          return log('error', err);
        }

        const updated = {
          geocodeLoading: { $set: false },
          geocodeError: { $set: false },
          geocodeEdit: { $set: false },
          geocodeNoResults: { $set: false },
        };

        updated.location = this.decorateLocation(result, true);

        const updatedState = update(this.state, updated);

        this.setState(updatedState);

        if (_.upperCase(updatedState.location.countryCode) === 'FR') {
          this.fetchINSEE(updatedState.location);
        }
      }
    );
  }

  updateLocationGeocode(value, setLoading) {
    const { res } = this.props;
    const { location: stateLocation } = this.state;
    if (setLoading) {
      this.setState({
        geocodeLoading: true,
        geocodeEdit: false,
      });
    }

    if (value === undefined) {
      value = stateLocation.address;
    }

    log(
      'getting geocode data for address %s in country %s',
      value,
      stateLocation.countryCode
    );

    get(
      res.geocode,
      {
        address: value,
        countryCode: stateLocation.countryCode,
      },
      (err, result) => {
        const updated = {
          geocodeLoading: { $set: false },
          geocodeError: { $set: false },
          geocodeEdit: { $set: false },
          geocodeNoResults: { $set: false },
        };

        if (err) {
          log('error', err);

          Object.assign(updated, {
            geocodeError: { $set: true },
            location: {
              latitude: { $set: stateLocation.latitude || 0 },
              longitude: { $set: stateLocation.longitude || 0 },
            },
          });
        } else if (result.results.length) {
          const location = this.decorateLocation(result);

          if (
            _.get(location, 'latitude')
            && _.get(location, 'longitude')
            && _.upperCase(_.get(this.state, 'location.countryCode')) === 'FR'
          ) {
            this.fetchINSEE(_.first(result.results));
          }

          updated.location = location;

          updated.autoGeocode = { $set: true };
          updated.showGeocodeLink = { $set: false };
        } else {
          updated.geocodeNoResults = { $set: true };
        }

        this.setState(update(this.state, updated));
      }
    );
  }

  fetchINSEE(location) {
    log('getting insee data for location %j', location);
    const { res } = this.props;
    const { location: stateLocation } = this.state;

    get(
      res.insee,
      _.pick(location, ['latitude', 'longitude', 'city', 'department']),
      (err, result) => {
        if (err) {
          return log('error', err);
        }

        log('retrieved insee: %j', result);

        this.setState({
          location: _.assign(stateLocation, {
            insee: _.get(result, 'code'),
          }),
        });
      }
    );
  }

  decorateLocation(gfResult, excludeCoordinates = false) {
    const { location } = this.state;
    const item = gfResult.results[0];

    const decoration = [
      'city',
      'district',
      'department',
      'postalCode',
      'region',
      'timezone',
      'insee',
    ].reduce((d, field) => {
      d[field] = { $set: item[field] };

      return d;
    }, {});

    if (!excludeCoordinates) {
      decoration.latitude = { $set: item.latitude };
      decoration.longitude = { $set: item.longitude };
    }

    if (
      item.countryCode
      && item.countryCode !== location.countryCode
    ) {
      decoration.countryCode = {
        $set: _.isString(item.countryCode)
          ? item.countryCode.toUpperCase()
          : null,
      };
    }

    return decoration;
  }

  renderAlternative(fieldName, pasteNames) {
    const { alternatives } = this.props;
    log('renderAlternative - field %s', fieldName);

    if (!alternatives || !alternatives.length) {
      return null;
    }

    const items = alternatives
      .map((l, i) => {
        if (!l.location[fieldName]) return null;

        let value = l.location[fieldName];

        if (utils.isArray(value)) {
          value = value.join(', ');
        } else if (value && typeof value === 'object' && !utils.size(value)) {
          return null;
        }

        return (
          <li key={fieldName + l.location.uid}>
            {l.label ? <span>{l.label}</span> : null}
            <button
              type="button"
              className="btn btn-link padding-v-z"
              onClick={() => this.actions.loadAlternative(
                alternatives,
                fieldName,
                i,
                pasteNames
              )}
            >
              {value.length > alternativeMaxLength
                ? `${value.substr(0, alternativeMaxLength)}...`
                : value}
            </button>
          </li>
        );
      })
      .filter(v => !!v);

    return items.length ? (
      <div className="alternatives">
        <ul>{items}</ul>
      </div>
    ) : null;
  }

  renderMultilingualAlternatives(fieldName, pasteNames) {
    return lang => {
      const { alternatives } = this.props;
      const items = alternatives
        .map((l, i) => {
          if (!l.location[fieldName] || !l.location[fieldName][lang]) {
            return null;
          }

          const lValue = l.location[fieldName] && typeof l.location[fieldName] === 'object'
            ? l.location[fieldName][lang] || ''
            : '';

          return (
            <li key={fieldName + lang + l.location.uid}>
              {l.label ? <span>{l.label}</span> : null}
              <a
                onClick={e =>
                  this.actions.loadAlternative(
                    alternatives,
                    fieldName,
                    i,
                    lang,
                    pasteNames
                  )
                }
              >
                {lValue.length > alternativeMaxLength
                  ? `${lValue.substr(0, alternativeMaxLength)}...`
                  : lValue}
              </a>
            </li>
          );
        })
        .filter(v => !!v);

      return items.length ? (
        <div className="alternatives">
          <ul>{items}</ul>
        </div>
      ) : null;
    };
  }

  /**
   * render an alternative to tag when at least one alternative
   * differs from location main
   */
  renderTagAlternative(tag, groupIndex, tagIndex) {
    const { location, alternatives } = this.props;
    const differentAlternatives = suggestionHelpers.suggestedTagsDiffer(
      tag,
      location,
      alternatives
    );

    if (!differentAlternatives.length) {
      return null;
    }

    const isInLocation = !!(location.tags || []).filter(
      t => t.id === tag.id
    ).length;

    const alternative = differentAlternatives[0];

    return (
      <div className="alternatives checkbox-alternatives">
        <ul>
          <li>
            {alternative.label ? <label>{alternative.label} </label> : null}
            <a
              onClick={e => this.actions.loadTagAlternative(tag, !isInLocation)}
            >
              <i
                className={
                  isInLocation ? 'fa fa-square-o' : 'fa fa-check-square-o'
                }
              />{' '}
              <span>{tag.label}</span>
            </a>
          </li>
        </ul>
      </div>
    );
  }

  renderImageAlternatives() {
    const { alternatives } = this.props;
    const items = alternatives
      .map((a, i) => {
        if (!a.location.image) {
          return null;
        }
        return (
          <li
            key={'image' + i}
            onClick={e =>
              this.actions.loadAlternative(alternatives, 'image', i)
            }
          >
            <img src={a.location.image} alt="" />
          </li>
        );
      })
      .filter(v => !!v);

    return items.length ? (
      <div className="alternatives image-alternatives">
        <ul>{items}</ul>
      </div>
    ) : null;
  }

  renderErrors() {
    const { lang } = this.props;
    const { errors: stateErrors } = this.state;
    const errors = stateErrors.filter(e => (e.field !== 'longitude')); // for displaying, latitude is enough.

    return (
      <div className="errors">
        <label>{this.getLabel('submitError')}:</label>
        {errors.map((err, i) => {
          const values = {};

          for (const k in err.values) {
            if (Object.prototype.hasOwnProperty.call(err.values, k)) {
              values[`%${k}%`] = err.values[k];
            }
          }

          if (err.group) {
            return (
              <div key={`err${err.id}`}>
                <label>{err.group[lang]}</label>:{' '}
                <span>{this.getLabel('required')}</span>
              </div>
            );
          }
          return (
            <div key={`err${i}`}>
              <label>{this.getLabel(err.field) || err.field}</label>:
              <span>{this.getLabel(err.code, values)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  renderGeocodeButton() {
    const { location, geocodeLoading } = this.state;
    return (
      <span className="input-group-btn geocode">
        <button
          className="btn btn-default"
          type="button"
          onClick={this.updateLocationGeocode.bind(
            null,
            location.address,
            true
          )}
        >
          {geocodeLoading ? (
            <i style={{ padding: '0.2em 0.65em' }}>
              <Spinner
                loading={geocodeLoading}
                options={{
                  width: 1,
                  length: 3,
                  radius: 4,
                  color: '#666',
                }}
              />
            </i>
          ) : (
            <i className="fa fa-search" />
          )}
        </button>
      </span>
    );
  }

  renderDetailedInfo() {
    const {
      lang, displayLanguageTabs, disableNoAlternatives, alternatives, settings, location: propsLocation
    } = this.props;
    const { location } = this.sate;
    return (
      <div className="form-group">
        <div
          className={
            this.isFieldEnabled('image') ? 'form-group' : 'form-group disabled'
          }
        >
          <ImageInput
            locale={lang}
            input={{
              onChange: file => this.onChange('image', file),
              value: this.state?.location.image,
            }}
          />
        </div>

        <InputField
          name="imageCredits"
          enabled={this.isFieldEnabled('imageCredits')}
          value={location.imageCredits}
          getLabel={this.getLabel}
          lang={lang}
          info="imageCreditsInfo"
          placeholder="imageCreditsPlaceholder"
          onChange={this.onChange}
          bottom={this.renderAlternative('imageCredits')}
          validator={validate.field('imageCredits')}
        />

        <div className="multilingual-group">
          {displayLanguageTabs ? (
            <LanguageBar
              languages={this.getLanguages()}
              getLabel={this.getLabel}
              onChange={this.onLanguagesChange}
            />
          ) : null}

          <MultilingualInputField
            name="description"
            enabled={
              disableNoAlternatives
                ? suggestionHelpers.getLangAlternatives(
                  'description',
                  alternatives
                )
                : null
            }
            value={this.getMultilingual('description')}
            languages={this.getLanguages()}
            getLabel={this.getLabel}
            onChange={this.onChange}
            placeholder={this.getLabel('descriptionPlaceholder')}
            info={this.getLabel('descriptionInfo')}
            bottom={this.renderMultilingualAlternatives('description')}
            type="textarea"
          />

          <MultilingualInputField
            name="access"
            enabled={
              disableNoAlternatives
                ? suggestionHelpers.getLangAlternatives(
                  'access',
                  alternatives
                )
                : null
            }
            value={this.getMultilingual('access')}
            languages={this.getLanguages()}
            getLabel={this.getLabel}
            onChange={this.onChange}
            placeholder={this.getLabel('accessPlaceholder')}
            info={this.getLabel('accessInfo')}
            bottom={this.renderMultilingualAlternatives('access')}
            type="text"
          />
        </div>

        <InputField
          name="phone"
          enabled={this.isFieldEnabled('phone')}
          value={location.phone}
          getLabel={this.getLabel}
          lang={lang}
          onChange={this.onChange}
          info="phoneInfo"
          placeholder="phonePlaceholder"
          bottom={this.renderAlternative('phone')}
          validator={validate.field('phone')}
        />

        <InputField
          name="website"
          enabled={this.isFieldEnabled('website')}
          value={location.website}
          getLabel={this.getLabel}
          lang={lang}
          info="websiteInfo"
          placeholder="websitePlaceholder"
          onChange={this.onChange}
          bottom={this.renderAlternative('website')}
          validator={validate.field('website')}
        />

        <InputField
          name="email"
          enabled={this.isFieldEnabled('email')}
          value={location.email}
          getLabel={this.getLabel}
          lang={lang}
          info="emailInfo"
          placeholder="emailPlaceholder"
          onChange={this.onChange}
          bottom={this.renderAlternative('email')}
          validator={validate.field('email')}
        />

        <MultiInputField
          name="links"
          enabled={this.isFieldEnabled('links')}
          info={this.getLabel('linksInfo')}
          placeholder={this.getLabel('linksPlaceholder')}
          value={location.links}
          getLabel={this.getLabel}
          lang={lang}
          onChange={this.onChange}
          bottom={this.renderAlternative('links')}
          validator={validate.field('links')}
        />

        {Object.keys(settings).length
        && settings.tagSet ? (
          <GroupTagSelector
            lang={lang}
            name="tags"
            set={flattenTagSetLabels(
              settings.tagSet,
              lang
            )}
            onChange={this.onChange}
            tagBottom={this.renderTagAlternative}
            disabledTagIds={
              disableNoAlternatives
                ? suggestionHelpers.getSameAsSuggestedTagIds(
                  settings.tagSet,
                  propsLocation,
                  alternatives
                )
                : []
            }
            value={location.tags || []}
          />
          ) : null}
      </div>
    );
  }

  renderGeoData() {
    const {
      enableGeocode, geocodeEdit, geocodeEditValue, geocodeNoResults
    } = this.state;

    const geo = {}; // _.pick(this.state.location, );

    ['region', 'department', 'city', 'postalCode', 'insee'].forEach(field => {
      if (enableGeocode && !_.get(this.state, ['location', field])) {
        return;
      }
      geo[field] = _.get(this.state, ['location', field]);
    });

    if (
      _.upperCase(_.get(this.state, 'location.countryCode')) === 'FR'
      && _.get(this.state, 'location.latitude')
    ) {
      extraGeoFields.forEach(field => {
        geo[field] = _.get(this.state, ['location', field], null);
      });
    }

    if (geocodeEdit) {
      return (
        <div className="form-inline margin-v-xs">
          <div className="form-group">
            <input
              className="form-control margin-right-xs"
              placeholder={this.getLabel(geocodeEdit)}
              type="text"
              onChange={e => this.editGeocode(geocodeEdit, e.target.value)}
              value={geocodeEditValue}
            />
            <button
              type="button"
              className="btn btn-primary margin-right-xs"
              onClick={() => this.setGeocodeFieldValue(
                geocodeEdit,
                geocodeEditValue
              )}
            >
              {this.getLabel('geocodeFieldSave')}
            </button>
            <button
              type="button"
              className="btn btn-default"
              onClick={() => this.cancelEditGeocode()}
            >
              {this.getLabel('geocodeFieldCancel')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        {geocodeNoResults ? (
          <div className="alert alert-warning" role="alert">
            <a href="#" className="alert-link">
              {this.getLabel('geocodeNoResults')}
            </a>
          </div>
        ) : null}
        <ul className="list-inline">
          {_.keys(geo).map(field => (
            <li key={`geo-${field}`}>
              <a
                className={
                  'badge badge-default margin-bottom-xs ' +
                  (geo[field] && geo[field].length
                    ? 'badge-outline-primary'
                    : 'badge-outline-warn')
                }
                onClick={() => this.editGeocode(
                  field,
                  _.get(this.state, ['location', field])
                )}
              >
                <span>
                  {this.getLabel(field)}: {geo[field]}&nbsp;
                </span>
                <i className="fa fa-pencil" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const {
      Header, showToggler, lang, detailedInfo, cancel, enableGeocode: propsEnableGeocode
    } = this.props;
    const {
      location, enableGeocode, pageSpin, geocodeError, autoGeocode, showExtIdInput, loadingError, errors
    } = this.state;
    log('rendering form with data %j', location);
    return (
      <div ref={r => (this['location-form'] = r)} className="location-form">
        {Header ? Header : null}

        {showToggler ? (
          <StateToggler
            locationState={location.state}
            onChange={state => this.setState({
              location: update(location, {
                state: { $set: state },
              }),
            })}
            getLabel={this.getLabel}
          />
        ) : null}

        <InputField
          name="name"
          enabled={this.isFieldEnabled('name')}
          value={location.name}
          info="nameInfo"
          placeholder="namePlaceholder"
          getLabel={this.getLabel}
          lang={lang}
          onChange={this.onChange}
          validator={validate.field('name')}
          bottom={this.renderAlternative('name')}
        />

        <CountryField
          enabled={this.isFieldEnabled('countryCode')}
          value={location.countryCode}
          lang={lang}
          onChange={this.onChange}
          getLabel={this.getLabel}
        />

        <InputField
          name="address"
          enabled
          value={location.address}
          info="addressInfo"
          placeholder="addressPlaceholder"
          onChange={this.onAddressChange}
          validator={validate.field('address')}
          lang={lang}
          getLabel={this.getLabel}
          groupClassName="margin-bottom-xs"
          className={enableGeocode ? 'input-group' : 'form-group'}
          errors={geocodeError ? [{ code: 'geocodeError' }] : false}
          renderButton={
            enableGeocode
              ? this.renderGeocodeButton
              : false
          }
          bottom={this.renderAlternative('address', [
            'address',
            'countryCode',
            'latitude',
            'longitude',
            'region',
            'department',
            'city',
            'postalCode',
            'timezone',
          ])}
          autoFocus={!!location.name}
        />

        {this.renderGeoData()}

        {!enableGeocode ? (
          <div className="alert alert-warning" role="alert">
            {this.getLabel('disabledGeocode')}
          </div>
        ) : null}

        <div
          className={
            this.isFieldEnabled('latitude')
              ? 'form-group'
              : 'form-group disabled'
          }
        >
          <LocationMap
            enabled={this.isFieldEnabled('latitude')}
            resetZoom={autoGeocode}
            defaultZoom={propsEnableGeocode ? null : 3}
            location={location}
            draggableMarker
            onMarkerDragged={this.onMarkerDragged}
            draggable
          />
        </div>

        {detailedInfo ? this.renderDetailedInfo() : ''}

        {detailedInfo
        && (location.extId || showExtIdInput ? (
          <InputField
            name="extId"
            enabled={this.isFieldEnabled('extId')}
            value={location.extId}
            getLabel={this.getLabel}
            lang={lang}
            info="extIdInfo"
            placeholder="extIdplaceholder"
            onChange={this.onChange}
            validator={validate.field('extId')}
          />
        ) : (
          <div className="form-group">
            <a
              className="muted"
              href="#"
              onClick={e => {
                e.preventDefault();
                this.actions.showExtId();
              }}
            >
              {this.getLabel('extIdLink')}
            </a>
          </div>
        ))}
        {loadingError ? (
          <div className="error">{loadingError}</div>
        ) : (
          ''
        )}

        {errors ? this.renderErrors() : ''}

        <div className="form-group bottom">
          {cancel || (
          <button
            type="button"
            className="btn btn-link"
            onClick={this.onCancel}
          >
            <span className="text-danger">{this.getLabel('cancel')}</span>
          </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={e => {
              e.preventDefault();
              this.set();
            }}
          >
            {this.getLabel('submit')}
          </button>
        </div>

        {pageSpin ? (
          <Spinner page message={pageSpin.message} />
        ) : null}
      </div>
    );
  }
}

export default LocationForm;
