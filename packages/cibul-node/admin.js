"use strict";

const webModules = [
  require('./admin/back')('/admin'),
  require('./admin/agendas.back')('/admin/agendas'),
  require('./admin/activities.back')('/admin/activities'),
];

module.exports = app => {

  webModules.forEach( m => m.load( app ) );

};

module.exports.webModules = webModules;
