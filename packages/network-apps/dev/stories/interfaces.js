"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = fixtures => {

  const networks = fixtures.networks;

  return {
    listNetworks,
    getNetwork,
    getNetworkSchema,
    setNetworkSchema,
    getNetworkAgendas,
    createNetwork,
    getEventSchema,
    addAgendaToNetwork
  }

  async function getNetworkAgendas( uid ) {

    return _.get( _.find( networks, { uid } ), 'agendas', [] );

  }

  async function addAgendaToNetwork( uid, slug ) {

    const addedAgenda = {
      uid: Math.ceil( Math.random() * 99999999 ),
      title: 'Un agenda ' + JSON.stringify( new Date )
    };

    _.assign( networks, ih( networks, _.set( {},
      [ _.findIndex( networks, { uid } ), 'agendas' ],
      { $splice: [ [ 0, 0, addedAgenda ] ] }
    ) ) );

    return addedAgenda;

  }

  async function setNetworkSchemaFields( uid, fields ) {

    console.log( 'committing network schema %s', uid );

    _.set( networks, [
      _.findIndex( networks, { uid } ),
      'schema'
    ], { fields } );

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

    return _.get( _.first( networks, { uid } ), 'schema', null );

  }

  async function listNetworks() {

    return networks.map( _.partialRight( _.pick, [ 'uid', 'title' ] ) );

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

}
