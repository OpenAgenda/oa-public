'use strict';

const _ = require('lodash');
const getFormSchemaAdditionalFields = require('../../../utils/getFormSchemaAdditionalFields');

module.exports = (cleanQuery, formSchema, additionalMustParts = []) => {
  const query = {};
  const additionalFields = getFormSchemaAdditionalFields(formSchema);

  const mustParts = _getQueryMustParts(cleanQuery, additionalFields).concat(additionalMustParts);

  const filterParts = _getQueryFilterParts(cleanQuery, additionalFields);

  if (mustParts.length === 1 && !filterParts.length) {

    _.extend(query, mustParts[0]);

  } else if (mustParts.length > 1 || (filterParts.length && mustParts.length)) {
    _.set(query, 'bool.must', mustParts);
  }


  if (filterParts.length) {
    _.set(query, 'bool.filter', filterParts);
  }

  return query;
}


function _getQueryFilterParts(cleanQuery, additionalFields) {
  const parts = [];

  if (_.get(cleanQuery, 'set')) {
    parts.push(_mustPart('term', '_set', cleanQuery.set));
  }

  if (_.get( cleanQuery, 'localTime.gte') || _.get(cleanQuery, 'localTime.lte')) {
    parts.push(_localTime(cleanQuery.localTime));
  }

  if (_.get(cleanQuery, 'date.gte') || _.get(cleanQuery, 'date.lte')) {
    parts.push(_dateExcludingOngoing(cleanQuery.date));
  }

  if (![undefined, null].includes(cleanQuery.state)) {
    parts.push(_mustPart('term', 'state', cleanQuery.state));
  }

  if (cleanQuery.uid && cleanQuery.uid.length > 1) {
    parts.push(_mustPart('terms', 'uid', cleanQuery.uid));
  } else if (cleanQuery.uid && cleanQuery.uid.length) {
    parts.push(_mustPart('term', 'uid', cleanQuery.uid[0]));
  }

  if (cleanQuery.slug && cleanQuery.slug.length > 1) {
    parts.push(_mustPart('terms', 'slug', cleanQuery.slug));
  } else if (cleanQuery.slug && cleanQuery.slug.length) {
    parts.push(_mustPart('term', 'slug', cleanQuery.slug[0]));
  }

  additionalFields.forEach(field => {
    if (cleanQuery[field.field] && ['email'].includes(field.fieldType)) {
      parts.push(_mustPart('term', '_search_additional_keywords', cleanQuery[field.field]));
    }
  });

  return parts;
}


function _getQueryMustParts(cleanQuery, additionalFields) {
  const parts = [];

  // term constraints

  [
    ['keyword', '_search_keywords', true],
    ['lang', '_search_languages', true],
    ['locationUid', 'location.uid'],
    ['city', 'location.city'],
    ['region', 'location.region'],
    ['department', 'location.department'],
    ['countryCode', 'location.countryCode'],
    ['memberUid', 'member.uid'],
    ['agendaUid', 'originAgenda.uid']
  ].forEach(field => {
    const fromField = _.isArray(field) ? field[0] : field;
    const toField = _.isArray(field) ? field[1] : field;
    const and = _.isArray(field) ? field[2] : false;

    if ( _.get(cleanQuery, fromField, [] ).length > 1 && !and) {
      parts.push(_mustPart('terms', toField, cleanQuery[ fromField ]));
    } else {
      _.get( cleanQuery, fromField, [] )
        .map(_mustPart.bind(null, 'term', toField) )
        .forEach( p => parts.push( p ) );
    }
  });

  // add bounds constraints
  if (
    _.get(cleanQuery, 'geo.northEast.lat')
    && _.get(cleanQuery, 'geo.northEast.lng')
    && _.get(cleanQuery, 'geo.southWest.lat')
    && _.get(cleanQuery, 'geo.southWest.lng')
  ) {
    parts.push(_geoBounds(cleanQuery.geo));
  }

  // add multi_match search part
  if (cleanQuery.search) {
    parts.push({
      multi_match: {
        query: cleanQuery.search,
        fields: [
          '_search_title',
          '_search_description',
          '_search_keywords_text',
          '_search_full_address_text',
        ]
      }
    });
  }

  return parts;
}


function _dateExcludingOngoing( d ) {

  let range = {};

  if ( d.gte ) range.gte = d.gte;

  if ( d.lte ) range.lte = d.lte;


  return {
    nested: {
      path: 'timings',
      score_mode: 'min',
      query: {
        range: {
          'timings.begin' : range
        }
      }
    }
  }

}


function _localTime( t ) {

  let range = {};

  if ( t.gte ) range.gte = t.gte;

  if ( t.lte ) range.lte = t.lte;

  return {
    nested: {
      path: 'timings',
      score_mode: 'min',
      query: { range: {
        'timings._search_begin_from_midnight' : range
      } }
    }
  };

}

function _geoBounds( b ) {

  return {
    geo_bounding_box: {
      _search_location: {
        top_left: { lat: b.northEast.lat, lon: b.southWest.lng },
        bottom_right: { lat: b.southWest.lat, lon: b.northEast.lng }
      }
    }
  }

}

function _mustPart( queryType, fieldName, value ) {

  let q = {};

  q[ queryType ] = {};

  q[ queryType ][ fieldName ] = value;

  return q;

}
