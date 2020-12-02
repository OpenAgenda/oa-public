'use strict';

module.exports.getKey = timing => (timing.start ? 'start' : 'begin');

module.exports.getValue = timing => timing.start || timing.begin;
