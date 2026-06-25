import _ from 'lodash';
import getFormSchemaAdditionalFields from './getFormSchemaAdditionalFields.js';
import keywordizeDiscreteValue from './keywordizeDiscreteValue.js';
import removeDiacritics from './removeDiacritics.js';

const termsFiltersMap = {
  memberUid: 'member.uid',
  'originAgenda.uid': 'originAgenda.uid',
  city: 'location.city',
  district: 'location.district',
  department: 'location.department',
  region: 'location.region',
  adminLevel3: 'location.adminLevel3',
  adminLevel5: 'location.adminLevel5',
  countryCode: 'location.countryCode',
  locationUid: 'location.uid',
  locationExtId: 'location.extId',
  uid: 'uid',
  slug: 'slug',
  ownerUid: 'ownerUid',
  languages: '_search_languages',
};

function hasExplicitEmptyValue(queryValue, emptyValue) {
  if (!queryValue) return false;

  return [].concat(queryValue).includes(emptyValue);
}

function _mustPart(queryType, fieldName, value) {
  return {
    [queryType]: {
      [fieldName]: value,
    },
  };
}

function _geoBounds(b) {
  return {
    geo_bounding_box: {
      _search_location: {
        top_left: { lat: b.northEast.lat, lon: b.southWest.lng },
        bottom_right: { lat: b.southWest.lat, lon: b.northEast.lng },
      },
    },
  };
}

function _geoDistance(g) {
  return {
    geo_distance: {
      distance: `${g.distance}m`,
      _search_location: { lat: g.center.lat, lon: g.center.lng },
    },
  };
}

// Roles allowed to search the organizing member's private data (structure, name,
// position). Default-closed: `public`, `contributor`, `reader`, `undefined` and `null`
// are excluded, honouring the GDPR constraint that member personal data must not be
// reachable — even by inference — through the public search.
const MEMBER_SEARCH_ACCESS = ['moderator', 'administrator', 'internal'];

function canSearchMemberData(access) {
  return MEMBER_SEARCH_ACCESS.includes(access);
}

function _getQueryMustParts(cleanQuery, { access } = {}) {
  const parts = [];

  // term constraints
  [['keyword', '_search_keywords', true]].forEach((field) => {
    const fromField = _.isArray(field) ? field[0] : field;
    const toField = _.isArray(field) ? field[1] : field;
    const and = _.isArray(field) ? field[2] : false;

    if (_.get(cleanQuery, fromField, []).length > 1 && !and) {
      parts.push(_mustPart('terms', toField, cleanQuery[fromField]));
    } else {
      _.get(cleanQuery, fromField, [])
        .map(_mustPart.bind(null, 'term', toField))
        .forEach((p) => parts.push(p));
    }
  });

  // accessibility constraints
  if (cleanQuery.accessibility?.length) {
    parts.push(
      _mustPart(
        'terms',
        '_search_keywords',
        cleanQuery.accessibility.map((a) => `accessibility.${a}`),
      ),
    );
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

  // proximity constraint (geo_distance): lat/lng may legitimately be 0, so test
  // for presence (!= null) rather than truthiness.
  if (
    _.get(cleanQuery, 'geoDistance.center.lat') != null
    && _.get(cleanQuery, 'geoDistance.center.lng') != null
    && _.get(cleanQuery, 'geoDistance.distance') > 0
  ) {
    parts.push(_geoDistance(cleanQuery.geoDistance));
  }

  const searchFields = [
    '_search_title',
    '_search_description',
    '_search_keywords_text',
    '_search_full_address_text',
  ];

  const filteredSearchFields = [
    '_search_title_filtered',
    '_search_description_filtered',
  ];

  if (canSearchMemberData(access)) {
    searchFields.push('_admin_search_member');
    filteredSearchFields.push('_admin_search_member_filtered');
  }

  if (/^".+"$/.test(cleanQuery.search)) {
    parts.push({
      bool: {
        should: searchFields.map((field) => ({
          match_phrase: {
            [field]: cleanQuery.search.replace(/^"|"$/g, ''),
          },
        })),
        minimum_should_match: 1,
      },
    });
  } else if (cleanQuery.search) {
    // add multi_match search part
    parts.push({
      bool: {
        should: [
          {
            multi_match: {
              query: removeDiacritics(cleanQuery.search),
              type: 'best_fields',
              fields: filteredSearchFields,
            },
          },
          {
            multi_match: {
              query: removeDiacritics(cleanQuery.search),
              type: 'phrase_prefix',
              fields: searchFields,
            },
          },
        ],
        minimum_should_match: 1,
      },
    });
  }
  return parts;
}

function _extIdFilter(extId, type = 'event') {
  return {
    nested: {
      path: `${type === 'location' ? 'location.' : ''}extIds`,
      query: {
        bool: {
          must: [
            {
              match: {
                [`${type === 'location' ? 'location.' : ''}extIds.key`]:
                  extId.key,
              },
            },
            {
              match: {
                [`${type === 'location' ? 'location.' : ''}extIds.value`]:
                  extId.value,
              },
            },
          ],
        },
      },
    },
  };
}

function _havingUpcomingAndCurrentTimings() {
  return {
    nested: {
      path: 'timings',
      query: {
        range: {
          'timings.end': { gte: 'now' },
        },
      },
    },
  };
}

function _havingPassedTimings() {
  return {
    nested: {
      path: 'timings',
      query: {
        range: {
          'timings.end': { lte: 'now' },
        },
      },
    },
  };
}

function _timingsExcludingOngoing(d) {
  const ranges = (Array.isArray(d) ? d : [d]).map((v) => {
    const range = {};
    if (v.gte) range.gte = v.gte;
    if (v.lte) range.lte = v.lte;
    return range;
  });

  return {
    nested: {
      path: 'timings',
      score_mode: 'min',
      query: {
        bool: {
          should: ranges.map((range) => ({
            range: {
              'timings.begin': range,
            },
          })),
        },
      },
    },
  };
}

function _filterByNested(key, singleOrMultiValue) {
  const value = [].concat(singleOrMultiValue);

  return {
    nested: {
      path: key.split('.').shift(),
      query: {
        bool: {
          filter: [
            {
              [value.length > 1 ? 'terms' : 'term']: {
                [key]: value.length > 1 ? value : value[0],
              },
            },
          ],
        },
      },
    },
  };
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
      [field]: range,
    },
  };
}

function _localTime(t) {
  const range = {};

  if (t.gte) range.gte = t.gte;

  if (t.lte) range.lte = t.lte;

  return {
    nested: {
      path: 'timings',
      score_mode: 'min',
      query: {
        range: {
          'timings._search_begin_from_midnight': range,
        },
      },
    },
  };
}

const ownerOrMemberUidPart = (uid) => ({
  bool: {
    should: [
      {
        terms: { ownerUid: uid },
      },
      {
        terms: { 'member.uid': uid },
      },
    ],
  },
});

function _terms(fieldName, value) {
  const values = [].concat(value);
  return {
    [values.length > 1 ? 'terms' : 'term']: {
      [fieldName]: values.length > 1 ? values : values[0],
    },
  };
}

function _extractValuesWithSchemaIds(field, cleanQuery, { emptyValue, path }) {
  return []
    .concat(cleanQuery[field.field])
    .map((v) =>
      (v === emptyValue ? v : keywordizeDiscreteValue(field, v, path)));
}

function _filterPart(fieldName, fieldValue, dslField, { emptyValue }) {
  const hasMultipleValues = Array.isArray(fieldValue) && fieldValue.length > 1;
  const hasEmptyValues = hasExplicitEmptyValue(fieldValue, emptyValue);

  const value = hasMultipleValues ? fieldValue : [].concat(fieldValue).pop();

  if (hasMultipleValues && hasEmptyValues) {
    const nonEmptyValues = value.filter((v) => v !== emptyValue);
    return {
      bool: {
        should: [
          _mustPart(
            nonEmptyValues.length > 1 ? 'terms' : 'term',
            dslField,
            nonEmptyValues.length > 1 ? nonEmptyValues : nonEmptyValues[0],
          ),
          _mustPart(
            'term',
            '_search_empty_fields',
            termsFiltersMap[fieldName] ?? fieldName,
          ),
        ],
      },
    };
  }

  if (hasMultipleValues) {
    // multiple values are requested and none of them are empty
    return _mustPart('terms', dslField, value);
  }

  if (hasEmptyValues) {
    // has an empty value and only one value is requested
    return _mustPart(
      'term',
      '_search_empty_fields',
      termsFiltersMap[fieldName] ?? fieldName,
    );
  }

  // one value is requested and is not empty
  return _mustPart('term', dslField, value);
}

function _addAdditionalFieldsToFilterParts(
  parts,
  fields,
  cleanQuery,
  { emptyValue, path },
) {
  const currentPath = path ?? '';
  fields.forEach((field) => {
    if (field.schema && cleanQuery[field.field]) {
      _addAdditionalFieldsToFilterParts(
        parts,
        field.schema.fields,
        cleanQuery[field.field],
        {
          emptyValue,
          path: currentPath.length
            ? `${currentPath}.${field.field}`
            : field.field,
        },
      );
      return;
    }

    if (cleanQuery[field.field] === undefined) {
      return;
    }

    if (['email'].includes(field.fieldType)) {
      parts.push(
        _mustPart(
          'term',
          '_search_additional_keywords',
          currentPath.length
            ? `${currentPath}.${cleanQuery[field.field]}`
            : cleanQuery[field.field],
        ),
      );
      return;
    }

    if (
      ['radio', 'select', 'checkbox', 'multiselect', 'boolean'].includes(
        field.fieldType,
      )
    ) {
      const filterCodes = _extractValuesWithSchemaIds(field, cleanQuery, {
        emptyValue,
        path: currentPath,
      });

      if (!filterCodes.length) {
        return;
      }
      parts.push(
        _filterPart(field.field, filterCodes, '_search_additional_keywords', {
          emptyValue,
        }),
      );
    }

    if (['number', 'integer'].includes(field.fieldType)) {
      parts.push({
        nested: {
          path: '_search_additional_numbers',
          query: {
            bool: {
              must: [
                {
                  match: {
                    '_search_additional_numbers.fieldName': field.field,
                  },
                },
                {
                  range: {
                    [`_search_additional_numbers.${field.fieldType}`]:
                      cleanQuery[field.field],
                  },
                },
              ],
            },
          },
        },
      });
    }
  });
}

function _getQueryFilterParts(
  cleanQuery,
  { additionalAndSchemaFields, emptyValue, removed = false },
) {
  const parts = [];
  const { relative, addMethod } = cleanQuery;

  if (_.get(cleanQuery, 'set')) {
    parts.push({ term: { _set: cleanQuery.set } });
  }

  if (_.get(cleanQuery, 'age.gte') || _.get(cleanQuery, 'age.lte')) {
    if (cleanQuery.age.gte) {
      parts.push({ range: { 'age.max': { gte: cleanQuery.age.gte } } });
    }
    if (cleanQuery.age.lte) {
      parts.push({ range: { 'age.min': { lte: cleanQuery.age.lte } } });
    }
  }

  if (
    _.get(cleanQuery, 'localTime.gte')
    || _.get(cleanQuery, 'localTime.lte')
  ) {
    parts.push(_localTime(cleanQuery.localTime));
  }

  if (
    Array.isArray(cleanQuery?.timings)
    || _.get(cleanQuery, 'timings.gte')
    || _.get(cleanQuery, 'timings.lte')
  ) {
    parts.push(_timingsExcludingOngoing(cleanQuery.timings));
  }

  if (
    relative.includes('passed')
    && relative.includes('upcoming')
    && relative.includes('current')
  ) {
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

  if (cleanQuery.originAgenda.official !== null) {
    parts.push(
      _terms('originAgenda.official', cleanQuery.originAgenda.official),
    );
  }

  if (removed === true) {
    parts.push(_terms('removed', true));
  }

  if (cleanQuery.valid === null) {
    parts.push(_mustPart('term', '_search_empty_fields', 'valid'));
  } else if (cleanQuery.valid !== undefined) {
    parts.push(_terms('valid', cleanQuery.valid));
  }

  if (cleanQuery?.extId && cleanQuery.extId.key && cleanQuery.extId.value) {
    parts.push(_extIdFilter(cleanQuery.extId));
  }

  if (
    cleanQuery?.locationExtId
    && cleanQuery.locationExtId.key
    && cleanQuery.locationExtId.value
  ) {
    parts.push(_extIdFilter(cleanQuery?.locationExtId, 'location'));
  }

  if (
    _.get(cleanQuery, 'createdAt.gte')
    || _.get(cleanQuery, 'createdAt.lte')
  ) {
    parts.push(_timestampFilter('createdAt', cleanQuery.createdAt));
  }

  if (
    _.get(cleanQuery, 'updatedAt.gte')
    || _.get(cleanQuery, 'updatedAt.lte')
  ) {
    parts.push(_timestampFilter('updatedAt', cleanQuery.updatedAt));
  }

  if (![null, undefined].includes(_.get(cleanQuery, 'originAgenda.uid'))) {
    parts.push(_terms('originAgenda.uid', cleanQuery.originAgenda.uid));
  }

  if (_.get(cleanQuery, 'sourceAgendaUid', []).length) {
    parts.push(
      _filterByNested('sourceAgendas.uid', cleanQuery.sourceAgendaUid),
    );
  }

  if (_.get(cleanQuery, 'referencingAgendaUid', []).length) {
    parts.push(
      _terms('_referencing_agenda_uids', cleanQuery.referencingAgendaUid),
    );
  }

  if (addMethod?.length) {
    parts.push(_terms('addMethod', addMethod));
  }

  Object.keys(termsFiltersMap)
    .filter((key) => cleanQuery[key] && cleanQuery[key].length)
    .forEach((key) => {
      parts.push(
        _filterPart(key, cleanQuery[key], termsFiltersMap[key], { emptyValue }),
      );
    });

  if ((cleanQuery.ownerOrMemberUid ?? []).length) {
    parts.push(ownerOrMemberUidPart(cleanQuery.ownerOrMemberUid));
  }

  if (_.get(cleanQuery, 'state', []).filter((s) => s !== null).length) {
    parts.push(
      _mustPart(
        'terms',
        'state',
        removed === null || removed === true
          ? cleanQuery.state.concat(-2)
          : cleanQuery.state,
      ),
    );
  }

  if (_.get(cleanQuery, 'status', []).length) {
    parts.push(_mustPart('terms', 'status', cleanQuery.status));
  }

  if (_.get(cleanQuery, 'attendanceMode', []).length) {
    parts.push(_mustPart('terms', 'attendanceMode', cleanQuery.attendanceMode));
  }

  _addAdditionalFieldsToFilterParts(
    parts,
    additionalAndSchemaFields,
    cleanQuery,
    { emptyValue },
  );

  return parts;
}

function _getQueryMustNotFilterParts(cleanQuery) {
  const parts = [];
  const hasPassedAndUpcoming = cleanQuery.relative.filter((r) => ['passed', 'upcoming'].includes(r))
    .length === 2;
  const hasCurrent = cleanQuery.relative.includes('current');

  if (hasPassedAndUpcoming && !hasCurrent) {
    parts.push({
      range: {
        _search_first_timing: { lte: 'now' },
      },
    });
    parts.push({
      range: {
        _search_last_timing: { gte: 'now' },
      },
    });
  }

  if (_.get(cleanQuery, 'notReferencingAgendaUid', []).length) {
    parts.push(
      _terms('_referencing_agenda_uids', cleanQuery.notReferencingAgendaUid),
    );
  }

  return parts;
}

export default function getDSLQueryPart(cleanQuery, options = {}) {
  const { formSchema, emptyValue, removed = false, access } = options;

  const query = {};
  const additionalAndSchemaFields = getFormSchemaAdditionalFields(
    formSchema,
  ).concat((formSchema?.fields ?? []).filter((f) => f.schema));

  const mustParts = _getQueryMustParts(cleanQuery, { access });

  const filterParts = _getQueryFilterParts(cleanQuery, {
    additionalAndSchemaFields,
    emptyValue,
    removed,
  });

  // Soft-delete exclusion. A pure boolean predicate carrying no relevance
  // signal, so it lives in filter context where ES caches it as a per-segment
  // bitset and reuses it across every search instead of scoring it per request.
  // A plain term suffices: every doc is indexed through formatEvent, which
  // always sets `removed` (false by default), and the index has been fully
  // rebuilt since — so no legacy doc is missing the field.
  if (removed === false) {
    filterParts.push({ term: { removed: false } });
  }

  const mustNotFilterParts = _getQueryMustNotFilterParts(cleanQuery);

  if (mustParts.length === 1 && !filterParts.length) {
    _.extend(query, mustParts[0]);
  } else if (mustParts.length > 1 || (filterParts.length && mustParts.length)) {
    _.set(query, 'bool.must', mustParts);
  }

  if (filterParts.length) {
    _.set(query, 'bool.filter', filterParts);
  }

  if (mustNotFilterParts.length) {
    _.set(query, 'bool.must_not.bool.filter', mustNotFilterParts);
  }

  return query;
}
