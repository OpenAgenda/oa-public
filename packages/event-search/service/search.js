'use strict';

const _ = require('lodash');
const VError = require('verror');

const buildAggregationDsl = require('./aggregation');
const runDSLQuery = require('./helpers/runDSLQuery');
const getIndexName = require('./helpers/getIndexName');
const instanciateSearchStream = require('./helpers/instanciateSearchStream');
const h = require('./helpers');
const parseAggregationResult = require('./aggregation').parseResult;
const parseQuery = require('./query');
const validateNav = require('./query/validateNav');
const validateOptions = require('./query/validateOptions');
const getFormSchemaAdditionalFields = require('../utils/getFormSchemaAdditionalFields');

const log = require('@openagenda/logs')('search');

function _addIncludes({ baseSearchIncludes, detailedSearchIncludes }, { detailed, formSchema }) {
  if (!detailed) {
    return baseSearchIncludes;
  }

  return detailedSearchIncludes.concat(
    getFormSchemaAdditionalFields(formSchema).map(f => f.field)
  );
}

async function search(config, set, query = {}, nav = {}, options = {}) {
  log('searching on set %s with query %j', set, query);

  let cleanNav = {}, cleanOptions = {}, cleanDsl;

  const {
    defaultIndex
  } = config;

  try {
    cleanNav = validateNav(nav);
  } catch(e) {
    throw new VError(e, 'nav is not valid');
  }

  try {
    cleanOptions = validateOptions(options);
  } catch (e) {
    throw new VError(e, 'options are not valid');
  }

  const index = getIndexName(set, defaultIndex);

  query.set = set;

  cleanDsl = parseQuery(
    query,
    cleanNav.size !== undefined ? cleanNav : {},
    cleanOptions.formSchema,
    // includes
    _addIncludes(config, cleanOptions)
  );

  // sorting and _source added after

  if (cleanOptions.aggregations) {
    cleanDsl.aggregations = buildAggregationDsl(config, cleanOptions.aggregations, config.predefinedAggregations, query);
  }

  let {
    events,
    total,
    aggregations,
    scrollId
  } = await runDSLQuery(_.pick(config, ['client']), index, cleanDsl, cleanNav.scroll ? cleanNav : {});

  const eventParsers = _buildEventParsers(cleanOptions, aggregations);

  const parsedEvents = _parseEvents(eventParsers, events);

  if (options.aggregations) {
    aggregations = parseAggregationResult(config, options.aggregations, aggregations, config.predefinedAggregations, _parseEvents.bind( null, eventParsers ) );
  }

  return Object.assign({
    total,
    events: parsedEvents,
    scrollId
  }, aggregations ? { aggregations } : {});
}

function scroll(config, set, scrollId, scroll) {
  return config.client
    .scroll({ scrollId, scroll })
    .then(res => ({
      events: res.body.hits.hits.map( h => h[ '_source' ] ),
      total: res.body.hits.total.value
    }));
}

module.exports = (config, set) => {
  const methods = {
    search: search.bind(null, config, set),
    scroll: scroll.bind(null, config, set)
  };

  return Object.assign(methods.search, {
    scroll: methods.scroll,
    dsl: (DSL, options) => runDSLQuery(_.pick(config, ['client', 'type']), set, DSL, options),
    stream: instanciateSearchStream.bind(null, methods, set)
  });
}


function _parseEvents( parsers, events ) {
  return events.map(e => {
    parsers.forEach( p => {
      e = p( e );
    } );
    return e;
  });
}


function _buildEventParsers( options, aggregations ) {

  let parsers = [ h.convertToLocalTimezone ];

  if ( options.merge ) {

    parsers.push( _merge.bind( null, options.merge ) );

  }

  parsers.push( h.appendNextAndLastTiming );

  if ( !options.detailed ) {

    parsers.push( h.removeTimingsAndTimezone );

  }

  if ( options.monolingual ) {

    parsers.push( h.monolingual.bind( null, [
      'title',
      'description',
      'keywords',
      'conditions',
      'dateRange',
      'longDescription',
      'country',
      'location.description'
    ], options.monolingual ) );

  }

  return parsers;

}


function _merge( rules, event ) {

  let merged = {}, clean = {}, mergedFields = [];

  Object.keys( rules ).forEach( r => {

    merged[ r ] = {};

    rules[ r ].forEach( fieldToBeMerged => {

      mergedFields.push( fieldToBeMerged );

      _.assign( merged[ r ], event[ fieldToBeMerged ] );

    } );

  } );

  return _.extend( _.omit( event, mergedFields ), merged );

}
