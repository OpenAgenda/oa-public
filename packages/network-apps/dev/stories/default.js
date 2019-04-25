"use strict";

const _ = require( 'lodash' );

const networks = [ {
  uid: 1,
  title: 'Orléans Métropole'
}, {
  uid: 2,
  title: 'Bordeaux Métropole'
}, {
  uid: 3,
  title: 'Ville de Genève'
} ];

const networkSchemas = {
  1: {
    fields: [ {
      fieldType: 'text',
      field: 'A network field',
      label: 'Un champ de réseau'
    } ]
  }
}

const networkAgendas = {
  1: [ {
    uid: 49409342,
    title: 'Ville d\'Olivet'
  }, {
    uid: 97890938,
    title: 'Ville de Semoy'
  }, {
    uid: 3991265,
    title: 'Agenda de Chécy'
  } ]
}


module.exports = {
  interfaces: {
    listNetworks,
    getNetwork,
    getNetworkSchema,
    setNetworkSchema,
    getNetworkAgendas,
    createNetwork,
    getEventSchema,
    addAgendaToNetwork
  }
}

async function getNetworkAgendas( uid ) {

  return _.get( networkAgendas, uid, [] );

}

async function addAgendaToNetwork( slug ) {

  // oh good, we found it
  return {
    uid: 12347,
    title: 'Un super agenda'
  }

}

async function setNetworkSchema( uid, schema ) {

  console.log( 'committing network schema %s', uid );

  networkSchemas[ uid ] = schema;

  return true;

}

async function createNetwork( data ) {

  console.log( 'creating new network %s', data.title );

  data.uid = Math.floor( Math.random() * 1000000 );

  networks.push( data );

  return true;

}

async function getNetwork( uid ) {

  return networks.filter( n => n.uid === uid )[ 0 ];

}

async function getNetworkSchema( uid ) {

  return networkSchemas[ uid ]

}

async function listNetworks() {

  return networks;

}

async function getEventSchema() {

  return {
    fields: [ {
      fieldType: 'text',
      field: 'title',
      label: 'Titre'
    } ]
  }

}
