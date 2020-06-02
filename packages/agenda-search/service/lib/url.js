"use strict";

const _ = require('lodash');

module.exports = {
  agenda
}

function agenda(agenda, options = {}) {
  const params ={
    path: undefined,
    lang: undefined,
    ...options
  };

  const prefix = params.path === undefined ? '' : params.path;

  if (!agenda) {
    return prefix + '#' + (params.lang ? '?lang=' + params.lang : '');
  }

  if (agenda.slug) {
    return prefix  + '/' + agenda.slug + (params.lang ? '?lang=' + params.lang : '');
  }

  if (agenda.uid) {
    return prefix + '/agendas/' + agenda.uid + (params.lang ? '?lang=' + params.lang : '');
  }

  return '#';
}
