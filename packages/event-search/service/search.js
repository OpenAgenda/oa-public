'use strict';

const _ = require('lodash');
const VError = require('verror');

const buildAggregationDsl = require('./aggregation');
const runDSLQuery = require('./helpers/runDSLQuery');
const instanciateSearchStream = require('./helpers/instanciateSearchStream');
const h = require('./helpers');
const parseAggregationResult = require('./aggregation').parseResult;
const parseQuery = require('./query');
const validateNav = require('./query/validateNav');
const validateOptions = require('./query/validateOptions');

const log = require('@openagenda/logs')('search');

async function search(config, alias, query, nav = {}, options = {}) {
  log('searching on alias %s with query %j', alias, query);

  let cleanNav = {}, cleanOptions = {}, cleanDsl;

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

  cleanDsl = parseQuery(
    query,
    cleanNav.size !== undefined ? cleanNav : {},
    cleanOptions.extensions,
    // includes
    (cleanOptions.detailed ? config.detailedSearchIncludes.concat( cleanOptions.extensions ) : config.baseSearchIncludes)
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
  } = await runDSLQuery(_.pick(config, ['client', 'type']), alias, cleanDsl, cleanNav.scroll ? cleanNav : {});

  const eventParsers = _buildEventParsers(cleanOptions, aggregations);

  const parsedEvents = _parseEvents(eventParsers, events);

  if (options.aggregations) {
    aggregations = parseAggregationResult(config, options.aggregations, aggregations, config.predefinedAggregations, _parseEvents.bind( null, eventParsers ) );
  }

  return Object.assign( {
    total,
    events: parsedEvents,
    scrollId
  }, aggregations ? { aggregations } : {} );

}

function scroll(config, alias, scrollId, scroll) {
  return config.client
    .scroll({ scrollId, scroll })
    .then(res => ({
      events: res.hits.hits.map( h => h[ '_source' ] ),
      total: res.hits.total
    }));
}

module.exports = (config, alias) => {
  const methods = {
    search: search.bind(null, config, alias),
    scroll: scroll.bind(null, config, alias)
  };

  return Object.assign(methods.search, {
    scroll: methods.scroll,
    dsl: (DSL, options) => runDSLQuery(_.pick(config, ['client', 'type']), alias, DSL, options),
    stream: instanciateSearchStream.bind(null, methods, alias)
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
