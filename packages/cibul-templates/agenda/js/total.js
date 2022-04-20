"use strict";

/**
 * Render the total line appearing above the list, based on current total events and wether events are passed
 * or not. Initializes on data- attributes, reads href to know the current state of temporal filters ( passed, from & to )
 */

const params = {
  attributes: {
    total: 'data-total',
    passedIncluded: 'data-passed-included'
  }
},

du = require( '@openagenda/dom-utils' ),

_ = require( 'lodash' ),

qs = require( 'qs' ),

getLabelFactory = require( '@openagenda/labels' ),

labels = require( '@openagenda/labels/agendas/total' );

module.exports = function( selector, lang ) {

  let elem = du.el( selector ),

  getLabel = getLabelFactory( labels, lang );

  _render();

  return _update;

  function _update( newCount ) {

    let queryPassedIncluded = ( _readHrefQuery().oaq || {} ).passed;

    if ( typeof queryPassedIncluded === 'undefined' ) {

      queryPassedIncluded = false;

    }

    queryPassedIncluded = !!parseInt( queryPassedIncluded );

    elem.setAttribute( params.attributes.total, newCount );

    elem.setAttribute( params.attributes.passedIncluded, queryPassedIncluded ? 1 : 0 );

    _render();

  }

  function _render() {

    if ( !elem ) return;

    let passedIncluded = !!parseInt( elem.getAttribute( params.attributes.passedIncluded ) );

    elem.innerHTML = _.template(  `
<span>
  <%= !handlePassed || passedIncluded
    ? (total > 1 || total === 0)
      ? __('totalEvents', { count: total })
      : __('totalEvent')
    : (total > 1 || total === 0)
      ? __('upcomingEvents', { count: total })
      : __('upcomingEvent') %>
</span><% if ( handlePassed && !passedIncluded) { %> - 
<a href="<%= link %>"><%= __( 'includePassed' ) %></a><% } %>
    `)( {
      total: parseInt(elem.getAttribute( params.attributes.total ), 10),
      passedIncluded: passedIncluded,
      handlePassed: !_hasOtherTimeFilter(),
      link: _buildLink( passedIncluded ),
      __: getLabel
    } );

  }


  function _buildLink( passedIncluded ) {

    let query = _readHrefQuery(),

    updatedQuery = { oaq: query.oaq || {} };

    updatedQuery.oaq.passed = !!passedIncluded ? 0 : 1;

    if ( typeof query.lang !== 'undefined' ) updatedQuery.lang = query.lang;

    return window.location.href.split( '?' )[ 0 ] + '?' + qs.stringify( updatedQuery )

  }

}

function _hasOtherTimeFilter() {

  let query = _readHrefQuery().oaq || {};

  return !!( query.from || query.to );

}

function _readHrefQuery() {

  let href = window.location.href,

  current = href.split( '?' ).length === 2  ? href.split( '?' )[ 1 ] : '';

  return qs.parse( current );

}
