"use strict";

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


module.exports = {
  interfaces: {
    listNetworks,
    getNetworkAndSchema,
    setNetworkSchema,
    createNetwork,
    getEventSchema
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

async function getNetworkAndSchema( uid ) {

  return {
    network: networks.filter( n => n.uid === uid )[ 0 ],
    schema: networkSchemas[ uid ]
  }

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
