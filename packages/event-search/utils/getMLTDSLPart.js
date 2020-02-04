'use strict';

const _ = require('lodash');

const multilingualFields = ['title', 'description', 'keywords'];

const fieldMap = {
  keywords: '_search_keywords_text',
  title: '_search_title',
  description: '_search_description'
};

const getMLTField = field => _.get(fieldMap, field);

const getMLTLocationValue = location => [
  'address', 'city', 'department', 'region'
].filter(f => !!location[f]).map(f => location[f]).join(' ');

module.exports = MLTQuery => {
  const {
    like,
    fields
  } = distributeByLanguage(multilingualFields, MLTQuery)
    .reduce(({ like, fields }, [lang, query]) => {
      const MLTDoc = _.mapKeys(
        _.pick(query, _.keys(fieldMap)),
        (v, k) => getMLTField(k));

    if (MLTQuery.location) {
      MLTDoc['_search_full_address_text'] = getMLTLocationValue(MLTQuery.location);
    }

    /*if (MLTQuery.custom) {
      const mltCustom = {};

      const optionedValues = _.flatten( _.keys( mltQuery.custom )
        .filter( field => _.isArray( mltQuery.custom[ field ] ) || _isIntegerLike( mltQuery.custom[ field ] ) )
        .map( field => [].concat( mltQuery.custom[ field ] ) ) );

      if ( optionedValues.length ) {
        fields.push( 'custom._search_keywords' );
        mltCustom[ '_search_keywords' ] = optionedValues.map( o => 'key' + o );
      }
      _.keys( mltQuery.custom )
        .filter( field => !_isIntegerLike( mltQuery.custom[ field ] ) )
        .filter( field => mltQuery.custom[ field ].length )
        .forEach( field => {
          mltCustom[ field ] = mltQuery.custom[ field ];
          fields.push( 'custom.' + field );
        } );
      if ( _.keys( mltCustom ).length ) {
        mltDoc.custom = mltCustom;
      }
    }*/

    const flattenedMLTDoc = _.mapValues(MLTDoc, v => _.isArray(v) ? v.join(' ') : v);
    const nonEmptyMLTDoc = _.omitBy(flattenedMLTDoc, v => !v);

    return _.keys(nonEmptyMLTDoc).length ? {
      like: like.concat(nonEmptyMLTDoc),
      fields: _.uniq(fields.concat(_.keys( nonEmptyMLTDoc)/*.filter(k => k !== 'custom')*/))
    } : { like, fields };

  }, {
    like: [],
    fields: []
  });

  return {
    fields,
    min_word_length: 3,
    min_term_freq: 1,
    min_doc_freq: 1,
    like: like.map(l => ({ doc: l }))
  }
}

function distributeByLanguage(multilingualFields = [], obj) {
  const languages = Object.keys(obj)
    .filter(k => multilingualFields.includes(k))
    .reduce((languages, field) => {
      if (!obj[field] || !_.isObject(obj[field])) {
        return languages;
      }
      return _.uniq(languages.concat(Object.keys(obj[field])));
  }, []);

  if (!languages.length) languages.push(null);

  return languages.map(lang => {
    const langObj = _.keys(obj).reduce((langObj, field) => {
      const path = [field].concat(multilingualFields.includes(field) ? lang : []);
      const value = _.get(obj, path, undefined);

      if (value !== undefined) {
        langObj[field] = value;
      }

      return langObj;
    }, {});

    return [
      lang,
      langObj
    ]
  });
}

function _isIntegerLike(value) {
  return !isNaN(parseInt(value));
}
