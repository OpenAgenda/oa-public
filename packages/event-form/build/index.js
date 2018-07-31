"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _build = require('@openagenda/form-schemas/client/build');

var _build2 = _interopRequireDefault(_build);

var _Age = require('./components/Age');

var _Age2 = _interopRequireDefault(_Age);

var _Registration = require('./components/Registration');

var _Registration2 = _interopRequireDefault(_Registration);

var _Keywords = require('./components/Keywords');

var _Keywords2 = _interopRequireDefault(_Keywords);

var _Timings = require('./components/Timings');

var _Timings2 = _interopRequireDefault(_Timings);

var _Location = require('./components/Location');

var _Location2 = _interopRequireDefault(_Location);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var eventFormValidators = require('./validators');

var EventForm = function (_Component) {
  _inherits(EventForm, _Component);

  function EventForm() {
    _classCallCheck(this, EventForm);

    return _possibleConstructorReturn(this, (EventForm.__proto__ || Object.getPrototypeOf(EventForm)).apply(this, arguments));
  }

  _createClass(EventForm, [{
    key: 'render',
    value: function render() {

      var props = {
        lang: 'fr',
        components: {
          age: _Age2.default,
          registration: _Registration2.default,
          keywords: _Keywords2.default,
          timings: _Timings2.default,
          locationUid: _Location2.default
        },
        values: {
          locationUid: 93105902
        },
        schema: {
          custom: {
            age: eventFormValidators.age,
            registration: eventFormValidators.registration,
            keywords: eventFormValidators.keywords,
            timings: eventFormValidators.timings,
            locationUid: eventFormValidators.locationUid
          },
          fields: [{
            "field": "title",
            "fieldType": "text",
            "languages": ["fr", "en"],
            "optional": false,
            "label": {
              "fr": "Titre",
              "en": "Title"
            },
            "max": 140,
            "placeholder": {
              "fr": "Le titre de votre événement",
              "en": "Title of your event"
            },
            "sub": {
              "fr": "Ce champ est requis.",
              "en": "This field is required"
            }
          }, {
            "field": "description",
            "fieldType": "text",
            "languages": ["fr", "en"],
            "optional": false,
            "label": {
              "fr": "Description courte",
              "en": "Short description"
            },
            "placeholder": {
              "fr": "Une courte description de votre événement",
              "en": "A short description of your event"
            },
            "sub": {
              "fr": "Ce champ est requis.",
              "en": "This field is required"
            }
          }, {
            field: 'keywords',
            fieldType: 'keywords',
            languages: ['fr', 'en'],
            optional: true,
            max: 255,
            label: {
              fr: 'Mots clés',
              en: 'Keywords'
            },
            placeholder: {
              fr: 'Séparez les mots clés par des tabulation ou des virgules',
              en: 'Separate each keyword with tabs or commas'
            },
            "sub": {
              "fr": "Les mots clés sont utiles pour les fonctions de recherche",
              "en": "Keywords are useful for search features"
            }
          }, {
            "field": "longDescription",
            "fieldType": "markdown",
            "languages": ['fr', 'en'],
            "label": {
              "fr": "Description longue",
              "en": "Long description"
            },
            "sub": {
              "fr": "Ce champ ne doit pas exceder 10000 caractères",
              "en": "This field should not exceed 10000 characters"
            },
            "placeholder": {
              "fr": "Soignez la mise en forme",
              "en": "Make things pretty"
            }
          }, {
            "field": "conditions",
            "fieldType": "text",
            "label": {
              "fr": "Conditions de participation, tarifs",
              "en": "Attendence conditions, pricing"
            },
            "sub": {
              "fr": "Tel format est accepté",
              "en": "Some specific format is accepted"
            }
          }, {
            field: 'age',
            fieldType: 'age',
            optional: true,
            label: {
              fr: 'Age du public ciblé',
              en: 'Age of the targeted public'
            }
          }, {
            field: 'registration',
            fieldType: 'registration',
            optional: true,
            label: {
              fr: 'Outils d\'inscription',
              en: 'Registration'
            },
            placeholder: {
              fr: 'Séparez les items par des tabulation ou des virgules',
              en: 'Separate each item with tabs or commas'
            },
            sub: {
              fr: 'Liens, emails ou numéros de téléphone',
              en: 'Links, emails or phone numbers'
            }
          }, {
            field: 'locationUid',
            fieldType: 'locationUid',
            optional: false,
            label: {
              fr: 'Lieu',
              en: 'Location'
            },
            info: {
              fr: 'Saisissez le nom du lieu où se déroule l\'événement',
              en: 'Type in the name of the location where the event takes place'
            },
            sub: {
              fr: 'Si aucun lieu ne correspond à votre saisie, ajoutez-le en cliquant sur \'Créer un lieu\'',
              en: 'If no location matches the name, add a new location by clicking on \'Create a new location\''
            },
            res: {
              index: '/locations',
              geocode: '/locations/geocode',
              set: '/locations',
              remove: '/locations/remove'
            }
          }, {
            field: 'timings',
            fieldType: 'timings',
            optional: false,
            label: {
              fr: 'Horaires',
              en: 'Timings'
            },
            info: {
              fr: 'Définissez les horaires de votre événement',
              en: 'Specify timings for your event'
            }
          }]
        }
      };

      return _react2.default.createElement(_build2.default, props);
    }
  }]);

  return EventForm;
}(_react.Component);

exports.default = EventForm;
//# sourceMappingURL=index.js.map