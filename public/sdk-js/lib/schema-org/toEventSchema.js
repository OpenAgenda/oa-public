"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toEventSchema;
require("core-js/modules/es.symbol.description.js");
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _at = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/at"));
var _intl = require("@openagenda/intl");
function getEventAttendanceMode(attendanceMode) {
  var _$2$, _attendanceMode$id;
  return (_$2$ = {
    1: 'OfflineEventAttendanceMode',
    2: 'OnlineEventAttendanceMode',
    3: 'MixedEventAttendanceMode'
  }[(_attendanceMode$id = attendanceMode === null || attendanceMode === void 0 ? void 0 : attendanceMode.id) !== null && _attendanceMode$id !== void 0 ? _attendanceMode$id : attendanceMode]) !== null && _$2$ !== void 0 ? _$2$ : 'OfflineEventAttendanceMode';
}
function getEventStatus(status) {
  var _$2$3$4$5$, _status$id;
  return (_$2$3$4$5$ = {
    1: 'EventScheduled',
    2: 'EventRescheduled',
    3: 'EventMovedOnline',
    4: 'EventPostponed',
    5: 'EventScheduled',
    // but full.
    6: 'EventCancelled'
  }[(_status$id = status === null || status === void 0 ? void 0 : status.id) !== null && _status$id !== void 0 ? _status$id : status]) !== null && _$2$3$4$5$ !== void 0 ? _$2$3$4$5$ : 'EventScheduled';
}
function imageToUrl(image, type) {
  var _image$variants$find, _image$variants;
  if (!image) return;
  const variant = typeof type === 'string' ? (_image$variants$find = (_image$variants = image.variants) === null || _image$variants === void 0 ? void 0 : _image$variants.find(img => img.type === type)) !== null && _image$variants$find !== void 0 ? _image$variants$find : image : image;
  return "".concat(image.base).concat(variant.filename);
}
function toEventSchema(event, _ref) {
  var _event$location, _event$registration, _event$age, _event$age2;
  let {
    url,
    locale,
    defaultLocale = _intl.DEFAULT_LANG,
    formatDate
  } = _ref;
  const {
    timings
  } = event;
  const {
    begin
  } = timings[0];
  const {
    end
  } = (0, _at.default)(timings).call(timings, -1);
  const timezone = event.timezone || ((_event$location = event.location) === null || _event$location === void 0 ? void 0 : _event$location.timezone);
  const eventSchema = (0, _objectSpread2.default)({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: (0, _intl.getLocaleValue)(event.title, locale, defaultLocale),
    description: (0, _intl.getLocaleValue)(event.description, locale, defaultLocale),
    startDate: formatDate(begin, timezone),
    endDate: formatDate(end, timezone),
    eventAttendanceMode: "https://schema.org/".concat(getEventAttendanceMode(event.attendanceMode)),
    eventStatus: "https://schema.org/".concat(getEventStatus(event.status))
  }, (_event$registration = event.registration) !== null && _event$registration !== void 0 && _event$registration.some(r => r.type === 'link') ? {
    offers: {
      '@type': 'Offer',
      url: event.registration.find(r => r.type === 'link').value,
      availability: "https://schema.org/".concat(event.status === 5 ? 'SoldOut' : 'InStock')
    }
  } : {});
  if (url) {
    eventSchema['@id'] = url;
    eventSchema.url = url;
  }
  if (event.image) {
    eventSchema.image = imageToUrl(event.image);
  }
  if (event.location) {
    eventSchema.location = {
      '@type': 'Place',
      name: event.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressLocality: event.location.city,
        addressRegion: event.location.region,
        postalCode: event.location.postalCode,
        addressCountry: event.location.countryCode
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.location.latitude,
        longitude: event.location.longitude
      }
    };
  }
  if ((_event$age = event.age) !== null && _event$age !== void 0 && _event$age.min || (_event$age2 = event.age) !== null && _event$age2 !== void 0 && _event$age2.max) {
    eventSchema.typicalAgeRange = "".concat(event.age.min || '', "-").concat(event.age.max || '');
  }
  return eventSchema;
}
module.exports = exports.default;
//# sourceMappingURL=toEventSchema.js.map