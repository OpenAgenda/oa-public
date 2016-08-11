"use strict";

var main = require( '../../components/src/main' );

window.onload = function() {

  main( {
    searchRes: '/',
    agendaRes: '/get',
    setAgendaRes: '/set',
    stakeholdersRes: '/stakeholders'
  } );

};