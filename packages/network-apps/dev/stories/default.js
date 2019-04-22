"use strict";

module.exports = {
  interfaces: {
    listNetworks,
    getNetworkAndSchema,
    setNetworkSchema,
    getEventSchema
  }
}

async function setNetworkSchema( uid, schema ) {

  console.log( 'committing network schema %s', uid );
  console.log( schema );

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
