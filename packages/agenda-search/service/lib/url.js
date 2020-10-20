"use strict";

const _ = require('lodash');

module.exports = {
  agenda,
  network,
  contribute
}

function contribute(agenda, options = {}) {
  const params ={
    path: undefined,
    lang: undefined,
    ...options
  };

  const prefix = params.path === undefined ? '' : params.path;

  return prefix + '/agendas/' + agenda.uid + '/contribute' + (params.lang ? '?lang=' + params.lang : '');
}

function network(network, options) {
  const params = {
    paths: undefined,
    lang: undefined,
    ...options
  };

  const prefix = params.path === undefined ? '' : params.path;

  return prefix + '?network=' + network.uid;
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
