"use strict";

const _ = require( 'lodash' );

module.exports = {
  agenda: agenda
}

function agenda( agenda, options = {} ) {

  const params = _.assign( {
    path: undefined,
    lang: undefined
  }, options );

  let res = '#',

  prefix = params.path === undefined ? '' : params.path;

  if ( !agenda ) {

    return prefix + res + ( params.lang ? '?lang=' + params.lang : '' );

  }

  if ( agenda.slug ) {

    return prefix  + '/' + agenda.slug + ( params.lang ? '?lang=' + params.lang : '' );

  }

  if ( agenda.uid ) {

    return prefix + '/agendas/' + agenda.uid + ( params.lang ? '?lang=' + params.lang : '' );

  }

  return '#';

}
