"use strict";

module.exports = {
  agenda: agenda
}

function agenda( agenda, path ) {

  let res = '#',

  prefix = path === undefined ? '' : path;

  if ( !agenda ) {

    return prefix + res;

  }

  if ( agenda.slug ) {

    return prefix  + '/' + agenda.slug;

  }

  if ( agenda.uid ) {

    return prefix + '/agendas/' + agenda.uid;

  }

  return '#';

}