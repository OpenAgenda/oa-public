'use strict';

const _ = require('lodash');
const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');

const termsFiltersMap = {
  memberUid: 'member.uid',
  originAgendaUid: 'originAgenda.uid',
  city: 'location.city',
  department: 'location.department',
  region: 'location.region',
  countryCode: 'location.countryCode',
  locationUid: 'location.uid',
  uid: 'uid',
  slug: 'slug',
}

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

function _terms(fieldName, value) {
  const values = [].concat(value);
  return {
    [values.length > 1 ? 'terms' : 'term']: {
      [fieldName]: values.length > 1 ? values : values[0]
    }
  };
}

function _getQueryFilterParts(cleanQuery, additionalFields) {

  const parts = [];

  if (_.get(cleanQuery, 'set')) {
    parts.push({ term: { _set:  cleanQuery.set } });
  }

  if (_.get( cleanQuery, 'localTime.gte') || _.get(cleanQuery, 'localTime.lte')) {
    parts.push(_localTime(cleanQuery.localTime));
  }

  if (_.get(cleanQuery, 'date.gte') || _.get(cleanQuery, 'date.lte')) {
    parts.push(_dateExcludingOngoing(cleanQuery.date));
  }

  Object.keys(termsFiltersMap)
    .filter(key => cleanQuery[key] && cleanQuery[key].length)
    .forEach(key => {
      parts.push(_terms(termsFiltersMap[key], cleanQuery[key]));
    });

  if (![undefined, null].includes(cleanQuery.state)) {
    parts.push(_mustPart('term', 'state', cleanQuery.state));
  }

  additionalFields.forEach(field => {
    if (!cleanQuery[field.field]) return;

    if (['email'].includes(field.fieldType)) {
      parts.push(_mustPart(
        'term',
        '_search_additional_keywords',
        cleanQuery[field.field]
      ));
    } else if (['radio', 'checkbox'].includes(field.fieldType)) {
      parts.push(_mustPart(
        'term',
        '_search_additional_keywords',
        [field.schemaId, cleanQuery[field.field]].join('.')
      ));
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

function _mustPart(queryType, fieldName, value) {
  return { [queryType]: {
    [fieldName]: value
  } };
}
