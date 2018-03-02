"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _reverso = require('@openagenda/translators/reverso');

var _reverso2 = _interopRequireDefault(_reverso);

var _get = require('@openagenda/utils/get');

var _get2 = _interopRequireDefault(_get);

var _GroupTagSelector = require('@openagenda/react-form-components/build/GroupTagSelector');

var _GroupTagSelector2 = _interopRequireDefault(_GroupTagSelector);

var _ImageUploader = require('@openagenda/image-upload/components/build/ImageUploader');

var _ImageUploader2 = _interopRequireDefault(_ImageUploader);

var _InputField = require('@openagenda/react-form-components/build/InputField');

var _InputField2 = _interopRequireDefault(_InputField);

var _Translation = require('@openagenda/react-form-components/build/Translation');

var _Translation2 = _interopRequireDefault(_Translation);

var _LanguageBar = require('@openagenda/react-form-components/build/LanguageBar');

var _LanguageBar2 = _interopRequireDefault(_LanguageBar);

var _form = require('@openagenda/labels/agenda-locations/form');

var _form2 = _interopRequireDefault(_form);

var _errors = require('@openagenda/labels/errors');

var _errors2 = _interopRequireDefault(_errors);

var _translation = require('@openagenda/labels/event/translation');

var _translation2 = _interopRequireDefault(_translation);

var _MultiInputField = require('@openagenda/react-form-components/build/MultiInputField');

var _MultiInputField2 = _interopRequireDefault(_MultiInputField);

var _MultilingualInputField = require('@openagenda/react-form-components/build/MultilingualInputField');

var _MultilingualInputField2 = _interopRequireDefault(_MultilingualInputField);

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _base = require('@openagenda/utils/base64');

var _base2 = _interopRequireDefault(_base);

var _post2 = require('@openagenda/utils/post');

var _post3 = _interopRequireDefault(_post2);

var _flatten = require('@openagenda/labels/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _formActions = require('./formActions');

var _formActions2 = _interopRequireDefault(_formActions);

var _validate = require('../../lib/validate');

var _validate2 = _interopRequireDefault(_validate);

var _CountryField = require('./CountryField');

var _CountryField2 = _interopRequireDefault(_CountryField);

var _LocationMap = require('./LocationMap');

var _LocationMap2 = _interopRequireDefault(_LocationMap);

var _StateToggler = require('./StateToggler');

var _StateToggler2 = _interopRequireDefault(_StateToggler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = {
  extend: require('lodash/extend'),
  get: require('lodash/get')
};

var alternativeMaxLength = 50;

var labels = _utils2.default.extend({}, _form2.default, _errors2.default);

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {

    lang: _propTypes2.default.string,

    // server endpoints for set, merge and geocode
    res: _propTypes2.default.object,

    // show verified toggler
    showToggler: _propTypes2.default.bool,

    // if set, we are editing a location
    location: _propTypes2.default.object,

    // optional settings of agenda ( such as tags requirements )
    settings: _propTypes2.default.object,

    // toggle display of location detailed info fields ( description, website, phone... )
    detailedInfo: _propTypes2.default.bool,

    // takes location and update mode ( true if is )
    onSuccess: _propTypes2.default.func,

    // overloading labels
    labels: _propTypes2.default.object,

    // alternative to loaded location values
    alternatives: _propTypes2.default.array,

    // hide alternative when loaded in current values
    hideCurrentAlternative: _propTypes2.default.bool,

    disableAutoTranslation: _propTypes2.default.bool

  },

  getDefaultProps: function getDefaultProps() {

    return {
      cancel: false, // cancel link if different
      showToggler: false,
      detailedInfo: false,
      settings: {},
      labels: {},
      alternatives: [],
      hideCurrentAlternative: false,
      disableAutoTranslation: false,
      disableNoAlternatives: false,
      displayLanguageTabs: true
    };
  },
  getInitialState: function getInitialState() {
    var _this = this;

    this.actions = (0, _formActions2.default)({
      getState: function getState() {
        return _this.state;
      },
      setState: function setState(newState) {
        _this.setState(newState);
      }
    });

    var initialState = this.actions.initialize(this.props);

    if (this.useTranslator()) {

      this.translator = (0, _reverso2.default)(JSON.parse(_base2.default.decode(this.props.settings.translation.options)));
    }

    return initialState;
  },
  getLanguages: function getLanguages() {

    var languages = Object.keys(this.getMultilingual('description'));

    if (!languages.length) languages.push(this.props.lang);

    return languages;
  },
  componentWillMount: function componentWillMount() {

    this.setState({
      originScrollPosition: (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0)
    });
  },
  componentDidMount: function componentDidMount() {
    var _this2 = this;

    this.setState({
      originScrollPosition: (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0)
    }, function () {

      window.scrollTo(0, _this2.formPos());
    });
  },
  formPos: function formPos(obj) {

    var obj = this['location-form'];

    var o = 0;

    if (obj.offsetParent) {

      do {
        o += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }

    return o;
  },
  componentWillUnmount: function componentWillUnmount() {

    var scrollTo = this.state.originScrollPosition;

    setTimeout(function () {

      window.scrollTo(0, scrollTo);
    }, 100);
  },
  isNew: function isNew() {

    return !(this.props.location && this.props.location.uid);
  },
  getMultilingual: function getMultilingual(field) {

    var data = this.state.location[field];

    var defaultData = {};

    defaultData[this.props.lang] = '';

    if (data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) == 'object') {

      return data;
    } else if (typeof data == 'string') {

      defaultData[this.props.lang] = data;

      return defaultData;
    }

    return data || defaultData;
  },
  getLabel: function getLabel(name, values) {

    var str, k;

    // see if label is defined in agenda settings
    if (this.props.settings && this.props.settings.labels && this.props.settings.labels[name]) {

      str = this.props.settings.labels[name][this.props.lang];
    } else if (this.props.labels[name] || labels[name]) {

      str = (this.props.labels[name] || labels[name])[this.props.lang];
    }

    if (!str) {

      return null;
    }

    if (values) {

      for (k in values) {

        str = str.replace('%' + k + '%', values[k]);
      }
    }

    return str;
  },
  updateLocationReverseGeocode: function updateLocationReverseGeocode(latitude, longitude) {
    var _this3 = this;

    this.setState({
      geocodeLoading: true
    });

    log('reverse geocode from latitude %s and longitude %s', latitude, longitude);

    (0, _get2.default)(this.props.res.reverseGeocode, {
      latitude: latitude,
      longitude: longitude
    }, function (err, result) {

      if (err) {

        return log('error', err);
      }

      var updated = {
        geocodeLoading: { $set: false },
        geocodeError: { $set: false }
      };

      updated.location = _this3.decorateLocation(result, true);

      _this3.setState((0, _immutabilityHelper2.default)(_this3.state, updated));
    });
  },
  updateLocationGeocode: function updateLocationGeocode(value, setLoading) {
    var _this4 = this;

    if (setLoading) {

      this.setState({
        geocodeLoading: true
      });
    }

    if (value === undefined) {

      value = this.state.location.address;
    }

    log('getting geocode data for address %s in country %s', value, this.state.location.countryCode);

    (0, _get2.default)(this.props.res.geocode, {
      address: value,
      countryCode: this.state.location.countryCode
    }, function (err, result) {

      var updated = {
        geocodeLoading: { $set: false },
        geocodeError: { $set: false }
      };

      if (err) {

        log('error', err);

        _utils2.default.extend(updated, {
          geocodeError: { $set: true },
          location: {
            latitude: { $set: _this4.state.location.latitude || 0 },
            longitude: { $set: _this4.state.location.longitude || 0 }
          }
        });
      } else if (result.results.length) {

        updated.location = _this4.decorateLocation(result);

        updated.autoGeocode = { $set: true };

        updated.showGeocodeLink = { $set: false };
      }

      _this4.setState((0, _immutabilityHelper2.default)(_this4.state, updated));
    });
  },
  decorateLocation: function decorateLocation(gfResult) {
    var excludeCoordinates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


    var item = gfResult.results[0];

    var decoration = ['city', 'district', 'department', 'postalCode', 'region', 'timezone'].reduce(function (d, field) {

      d[field] = { $set: item[field] };

      return d;
    }, {});

    if (!excludeCoordinates) {

      decoration.latitude = { $set: item.latitude };
      decoration.longitude = { $set: item.longitude };
    }

    if (item.countryCode && item.countryCode !== this.state.location.countryCode) {

      decoration.countryCode = { $set: item.countryCode };
    }

    return decoration;
  },
  onChange: function onChange(name, value) {

    var updated = { location: {} };

    updated.location[name] = { $set: value };

    this.setState((0, _immutabilityHelper2.default)(this.state, updated));
  },
  onLanguagesChange: function onLanguagesChange(newLanguages) {

    var self = this,
        currentLanguages = this.getLanguages(),


    // description field serves as ref for language state
    // this should change but as long as its the only multi-l
    // field, this is how it is
    description = JSON.parse(JSON.stringify(this.getMultilingual('description')));

    currentLanguages.forEach(function (l) {

      if (newLanguages.indexOf(l) == -1) {

        delete description[l];
      }
    });

    newLanguages.forEach(function (l) {

      if (currentLanguages.indexOf(l) == -1) {

        description[l] = '';
      }
    });

    this.setState({
      location: (0, _immutabilityHelper2.default)(this.state.location, {
        description: {
          $set: description
        }
      })
    });
  },
  onMarkerDragged: function onMarkerDragged(pos) {

    this.setState((0, _immutabilityHelper2.default)(this.state, {
      autoGeocode: { $set: false },
      location: {
        latitude: { $set: pos.latitude },
        longitude: { $set: pos.longitude }
      }
    }));

    this.updateLocationReverseGeocode(pos.latitude, pos.longitude);
  },


  /**
   * this bit needs to get latitude & longitude based on address
   */
  onAddressChange: function onAddressChange(name, value) {
    var _this5 = this;

    if (!this.state.autoGeocode) {

      return this.setState((0, _immutabilityHelper2.default)(this.state, {
        showGeocodeLink: { $set: true },
        location: {
          address: {
            $set: value
          }
        }
      }));
    } else {

      // auto-geocode is on; we wait for the user to stop typing away
      // for a short while and we launch the request

      if (this.bufferTimeout) {

        clearTimeout(this.bufferTimeout);
      }

      this.setState((0, _immutabilityHelper2.default)(this.state, {
        geocodeLoading: { $set: true },
        location: {
          address: {
            $set: value
          }
        }
      }));

      this.bufferTimeout = setTimeout(function () {

        _this5.updateLocationGeocode(value);
      }, 2000);
    }
  },


  /**
   * send location data to server for creation or update
   *
   * if arguments are set, partial update is done
   */
  set: function set(field, value) {
    var _this6 = this;

    var errors = false,
        clean = void 0;

    // if stuff is given in args, we need to do a partial update only

    var _getSetType = this.getSetType(arguments),
        data = _getSetType.data,
        partial = _getSetType.partial;

    // if translation is set and set is full or multilingual field is to be set,

    // clean the location before sending.
    // no use sending if unclean; just smear it back
    // in users face.


    this.translate(data, partial, function (err, translationError, translatedData) {

      if (err) {

        console.log('translation failed: %s', err);

        translatedData = data;
      }

      try {

        clean = (0, _validate2.default)(translatedData, _this6.props.settings, partial);
      } catch (e) {

        errors = e;
      }

      if (errors) {

        return _this6.actions.setError(errors);
      }

      if (partial || !_this6.isNew()) {

        clean.uid = _this6.state.location.uid;
      }

      _this6.actions.setStart(translationError ? _translation2.default.savingPartialTranslation[_this6.props.lang] : _this6.getLabel('saving'));

      setTimeout(function () {
        _this6.post(partial, clean);
      }, translationError ? 2000 : 0);
    });
  },
  post: function post(partial, clean) {
    var _this7 = this;

    (0, _post3.default)(this.props.getSetRes ? this.props.getSetRes() : this.props.res.set, clean, function (err, result) {

      if (err) {

        log('error', err);

        return _this7.actions.setErrorResponse(_this7.getLabel('loadingError'));
      }

      if (!result.success) {

        return _this7.actions.setErrorResponse(_this7.getLabel('loadingError'));
      }

      _this7.actions.setSuccess(result.location);

      if (result.success) {

        _this7.props.onSuccess(result.location, !partial);
      }
    });
  },
  getSetType: function getSetType(args) {

    var data = {},
        partial = void 0,
        field = args[0],
        value = args[1];

    if (args.length == 2) {

      data[field] = value;

      partial = true;
    } else {

      data = this.state.location;

      partial = false;
    }

    return { data: data, partial: partial };
  },
  translate: function translate(data, partial, cb) {
    var _this8 = this;

    var translatableData = {};

    if (!this.useTranslator()) {

      return cb(null, false, data);
    }

    // assemble data to translate
    ['description', 'access'].filter(function (f) {
      return data[f] && data[f][_this8.state.translation.source] && data[f][_this8.state.translation.source].length;
    }).forEach(function (f) {

      translatableData[f] = data[f][_this8.state.translation.source];
    });

    if (!Object.keys(translatableData).length) {

      return cb(null, false, data);
    }

    this.actions.startPageSpin(_translation2.default.processingTranslation[this.props.lang]);

    var set = this.state.translation.sets.filter(function (s) {
      return s.source === _this8.state.translation.source;
    })[0];

    this.translator(translatableData, this.state.translation.source, set.checked, function (err, translatedData, translateErrors) {

      _this8.actions.stopPageSpin();

      if (err) return cb(err);

      Object.keys(translatedData).forEach(function (field) {

        Object.keys(translatedData[field]).forEach(function (l) {

          data[field][l] = translatedData[field][l];
        });
      });

      cb(null, !!translateErrors, data);
    });
  },
  renderErrors: function renderErrors() {
    var _this9 = this;

    var errors = this.state.errors.filter(function (e) {

      return e.field !== 'longitude'; // for displaying, latitude is enough.
    });

    return _react2.default.createElement(
      'div',
      { className: 'errors' },
      _react2.default.createElement(
        'label',
        null,
        this.getLabel('submitError'),
        ':'
      ),
      errors.map(function (err, i) {

        var values = {};

        for (var k in err.values) {

          values['%' + k + '%'] = err.values[k];
        }

        if (err.group) {

          return _react2.default.createElement(
            'div',
            { key: 'err' + i },
            _react2.default.createElement(
              'label',
              null,
              err.group
            ),
            ': ',
            _react2.default.createElement(
              'span',
              null,
              _this9.getLabel('required')
            )
          );
        } else {

          return _react2.default.createElement(
            'div',
            { key: 'err' + i },
            _react2.default.createElement(
              'label',
              null,
              _this9.getLabel(err.field) || err.field
            ),
            ':',
            _react2.default.createElement(
              'span',
              null,
              _this9.getLabel(err.code, values)
            )
          );
        }
      })
    );
  },
  renderGeocodeButton: function renderGeocodeButton() {

    return _react2.default.createElement(
      'span',
      { className: 'input-group-btn geocode' },
      _react2.default.createElement(
        'button',
        {
          className: 'btn btn-default',
          type: 'button',
          onClick: this.updateLocationGeocode.bind(null, this.state.location.address, true)
        },
        this.state.geocodeLoading ? _react2.default.createElement(
          'i',
          { style: { padding: '0.2em 0.65em' } },
          _react2.default.createElement(_Spinner2.default, {
            loading: this.state.geocodeLoading,
            options: {
              width: 1,
              length: 3,
              radius: 4,
              color: '#666'
            }
          })
        ) : _react2.default.createElement('i', { className: 'fa fa-search' })
      )
    );
  },
  renderDetailedInfo: function renderDetailedInfo() {
    var _this10 = this;

    var uploadRes,
        removeRes,
        value = this.state.location.image || null;

    if (this.isNew()) {

      uploadRes = this.props.res.image.newUpload;

      removeRes = this.props.res.image.newRemove;
    } else {

      uploadRes = this.props.res.image.upload.replace(':locationUid', this.state.location.uid);

      removeRes = this.props.res.image.remove.replace(':locationUid', this.state.location.uid);
    }

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        { className: 'form-group' },
        _react2.default.createElement(_ImageUploader2.default, {
          value: value,
          upload: uploadRes,
          remove: removeRes,
          info: this.getLabel('imageInfo'),
          lang: this.props.lang,
          handleUpdate: function handleUpdate(name) {

            _this10.setState((0, _immutabilityHelper2.default)(_this10.state, {
              location: {
                image: { $set: name }
              }
            }));
          } })
      ),
      _react2.default.createElement(_InputField2.default, {
        name: 'imageCredits',
        value: this.state.location.imageCredits,
        getLabel: this.getLabel,
        lang: this.props.lang,
        info: 'imageCreditsInfo',
        placeholder: 'imageCreditsPlaceholder',
        onChange: this.onChange,
        validator: _validate2.default.field('imageCredits') }),
      _react2.default.createElement(
        'div',
        { className: 'multilingual-group' },
        this.props.displayLanguageTabs ? _react2.default.createElement(_LanguageBar2.default, {
          languages: this.getLanguages(),
          getLabel: this.getLabel,
          onChange: this.onLanguagesChange }) : null,
        _react2.default.createElement(_MultilingualInputField2.default, {
          name: 'description',
          value: this.getMultilingual('description'),
          languages: this.getLanguages(),
          getLabel: this.getLabel,
          onChange: this.onChange,
          placeholder: this.getLabel('descriptionPlaceholder'),
          info: this.getLabel('descriptionInfo'),
          type: 'textarea' }),
        _react2.default.createElement(_MultilingualInputField2.default, {
          name: 'access',
          value: this.getMultilingual('access'),
          languages: this.getLanguages(),
          getLabel: this.getLabel,
          onChange: this.onChange,
          placeholder: this.getLabel('accessPlaceholder'),
          info: this.getLabel('accessInfo'),
          type: 'text' })
      ),
      _react2.default.createElement(_InputField2.default, {
        name: 'phone',
        value: this.state.location.phone,
        getLabel: this.getLabel,
        lang: this.props.lang,
        onChange: this.onChange,
        info: 'phoneInfo',
        placeholder: 'phonePlaceholder',
        validator: _validate2.default.field('phone') }),
      _react2.default.createElement(_InputField2.default, {
        name: 'website',
        value: this.state.location.website,
        getLabel: this.getLabel,
        lang: this.props.lang,
        info: 'websiteInfo',
        placeholder: 'websitePlaceholder',
        onChange: this.onChange,
        validator: _validate2.default.field('website') }),
      _react2.default.createElement(_MultiInputField2.default, {
        name: 'links',
        info: this.getLabel('linksInfo'),
        placeholder: this.getLabel('linksPlaceholder'),
        value: this.state.location.links,
        getLabel: this.getLabel,
        lang: this.props.lang,
        onChange: this.onChange,
        validator: _validate2.default.field('links') }),
      Object.keys(this.props.settings).length && this.props.settings.tagSet ? _react2.default.createElement(_GroupTagSelector2.default, {
        lang: this.props.lang,
        name: 'tags',
        set: this.props.settings.tagSet,
        onChange: this.onChange,
        value: this.state.location.tags || [] }) : null
    );
  },
  useTranslator: function useTranslator() {

    return this.props.detailedInfo && this.props.settings.translation && this.props.settings.translation.enabled && !this.props.disableAutoTranslation;
  },
  onCancel: function onCancel(e) {

    e.preventDefault();

    this.props.onCancel(this.state.location);
  },
  render: function render() {
    var _this11 = this;

    return _react2.default.createElement(
      'div',
      { ref: function ref(r) {
          return _this11['location-form'] = r;
        }, className: 'location-form' },
      this.props.Header ? this.props.Header : null,
      this.props.showToggler ? _react2.default.createElement(_StateToggler2.default, {
        locationState: this.state.location.state,
        set: this.set,
        getLabel: this.getLabel }) : null,
      _react2.default.createElement(_InputField2.default, {
        name: 'name',
        enabled: true,
        value: this.state.location.name,
        info: 'nameInfo',
        placeholder: 'namePlaceholder',
        getLabel: this.getLabel,
        lang: this.props.lang,
        onChange: this.onChange,
        validator: _validate2.default.field('name') }),
      _react2.default.createElement(_CountryField2.default, {
        enabled: true,
        value: this.state.location.countryCode,
        lang: this.props.lang,
        onChange: this.onChange,
        getLabel: this.getLabel }),
      _react2.default.createElement(_InputField2.default, {
        name: 'address',
        enabled: true,
        value: this.state.location.address,
        info: 'addressInfo',
        placeholder: 'addressPlaceholder',
        onChange: this.onAddressChange,
        validator: _validate2.default.field('address'),
        lang: this.props.lang,
        getLabel: this.getLabel,
        className: 'input-group',
        errors: this.state.geocodeError ? [{ code: 'geocodeError' }] : false,
        renderButton: this.renderGeocodeButton,
        autoFocus: !!this.state.location.name }),
      _react2.default.createElement(
        'div',
        { className: 'form-group' },
        _react2.default.createElement(_LocationMap2.default, {
          enabled: true,
          resetZoom: this.state.autoGeocode,
          location: this.state.location,
          draggableMarker: true,
          onMarkerDragged: this.onMarkerDragged,
          draggable: true })
      ),
      this.props.detailedInfo ? this.renderDetailedInfo() : '',
      this.useTranslator() ? _react2.default.createElement(_Translation2.default, {
        source: this.state.translation.source,
        sets: this.state.translation.sets,
        check: this.actions.checkLanguage.bind(null, true),
        uncheck: this.actions.checkLanguage.bind(null, false),
        sourceChange: this.actions.sourceLanguageChange.bind(null),
        labels: (0, _flatten2.default)(_.extend(_translation2.default, {
          info: _.get(this.props, 'settings.labels.translationInfo', _translation2.default.translationInfo)
        }), this.props.lang)
      }) : null,
      this.state.loadingError ? _react2.default.createElement(
        'div',
        { className: 'error' },
        this.state.loadingError
      ) : '',
      this.state.errors ? this.renderErrors() : '',
      _react2.default.createElement(
        'div',
        { className: 'form-group bottom' },
        this.props.cancel || _react2.default.createElement(
          'a',
          {
            href: '#',
            onClick: this.onCancel },
          this.getLabel('cancel')
        ),
        _react2.default.createElement(
          'button',
          {
            className: 'btn btn-primary',
            onClick: function onClick(e) {
              e.preventDefault();
              _this11.set();
            } },
          this.getLabel('submit')
        )
      ),
      this.state.pageSpin ? _react2.default.createElement(_Spinner2.default, { page: true, message: this.state.pageSpin.message }) : null
    );
  }
});

function log() {

  if (!console.log.apply) return;

  console.log.apply(console, arguments);
}
//# sourceMappingURL=LocationForm.js.map