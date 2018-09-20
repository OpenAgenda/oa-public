"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment-timezone' );
const countries = require( './countries' );

module.exports = function( event, lang = 'fr' ) {

  const flattened = _singleLanguage( [
    'title',
    'description',
    'longDescription',
    'html',
    'range',
    'conditions',
    'location.description',
    'location.access'
  ], lang, event );

  const timezone = _.get( event, 'timezone', 'Europe/Paris' );
  const passed = _passedFlag( flattened.timings, timezone )

  _.extend( flattened, {
    passed,
    dates: _formattedDates( flattened.timings, timezone, lang ),
    diffWithNow: _closestDiffWithNow( flattened.timings, passed, timezone ),
    custom: _customData( event ),
    accessibility: _accessibility( event.accessibility, lang ),
    location: _.set( flattened.location, 'country', _countryLabel( _.get( event, 'location.countryCode', null ), lang ) ),
    hasAccessibility: !!event.accessibility.length
  } );

  const thematiqueSlug = Object.keys( event.custom ).find( v => v.startsWith( 'thematique-' ) );

  if ( thematiqueSlug ) {
    const tagGroup =  event.tagGroups.find( v => v.slug === thematiqueSlug );

    flattened.thematiqueGroup = tagGroup.name;
    flattened.thematiqueValue = tagGroup.tags[ 0 ].label;
  }

  return flattened;

}


function _accessibility( acc, lang ) {

  return acc.map( a => ( { label: {
    hi: {
      en: 'Hearing impairment',
      fr: 'Handicap auditif'
    },
    sl: {
      en: 'Sign language',
      fr: 'Langage des signes'
    },
    mi: {
      en: 'Motor impairment',
      fr: 'Handicap moteur'
    },
    pi: {
      en: 'Psychic impairment',
      fr: 'Handicap psychique'
    },
    vi: {
      en: 'Visual impairment',
      fr: 'Handicap visuel'
    }
  }[ a ][ lang ], code: a } ) );

}


function _customData( event ) {

  return event.tagGroups.reduce( ( reduced, g ) => {

    return _.set( reduced, g.slug, g.tags.map( t => t.label ).join( ', ' ) );

  }, {} );

}


function _countryLabel( code, lang ) {

  const label = _.get( countries, _.toUpper( code ), { fr: 'Code pays non défini', en: 'Undefined country code' } );

  const defaultLang = _.first( _.keys( label ) );

  return _.get( label, lang, label[ defaultLang ] );

}


function _singleLanguage( fields, language, event ) {

  fields.forEach( field => {

    const defaultLang = _.first( _.keys( _.get( event, field ) ) );

    const value = _.get( event, field + '.' + language, _.get( event, field + '.' + defaultLang, null ) );

    event = _.set( event, field, value );

  } );

  return event;

}


function _formattedDates( timings, timezone, lang = 'fr' ) {

  moment.locale( lang );

  return timings.map( t => {

    const begin = moment.tz( t.start, timezone );
    const end = moment.tz( t.end, timezone );

    t.date = begin.format( 'YYYY/MM/DD' );
    t.day = begin.format( 'Do MMMM' );
    t.weekday = begin.format( 'dddd' );
    t.year = begin.format( 'YYYY' );
    t.beginHours = begin.format( 'HH' );
    t.beginMinutes = begin.format( 'mm' );
    t.endHours = end.format( 'HH' );
    t.endMinutes = end.format( 'mm' );

    return t;

  } ).reduce( ( dates, timing ) => {

    let dateIndex = dates.map( d => d.date ).indexOf( timing.date );

    if ( dateIndex === -1 ) {

      dates.push( _.pick( timing, [ 'date', 'day', 'weekday', 'year' ] ) );
      dateIndex = dates.length - 1;
      dates[ dateIndex ].timings = [];

    }

    dates[ dateIndex ].timings.push( _.omit( timing, [ 'date', 'day', 'weekday', 'year' ] ) );

    return dates;

  }, [] );

}


function _passedFlag( timings, timezone ) {

  const now = moment.tz( timezone );

  return timings.every( timing => moment.tz( timing.end, timezone ).diff( now ) < 0 );

}


function _closestDiffWithNow( timings, passed, timezone ) {

  const now = moment.tz( timezone );

  if ( passed ) {
    return Math.abs( timings
      .map( timing => moment.tz( timing.end, timezone ).diff( now ) )
      .sort( ( a, b ) => a - b )
      .pop()
    );
  }

  const diffs = timings
    .map( timing => moment.tz( timing.start, timezone ).diff( now ) )
    .sort( ( a, b ) => a - b );

  const firstNext = diffs.find( v => v >= 0 );

  return firstNext ? firstNext : diffs.shift();

}
