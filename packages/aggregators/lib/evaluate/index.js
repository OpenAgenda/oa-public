"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const evaluateTags = require( './tags' );
const evaluateLocation = require( './location' );

module.exports = ( rules, data ) => {

  let updated = data;

  for ( const rule of [].concat( rules ) ) {

    const required = _.get( rule, 'required', true );

    let matches = true;

    if ( _.get( rule, 'query.tags' ) && !evaluateTags( data.tags, rule.query.tags ) ) {
      matches = false;
    }

    if ( matches && _.get( rule, 'query.location' ) && !evaluateLocation( data.location, rule.query.location ) ) {
      matches = false;
    }

    const otherRuleFields = Object.keys( _.get( rule, 'query', {} ) )
      .filter( field => ![ 'tags', 'location' ].includes( field ) );

    for ( const ruleField of otherRuleFields ) {
      if ( matches && ( rule.query[ ruleField ] !== _.get( data, ruleField ) ) ) {
        matches = false;
      }
    }

    if ( matches && rule.truthy ) {
      for ( const truthyField of rule.truthy ) {
        const value = _.get( data, truthyField );
        matches = _.isArray( value ) ? !!value.length : !!value;
        if ( !matches ) break;
      }
    }

    if ( !matches && required ) {
      return null;
    } else if ( !matches ) {
      continue;
    }

    const transform = _getTransform( rule );

    if ( transform ) {
      updated = ih( updated, transform );
    }

  }

  return updated;

}

function _getTransform( rule ) {

  if ( rule.transform ) return rule.transform;

  if ( !rule.value ) return null;

  return Object.keys( rule.value ).reduce( ( transform, field ) => _.set(
    transform,
    field,
    { $set: rule.value[ field ] }
  ), {} );

}
