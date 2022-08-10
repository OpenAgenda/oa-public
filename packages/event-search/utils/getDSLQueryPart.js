'use strict';

const clean = require('@openagenda/validators/schema/clean');
const _ = require('lodash');
const getFormSchemaAdditionalFields = require('./getFormSchemaAdditionalFields');
const keywordizeDiscreteValue = require('./keywordizeDiscreteValue');

const termsFiltersMap = {
  memberUid: 'member.uid',
  originAgendaUid: 'originAgenda.uid',
  city: 'location.city',
  district: 'location.district',
  department: 'location.department',
  region: 'location.region',
  adminLevel3: 'location.adminLevel3',
  adminLevel5: 'location.adminLevel5',
  countryCode: 'location.countryCode',
  locationUid: 'location.uid',
  uid: 'uid',
  slug: 'slug',
  ownerUid: 'ownerUid'
};

function hasExplicitEmptyValue(queryValue, emptyValue) {
  if (!queryValue) return false;

  return [].concat(queryValue).includes(emptyValue);
}

module.exports = (cleanQuery, options = {}) => {
  const {
    formSchema,
    emptyValue
  } = options;

  const query = {};
  const additionalFields = getFormSchemaAdditionalFields(formSchema);

  const mustParts = _getQueryMustParts(cleanQuery, additionalFields);

  const filterParts = _getQueryFilterParts(cleanQuery, { additionalFields, emptyValue });

  if (mustParts.length === 1 && !filterParts.length) {
    _.extend(query, mustParts[0]);
  } else if (mustParts.length > 1 || (filterParts.length && mustParts.length)) {
    _.set(query, 'bool.must', mustParts);
  }

  if (filterParts.length) {
    _.set(query, 'bool.filter', filterParts);
  }

  if (cleanQuery.relative.filter(r => ['passed', 'upcoming'].includes(r)).length === 2) {
    _.set(query, 'bool.must_not', {
      bool: {
        filter: [{
          range: {
            _search_first_timing: { lte: 'now' }
          }
        }, {
          range: {
            _search_last_timing: { gte: 'now' }
          }
        }]
      }
    });
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

function _getQueryFilterParts(cleanQuery, { additionalFields, emptyValue }) {
  const parts = [];
  const {
    relative,
    addMethod
  } = cleanQuery;

  if (_.get(cleanQuery, 'set')) {
    parts.push({ term: { _set:  cleanQuery.set } });
  }

  if (_.get(cleanQuery, 'localTime.gte') || _.get(cleanQuery, 'localTime.lte')) {
    parts.push(_localTime(cleanQuery.localTime));
  }

  if (_.get(cleanQuery, 'timings.gte') || _.get(cleanQuery, 'timings.lte')) {
    parts.push(_timingsExcludingOngoing(cleanQuery.timings));
  }

  if (relative.includes('passed') && relative.includes('upcoming') && relative.includes('current')) {
    // not a filter.
  } else if (relative.includes('passed') && relative.includes('upcoming')) {
    // defined in should, not filter part
  } else if (relative.includes('passed') && relative.includes('current')) {
    parts.push(_havingPassedTimings());
  } else if (relative.includes('passed')) {
    parts.push(_timestampFilter('_search_last_timing', { lt: 'now' }));
  } else if (relative.includes('upcoming') && relative.includes('current')) {
    parts.push(_havingUpcomingAndCurrentTimings());
  } else if (relative.includes('upcoming')) {
    parts.push(_timestampFilter('_search_first_timing', { gt: 'now' }));
  } else if (relative.includes('current')) {
    parts.push(_timestampFilter('_search_last_timing', { gt: 'now' }));
    parts.push(_timestampFilter('_search_first_timing', { lt: 'now' }));
  }

  if (cleanQuery.featured !== null) {
    parts.push(_terms('featured', cleanQuery.featured));
  }

  if (_.get(cleanQuery, 'createdAt.gte') || _.get(cleanQuery, 'createdAt.lte')) {
    parts.push(_timestampFilter('createdAt', cleanQuery.createdAt));
  }

  if (_.get(cleanQuery, 'updatedAt.gte') || _.get(cleanQuery, 'updatedAt.lte')) {
    parts.push(_timestampFilter('updatedAt', cleanQuery.updatedAt));
  }

  if (_.get(cleanQuery, 'sourceAgendaUid', []).length) {
    parts.push(_filterBySourceAgendaUid(cleanQuery.sourceAgendaUid));
  }

  if (addMethod?.length) {
    parts.push(_terms('addMethod', addMethod));
  }

  Object.keys(termsFiltersMap)
    .filter(key => cleanQuery[key] && cleanQuery[key].length)
    .forEach(key => {
      parts.push(
        _filterPart(key, cleanQuery[key], termsFiltersMap[key], { emptyValue })
      )
    })

  if (_.get(cleanQuery, 'state', []).filter(s => s !== null).length) {
    parts.push(_mustPart('terms', 'state', cleanQuery.state));
  }

  if (_.get(cleanQuery, 'status', []).length) {
    parts.push(_mustPart('terms', 'status', cleanQuery.status));
  }

  if (_.get(cleanQuery, 'attendanceMode', []).length) {
    parts.push(_mustPart('terms', 'attendanceMode', cleanQuery.attendanceMode));
  }

  additionalFields.forEach(field => {
    if (cleanQuery[field.field] === undefined) {
      return;
    }

    if (['email'].includes(field.fieldType)) {
      parts.push(_mustPart(
        'term',
        '_search_additional_keywords',
        cleanQuery[field.field]
     ));
     return;
    }
    
    if (['radio', 'select', 'checkbox', 'multiselect', 'boolean'].includes(field.fieldType)) {
      const filterCodes = _extractValuesWithSchemaIds(field, cleanQuery, { emptyValue });
      
      if (!filterCodes.length) {
        return;
      }
      parts.push(_filterPart(
        field.field,
        filterCodes,
        '_search_additional_keywords',
        { emptyValue }
      ));
    }
  });

  return parts;
}

function _extractValuesWithSchemaIds(field, cleanQuery, { emptyValue }) {
  return [].concat(
    cleanQuery[field.field]
  ).map(
    v => v === emptyValue ? v : keywordizeDiscreteValue(field, v)
  );
}

function _filterPart(fieldName, fieldValue, dslField, { emptyValue }) {
  const hasMultipleValues = Array.isArray(fieldValue) && fieldValue.length > 1;
  const hasEmptyValues = hasExplicitEmptyValue(fieldValue, emptyValue);
  
  const value = hasMultipleValues ? fieldValue : [].concat(fieldValue).pop();

  if (hasMultipleValues && hasEmptyValues) {
    const nonEmptyValues = value.filter(v => v !== emptyValue);
    return {
      bool: {
        should: [
          _mustPart(
            nonEmptyValues.length > 1 ? 'terms' : 'term',
            dslField,
            nonEmptyValues.length > 1 ? nonEmptyValues : nonEmptyValues[0]
          ),
          _mustPart(
            'term',
            '_search_empty_fields',
            termsFiltersMap[fieldName] ?? fieldName
          )
        ]
      }
    }
  }

  if (hasMultipleValues) {
    // multiple values are requested and none of them are empty
    return _mustPart('terms', dslField, value);
  }

  if (hasEmptyValues) {
    // has an empty value and only one value is requested
    return _mustPart('term', '_search_empty_fields', termsFiltersMap[fieldName] ?? fieldName);
  }

  // one value is requested and is not empty
  return _mustPart('term', dslField, value);
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

    if (_.get(cleanQuery, fromField, []).length > 1 && !and) {
      parts.push(_mustPart('terms', toField, cleanQuery[fromField]));
    } else {
      _.get(cleanQuery, fromField, [])
        .map(_mustPart.bind(null, 'term', toField))
        .forEach(p => parts.push(p));
    }
  });

  // accessibility constraints
  if (cleanQuery.accessibility?.length) {
    parts.push(_mustPart(
      'terms',
      '_search_keywords', 
      cleanQuery.accessibility.map(a => `accessibility.${a}`)
    ));
  }

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
       ],
       fuzziness: 'AUTO'
      }
    });
  }

  return parts;
}

function _havingUpcomingAndCurrentTimings() {
  return {
    nested: {
      path: 'timings',
      query: {
        range: {
          'timings.end': { gte: 'now' }
        }
      }
    }
  }
}

function _havingPassedTimings() {
  return {
    nested: {
      path: 'timings',
      query: {
        range: {
          'timings.end': { lte: 'now' }
        }
      }
    }
  }
}

function _timingsExcludingOngoing(d) {
  let range = {};
  if (d.gte) range.gte = d.gte;
  if (d.lte) range.lte = d.lte;

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

function _filterBySourceAgendaUid(sourceAgendaUid) {
  const uids = [].concat(sourceAgendaUid);
  const filter = uids.length > 1 ? {
    terms: {
      'sourceAgendas.uid': uids
    }
  } : {
    term: {
      'sourceAgendas.uid': uids[0]
    }
  };

  return {
    nested: {
      path: 'sourceAgendas',
      query: {
        bool: {
          filter: [filter]
        }
      }
    }
  }
}

function _timestampFilter(field, { gte, lte, lt, gt }) {
  const range = {};

  if (gte) {
    range.gte = gte;
  }
  if (lte) {
    range.lte = lte;
  }
  if (lt) {
    range.lt = lt;
  }
  if (gt) {
    range.gt = gt;
  }

  return {
    range: {
      [field]: range
    }
  };
}

function _localTime(t) {
  let range = {};

  if (t.gte) range.gte = t.gte;

  if (t.lte) range.lte = t.lte;

  return {
    nested: {
      path: 'timings',
      score_mode: 'min',
      query: { range: {
        'timings._search_begin_from_midnight' : range
      } }
    }
  };
}

function _geoBounds(b) {
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
