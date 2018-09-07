"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const w = require( 'when' );
const wn = require( 'when/node' );

const agendaCategories = require( '@openagenda/agenda-categories' );
const agendaTags = require( '@openagenda/agenda-tags' );
const log = require( '@openagenda/logs' )( 'services/aggregator/evaluate' );
const rules = require( '@openagenda/aggregators' ).utils.rules;

const aggUtils = require( './aggUtils' );
const interfaces = require( '../interfaces' );
const p = require( '../../../lib/promises' );

const config = require( '../../../config' );


module.exports = {
  publish,
  unpublish
}


function publish( eventId, sourceId, aggregatingAgendaId, mute, cb ) {

  if ( arguments.length === 4 ) {

    cb = mute;

    mute = false;

  }

  log( 'info', 'publish - evaluating for event %s, source %s, aggregating agenda %s %s', eventId, sourceId, aggregatingAgendaId, mute ? 'mute' : '' );

  p.w( {
    eventId,
    sourceId,
    aggregatingAgendaId,
    mute,
    rules: [],
    referenced: null,
    referencedBySource: null,
    shouldAggregate: true,
    states: [],
    added: false,
    referencedOrAdded: false,
    sourceCategories: [],
    eventSourceTags: [],
    eventSourceCustomFields: null,
    aggregatorTags: [],
    aggregatorCategories: [],
    eventTags: null,
    eventCategory: null
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatingAgenda', 'aggregatingAgendaId' ) )

  .then( _loadAgendaTags( 'aggregatingAgendaId', 'aggregatorTags' ) )

  .then( aggUtils.loadRules.bind( null, {
    db: config.db,
    log
  } ) )

  .then( _loadAgendaCategories( 'aggregatingAgendaId', 'aggregatorCategories' ) )

  .then( _loadAgendaCategories( 'sourceId', 'sourceCategories' ) )

  .then( aggUtils.loadEvent )

  .then( _checkSourceReference )

  .then( _checkIfReferenced )

  .then( p.ife( { referenced: true }, _checkIfReferencedBySource ) )

  .then( _loadEventSourceTagsAndCustomFields )

  .then( _evaluateShouldAggregate )

  .then( p.ife( { referenced: true, referencedBySource: true, shouldAggregate: true }, _addNewSourceReference ) )

  .then( p.ife( { referenced: false, shouldAggregate: true }, _addEventToAggregator ) )

  .then( p.ife( { referencedOrAdded: true }, _associateSameTags ) )

  // this is useless as long as custom_fields are directly stored in event schema!
  // .then( p.ife( { referencedOrAdded: true }, _associateSameCustomFields ) )

  .then( p.ife( { referencedOrAdded: true }, _associateSameCategory ) )

  .then( p.ife( { referencedOrAdded: true }, _announceUpdate ) )

  .done( v => {

    if ( v.added ) {

      log( 'info', {
        message: 'publish - added event %s of source %s to aggregating agenda %s',
        type: 'eventadd',
        eventId,
        aggregatorAgendaId: v.aggregatingAgendaId,
        sourceAgendaId: sourceId,
      }, eventId, sourceId, aggregatingAgendaId );

    } else if ( v.referenced ) {

      log( 'info', 'publish - event %s of source %s already is in aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

    } else {

      log( 'info', 'publish - nothing done for event %s of source %s to aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

    }
 
    cb( null, {
      alreadyReferenced: v.referenced,
      added: v.added
    } );

  }, cb );

}


function unpublish( eventId, sourceId, aggregatingAgendaId, mute, cb ) {

  if ( arguments.length === 4 ) {

    cb = mute;

    mute = false;

  }

  log( 'unpublish - evaluating for event %s, source %s, aggregating agenda %s %s', eventId, sourceId, aggregatingAgendaId, mute ? 'mute' : '' );

  p.w( {
    eventId,
    sourceId,
    aggregatingAgendaId,
    mute,
    aggregatingAgenda: null,
    hasRemainingReferences: null,
    removed: false
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatingAgenda', 'aggregatingAgendaId' ) )

  .then( aggUtils.loadEvent )

  .then( _checkIfReferenced )

  .then( p.ife( { referenced: true }, _checkIfReferencedBySource ) )

  // start event change operations. First de-reference source agenda from aggregating agenda event
  .then( p.ife( { referenced: true }, _removeSourceReference ) )

  // if aggregating agenda event has no other source references, remove it; ( it was not added by other source )
  .then( p.ife( { referenced: true, referencedBySource: true, hasRemainingReferences: false }, _removeFromAggregator ) )

  .done( v => {

    if ( !v.removed ) {

      log( 'unpublish - did nothing for event %s of source %s and aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

    } else {

      interfaces.onEventRemove( v.event.uid, v.sourceAgenda.uid, v.aggregatingAgenda.uid );

    }

    cb( null, {
      removed: v.removed
    } );

  }, cb );

}


function _evaluateShouldAggregate( v ) {

  if ( !v.rules.length ) {

    log( 'no rules to evaluate, allow aggregation' );

    return v;

  } else {

    log( 'evaluating rules %j', v.rules );

  }

  const event = _.extend( {
    location: _.get( v, 'event.locations[0]' ),
    tags: v.eventSourceTags.map( t => t.label )
  }, v.eventSourceCustomFields );

  const matchingRuleValues = rules( v.rules, event );

  // all rules must match to trigger aggregation
  if ( matchingRuleValues.length !== v.rules.length ) {

    v.shouldAggregate = false;

  }

  log( 'event %s aggregate', v.shouldAggregate ? 'should' : 'should not' );

  v.states = matchingRuleValues.filter( m => m !== null && m.state !== undefined ).map( m => m.state );

  return v;

}


/**
 * verify that source effectively references
 * this event
 */


function _checkSourceReference( v ) {

  return p.w.promise( function( rs, rj ) {

    v.sourceAgenda.hasEvent( v.event, function( err, has ) {

      if ( err ) return rj( err );

      if ( !has ) return rj( 'event ' + v.event.id + ' is not listed in source agenda ' + v.sourceAgenda.id );

      rs( v );

    } );

  });

}


/**
 * verify whether event is already listed ( published or not ) in aggregating agenda
 * and if is referenced because of other source agenda
 */

function _checkIfReferenced( v ) {

  return p.w.promise( ( rs, rj ) => {

    v.aggregatingAgenda.hasEvent( v.event, ( err, has ) => {

      if ( err ) return rj( err );

      if ( !has ) {

        log( 'aggregating agenda %s does not yet reference event %s', v.aggregatingAgendaId, v.event.id );

        v.referenced = false;

        rs( v );

      } else {

        v.event.loadAgendaContext( v.aggregatingAgendaId, err => {

          v.referenced = true;
          v.referencedOrAdded = true;

          log( 'aggregating agenda %s already references event %s', v.aggregatingAgendaId, v.event.id );

          if ( err ) return rj( err );

          rs( v );

        } );

      }

    });

  });

}


/**
 * assuming event is already referenced
 * check if it was referenced by a source
 * agenda
 */

function _checkIfReferencedBySource( v ) {

  // need a sources getter on the event instance here.
  log( 'checking if was referenced by source' );

  return p.w.promise( ( rs, rj ) => {

    v.event.getSources( function( err, sources ) {

      if ( err ) return rj( err );

      v.referencedBySource = !!sources.length;

      log( 'was referenced by a source' );

      rs( v );

    });

  } );

}


/**
 * assuming event is already listed, register source agenda as new source
 */

function _addNewSourceReference( v ) {

  const d = p.w.defer();

  log( 'adding source agenda %s reference to event %s', v.sourceAgenda.id, v.event.id );

  v.event.loadAgendaContext( v.aggregatingAgendaId, err => {

    if ( err ) {

      return d.reject( err );

    }

    v.event.addSource( {
      sourceId: v.sourceAgenda.id
    }, err => {

      if ( err ) {

        return d.reject( err );

      }

      log( 'source agenda id added to event %s', v.event.id );

      v.referencedOrAdded = true;

      d.resolve( v );

    });

  } );

  return d.promise;

}




/**
 * remove source agenda from agendaEvent data. Event will no longer
 * be marked has having been added through said source
 */
function _removeSourceReference( v ) {

  let d = p.w.defer();

  v.event.removeSource( {
    sourceId: v.sourceAgenda.id
  }, err => {

    if ( err ) return d.reject( err );
    
    v.event.getSources( function( err, sources ) {

      if ( err ) return d.reject( err );
      
      v.hasRemainingReferences = !!sources.length;

      log( 'has remaining references? %s', v.hasRemainingReferences ? 'yes' : 'no' );

      d.resolve( v );

    });

  } );

  return d.promise;

}


/**
 * remove an event from an aggregating agenda ( an agenda where it was added by aggregation )
 */

function _removeFromAggregator( v ) {

  return p.w.promise( function( rs, rj ) {
    
    v.aggregatingAgenda.removeEvent( v.event, {
      refresh: !v.mute
    }, ( err, result ) => {

      if ( err ) return rj( err );

      log( 'info', {
        message: 'unpublish - removed event %s of source %s from aggregating agenda %s',
        type: 'eventremove',
        eventId: v.eventId,
        aggregatorAgendaId: v.aggregatingAgendaId,
        sourceAgendaId: v.sourceId,
      }, v.eventId, v.sourceId, v.aggregatingAgendaId );

      v.removed = true;

      rs( v );

    } );

  });

}


function _loadAgendaTags( agendaIdNamespace, destNamespace ) {

  return v => {

    let d = p.w.defer();

    log( 'agenda tags load for %s', agendaIdNamespace );

    agendaTags.get( v[ agendaIdNamespace ], ( err, set ) => {

      if ( err ) return d.reject( err );

      if ( !set ) {

        log( 'there are no tags associated with agenda %s %s', agendaIdNamespace, v[ agendaIdNamespace ] );

        return d.resolve( v );

      }

      v[ destNamespace ] = set.groups.reduce( ( tags, group ) => tags.concat( group.tags ), [] );

      log( 'loaded %s tags', v[ destNamespace ].length );

      d.resolve( v );

    } );

    return d.promise;

  }

}

function _loadAgendaCategories( agendaIdNamespace, destNamespace ) {

  return v => {

    let d = p.w.defer();

    agendaCategories.get( v[ agendaIdNamespace ], ( err, set ) => {

      if ( err ) return d.reject( err );

      log( 'agenda categories load for %s', agendaIdNamespace );

      if ( set ) {

        v[ destNamespace ] = set.categories;

      }

      log( 'loaded %s categories', v[ destNamespace ].length );

      d.resolve( v );

    } );

    return d.promise;
    
  }

}


function _loadEventSourceTagsAndCustomFields( v ) {

  return wn.call( v.event.loadAgendaContext, v.sourceId )

    .then( () => wn.call( v.event.getAgendaTags ) )

    .then( tags => {

      v.eventSourceTags = tags;

      log( 'event is associated to %s tags', v.eventSourceTags.length );

    } )

    .then( () => wn.call( v.sourceAgenda.getEventPublicCustomData, v.event ) )

    .then( customFields => {

      customFields = _.first( customFields );

      if ( !_.isArray( customFields ) ) return;

      v.eventSourceCustomFields = customFields.reduce( ( carry, v ) => {

        carry[ v.name ] = v.value;

        return carry;

      }, {} );

    } )

    .then( () => v );

}



function _associateSameTags( v ) {

  log( 'checking for tags association' );

  if ( !v.eventSourceTags.length || !v.aggregatorTags.length ) return v;

  return w().then( () => {

    // match to aggregator tags
    return v.eventSourceTags

      .filter( t => v.aggregatorTags.filter( at => at.label === t.label ).length )

      .map( t => v.aggregatorTags.filter( at => at.label === t.label )[ 0 ] );

  } )

  .then( aTags => p.w.map( aTags, aTag => {

    return wn.call( v.aggregatingAgenda.assignTag, aTag, v.event );

  } ) )

  .then( () => v );

}


function _associateSameCustomFields( v ) {

  if ( v.eventSourceCustomFields === null ) return v;

  log( 'checking for custom fields association' );

  let fieldsToSet = _.pickBy( v.eventSourceCustomFields, ( value, k ) => v.aggregatingAgenda.hasCustomField( k ) );

  if ( Object.keys( fieldsToSet ).length === 0 ) {

    log( 'no custom fields to add to aggregated event' );

    return v;

  }


  return wn.call( v.event.loadAgendaContext, v.aggregatorAgendaId )

    .then( () => {

      let fieldNames = Object.keys( fieldsToSet ),

        lastField = fieldNames.pop(),

        d = w.defer();

      async.eachSeries( fieldNames, ( field, ecb ) => {

        v.event.setCustomField( field, fieldsToSet[ field ], false, ecb );

      }, err => {

        if ( err ) return d.reject( err );

        v.event.setCustomField( lastField, fieldsToSet[ lastField ], true, err => {

          if ( err ) return d.reject( err );

          d.resolve( v );

        } );

      } );

      return d.promise;

    } );

}


function _associateSameCategory( v ) {

  log( 'checking for category association' );

  if ( !v.sourceCategories.length || !v.aggregatorCategories.length ) return v;

  return wn.call( v.event.loadAgendaContext, v.sourceId )

  .then( () => wn.call( v.event.getAgendaCategory ) )

  .then( category => {

    if ( !category ) return;

    log( 'checking category %s', category.label );

    let matchingAggregatorCategory = v.aggregatorCategories.filter( ac => ac.label === category.label );

    if ( !matchingAggregatorCategory.length ) return;

    log( 'associating category' );

    return matchingAggregatorCategory[ 0 ];

  } )

  .then( aCategory => {

    if ( !aCategory ) return;

    return wn.call( v.aggregatingAgenda.assignCategory, aCategory, v.event );

  } )

  .then( () => v );

}


function _announceUpdate( v ) {

  v.aggregatingAgenda.announceEventUpdate( v.event, {
    refresh: !v.mute,
    sourceAgendaUid: v.sourceAgenda.uid
  } );

  return v;

}


/**
 * assuming event is not already listed, add event to the aggregating agenda
 */

function _addEventToAggregator( v ) {

  let d = p.w.defer();

  let state = 2; // published

  if ( v.states.length ) state = v.states.pop();

  log( 'adding event %s to aggregating agenda %s with state %s', v.event.id, v.aggregatingAgenda.id, state );

  v.aggregatingAgenda.addEvent( v.event, {
    stakeholder: { id: v.aggregatingAgenda.ownerId },
    state,
    mute: true
  }, err => {

    if ( err ) return d.reject( err );

    log( 'event %s added to aggregating agenda %s with state %s', v.event.id, v.aggregatingAgenda.id, state );

    v.event.loadAgendaContext( v.aggregatingAgendaId, err => {

      if ( err ) return d.reject( err );

      v.event.addSource( {
        sourceId: v.sourceId
      }, ( err, result ) => {

        if ( err ) return d.reject( err );

        log( 'source reference agenda %s added to event %s', v.sourceId, v.event.id );

        v.added = true;
        v.referencedOrAdded = true;

        d.resolve( v );

      } );

    } );

  });

  return d.promise;

}
