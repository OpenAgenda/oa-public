import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import get from '@openagenda/utils/get';
import GroupTagSelector from '@openagenda/react-form-components/build/GroupTagSelector';
import { Spinner, ImageInput } from '@openagenda/react-shared';

import LanguageBar from '@openagenda/react-form-components/build/LanguageBar';
import MultiInputField from '@openagenda/react-form-components/build/MultiInputField';
import MultilingualInputField from '@openagenda/react-form-components/build/MultilingualInputField';
import utils from '@openagenda/utils';
import debug from 'debug';

import InputField from './InputField';
import post from './post';
import actions from './formActions';
import CountryField from './CountryField';
import flattenTagSetLabels from './flattenTagSetLabels';
import LocationMap from './LoadableLocationMap';
import StateToggler from './StateToggler';
import suggestionHelpers from './suggestions.helpers';
import validate from './validate';
import GeoBadges from './GeoBadges';

const alternativeMaxLength = 50;
const log = debug('LocationForm');

const messages = defineMessages({
  postalCode: {
    id: 'AgendaLocations.LocationForm.postalCode',
    defaultMessage: 'Postal code',
  },
  insee: {
    id: 'AgendaLocations.LocationForm.insee',
    defaultMessage: 'INSEE code',
  },
  loadingError: {
    id: 'AgendaLocations.LocationForm.loadingError',
    defaultMessage: 'A problem occurred during the load. Please retry.',
  },
  saving: {
    id: 'AgendaLocations.LocationForm.saving',
    defaultMessage: 'Saving',
  },
  required: {
    id: 'AgendaLocations.LocationForm.required',
    defaultMessage: 'Required',
  },
  name: {
    id: 'AgendaLocations.LocationForm.name',
    defaultMessage: 'Name of the location',
  },
  namePlaceholder: {
    id: 'AgendaLocations.LocationForm.namePlaceholder',
    defaultMessage: 'Example: Moulin Rouge',
  },
  description: {
    id: 'AgendaLocations.LocationForm.description',
    defaultMessage: 'Description',
  },
  descriptionInfo: {
    id: 'AgendaLocations.LocationForm.descriptionInfo',
    defaultMessage: 'Details about the location',
  },
  address: {
    id: 'AgendaLocations.LocationForm.address',
    defaultMessage: 'Address',
  },
  addressPlaceholder: {
    id: 'AgendaLocations.LocationForm.addressPlaceholder',
    defaultMessage: 'Number Street, City ( example : 82 Boulevard de Clichy, Paris )',
  },
  links: {
    id: 'AgendaLocations.LocationForm.links',
    defaultMessage: 'Additional links',
  },
  linksInfo: {
    id: 'AgendaLocations.LocationForm.linksInfo',
    defaultMessage: 'Add social media references, or any other link related to the location',
  },
  access: {
    id: 'AgendaLocations.LocationForm.access',
    defaultMessage: 'Access',
  },
  website: {
    id: 'AgendaLocations.LocationForm.website',
    defaultMessage: 'Website',
  },
  phone: {
    id: 'AgendaLocations.LocationForm.phone',
    defaultMessage: 'Telephone number',
  },
  email: {
    id: 'AgendaLocations.LocationForm.email',
    defaultMessage: 'Contact email',
  },
  image: {
    id: 'AgendaLocations.LocationForm.image',
    defaultMessage: 'Image',
  },
  imageInfo: {
    id: 'AgendaLocations.LocationForm.imageInfo',
    defaultMessage: 'Only upload images you have the right to re-use',
  },
  imageCredits: {
    id: 'AgendaLocations.LocationForm.imageCredits',
    defaultMessage: 'Image credits',
  },
  geocodeFieldSave: {
    id: 'AgendaLocations.LocationForm.geocodeFieldSave',
    defaultMessage: 'Ok',
  },
  geocodeFieldCancel: {
    id: 'AgendaLocations.LocationForm.geocodeFieldCancel',
    defaultMessage: 'Cancel',
  },
  geocodeNoResults: {
    id: 'AgendaLocations.LocationForm.geocodeNoResults',
    defaultMessage: 'We could not locate this address. Start over by typing the name of the town or city only, position the marker on the map in the right location and then specify the complete address once the marker is correctly placed.',
  },
  disabledGeocode: {
    id: 'AgendaLocations.LocationForm.disabledGeocode',
    defaultMessage: 'The automatic localisation is temporarily unavailable. Drag the marker to the correct location on the map manually.',
  },
  extId: {
    id: 'AgendaLocations.LocationForm.extId',
    defaultMessage: 'External Identifier',
  },
  extIdInfo: {
    id: 'AgendaLocations.LocationForm.extIdInfo',
    defaultMessage: 'Optionnally, specify a unique identifier for this location',
  },
  extIdLink: {
    id: 'AgendaLocations.LocationForm.extIdLink',
    defaultMessage: 'Define a unique identifier for this location',
  },
  cancel: {
    id: 'AgendaLocations.LocationForm.cancel',
    defaultMessage: 'Cancel',
  },
  createSubmit: {
    id: 'AgendaLocations.LocationForm.createSubmit',
    defaultMessage: 'Create',
  },
  updateSubmit: {
    id: 'AgendaLocations.LocationForm.updateSubmit',
    defaultMessage: 'Update',
  },
  createSubmitError: {
    id: 'AgendaLocations.LocationForm.createSubmitError',
    defaultMessage: 'The location could not be created',
  },
  updateSubmitError: {
    id: 'AgendaLocations.LocationForm.updateSubmitError',
    defaultMessage: 'The location could not be updated',
  },
  addLanguage: {
    id: 'AgendaLocations.LocationForm.addLanguage',
    defaultMessage: 'Add a language',
  },
});

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
    onSuccess: PropTypes.func, // takes location and update mode (true if is)
    onCancel: PropTypes.func,
    alternatives: PropTypes.array, // alternative to loaded location values
    Header: PropTypes.object.isRequired,
    tiles: PropTypes.string,
    intl: PropTypes.object.isRequired,
    mode: PropTypes.string
  };

  static defaultProps = {
    cancel: false, // cancel link if different
    showToggler: false,
    enableGeocode: true,
    detailedInfo: false,
    settings: {},
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

    const initState = this.actions.initialize(props);

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
    log('onChange:', name, value);

    updated.location[name] = { $set: value };
    const newState = update(this.state, updated);

    this.setState(newState);
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
    const updated = update(this.state, {
      autoGeocode: { $set: false },
      location: {
        latitude: { $set: pos.latitude },
        longitude: { $set: pos.longitude },
      },
    });
    this.setState(updated);

    if (!enableGeocode) return;

    this.updateLocationReverseGeocode(pos.latitude, pos.longitude);
  }

  onAddressChange(name, value) {
    const { autoGeocode, enableGeocode } = this.state;
    if (!autoGeocode || !enableGeocode) {
      const updated = update(this.state, {
        showGeocodeLink: { $set: true },
        location: {
          address: {
            $set: value,
          },
        },
      });
      return this.setState(updated);
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
    const newState = update(this.state, updated);

    this.setState(newState);
  }

  getLabel(name, values) {
    const { settings, lang, intl } = this.props;
    let str;
    let k;

    // see if label is defined in agenda settings
    if (settings?.labels?.[name]) {
      const l = settings.labels[name];
      str = _.get(l, lang, l[_.first(_.keys(l))]);
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
    // use intl to format standard labels
    if (messages[name]) {
      if (!values) {
        str = intl.formatMessage(messages[name]);
        return str;
      }
      str = intl.formatMessage(messages[name], values);
      return str;
    }
    return null;
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

  set(_field, _value) { // , ...args
    log('set');
    let clean;
    const { settings, intl } = this.props;
    const { location } = this.state;

    // if stuff is given in args, we need to do a partial update only
    // const { data, partial } = this.getSetType([field, value].concat(args));
    const { data, partial } = this.getSetType(arguments);

    try {
      clean = validate(data, settings, partial);
    } catch (errors) {
      log('validation errors', errors);
      return this.actions.setError(errors);
    }

    if (partial || !this.isNew()) {
      clean.uid = location.uid;
    }

    this.actions.setStart(intl.formatMessage(messages.saving));

    this.post(partial, clean);
  }

  post(partial, clean) {
    const {
      getSetRes, postRes, onSuccess, intl
    } = this.props;
    log('post clean', clean);
    post(
      getSetRes ? getSetRes() : postRes,
      clean,
      (err, result) => {
        if (err) {
          log('error', err);
          return this.actions.setErrorResponse(intl.formatMessage(messages.loadingError));
        }

        if (!result.success) {
          return this.actions.setErrorResponse(intl.formatMessage(messages.loadingError));
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

  updateLocationGeocode(paramValue, setLoading) {
    let value = paramValue;
    const { res } = this.props;
    const { location: stateLocation } = this.state;
    log('updateLocationGeocode');
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
          log('noresult');
          updated.geocodeNoResults = { $set: true };
        }
        log('updated', updated);
        const newState = update(this.state, updated);
        this.setState(newState);
        log('state after geoUpdate', this.state);
      }
    );
  }

  fetchINSEE(location) {
    log('getting insee data for location %j', location);
    const { res } = this.props;

    get(
      res.insee,
      _.pick({
        ...location,
        city: location.adminLevel4,
        department: location.adminLevel2
      }, ['latitude', 'longitude', 'city', 'department']),
      (err, result) => {
        if (err) {
          return log('error', err);
        }

        log('retrieved insee: %j', result);
        this.setState(prevState => ({
          location: {
            ...prevState.location,
            insee: _.get(result, 'code')
          }
        }));
      }
    );
  }

  decorateLocation(gfResult, excludeCoordinates = false) {
    const { location } = this.state;
    const item = gfResult.results[0];

    const decoration = [
      'adminLevel1',
      'adminLevel2',
      'adminLevel3',
      'adminLevel4',
      'adminLevel5',
      'adminLevel6',
      'postalCode',
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
            {alternative.label ? <label htmlFor="alter-tag">{alternative.label} </label> : null}
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
            key={`image${i}`}
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
    const { lang, mode } = this.props;
    const { errors: stateErrors } = this.state;
    const errors = stateErrors.filter(e => (e.field !== 'longitude')); // for displaying, latitude is enough.

    return (
      <div className="errors">
        <label htmlFor="err-submit"><FormattedMessage {...messages[`${mode}SubmitError`]} />:</label>
        {errors.map((err, i) => {
          const values = {};

          for (const k in err.values) {
            if (Object.prototype.hasOwnProperty.call(err.values, k)) {
              values[`${k}`] = err.values[k];
            }
          }

          if (err.group) {
            return (
              <div key={`err${err.id}`}>
                <label htmlFor="required">{err.group[lang]}</label>:{' '}
                <span><FormattedMessage {...messages.required} /></span>
              </div>
            );
          }
          return (
            <div key={`err${err.id}`}>
              <label htmlFor="err-field">{this.getLabel(err.field) || err.field}</label>:
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
            this, // null
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
    const { location } = this.state;
    const imageCreditsDefault = settings?.defaultValues?.imageCredits || undefined;
    console.log('imageCreditsDefault', imageCreditsDefault, this.getLabel('imageInfo'));
    return (
      <div className="form-group">
        <div
          className={
            this.isFieldEnabled('image') ? 'form-group' : 'form-group disabled'
          }
        >
          <ImageInput
            locale={lang}
            info={this.getLabel('imageInfo')}
            label={this.getLabel('image') !== 'Image' ? this.getLabel('image') : null}
            input={{
              onChange: file => this.onChange('image', file),
              value: this.state?.location.image,
            }}
          />
        </div>

        <InputField
          name="imageCredits"
          enabled={this.isFieldEnabled('imageCredits')}
          value={location.imageCredits ? location.imageCredits : imageCreditsDefault}
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

  render() {
    const {
      Header, showToggler, lang, detailedInfo, cancel, enableGeocode: propsEnableGeocode, tiles, mode
    } = this.props;
    const {
      location, enableGeocode, pageSpin, geocodeError, autoGeocode, showExtIdInput, loadingError, errors, geocodeNoResults, geocodeEdit, geocodeEditValue
    } = this.state;
    log('rendering form with data %j', location);
    return (
      <div ref={r => (this['location-form'] = r)} className="location-form">
        {Header}

        {showToggler ? (
          <StateToggler
            locationState={location.state}
            onChange={state => this.setState({
              location: update(location, {
                state: { $set: state },
              }),
            })}
          />
        ) : null}

        <InputField
          name="name"
          enabled={this.isFieldEnabled('name')}
          value={location.name ? location.name : ''}
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

        <GeoBadges
          location={location}
          enableGeocode={enableGeocode}
          geocodeNoResults={geocodeNoResults}
          geocodeEdit={geocodeEdit}
          geocodeEditValue={geocodeEditValue}
          setGeocodeFieldValue={this.setGeocodeFieldValue.bind(this)}
          cancelEditGeocode={this.cancelEditGeocode.bind(this)}
          editGeocode={this.editGeocode.bind(this)}
        />

        {!enableGeocode ? (
          <div className="alert alert-warning" role="alert">
            <FormattedMessage {...messages.disabledGeocode} />
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
            tiles={tiles}
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
            <button
              type="button"
              className="btn btn-link"
              onClick={e => {
                e.preventDefault();
                this.actions.showExtId();
              }}
            >
              <FormattedMessage {...messages.extIdLink} />
            </button>
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
            <span className="text-danger"><FormattedMessage {...messages.cancel} /></span>
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
            <FormattedMessage {...messages[`${mode}Submit`]} />
          </button>
        </div>

        {pageSpin ? (
          <Spinner page message={pageSpin.message} />
        ) : null}
      </div>
    );
  }
}

export default injectIntl(LocationForm);
