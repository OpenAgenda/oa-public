"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = fixtures => {

  const networks = fixtures.networks;

  return {
    listNetworks,
    getLoggedUser,
    getNetwork,
    getNetworkSchema,
    setNetworkSchemaFields,
    getNetworkAgendas,
    createNetwork,
    createAgenda,
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

    data.uid = _newUid()

    networks.push( data );

    return true;

  }

  async function getLoggedUser( req ) {

    return { uid: 123 };

  }

  async function createAgenda( networkUid, user, data ) {

    console.log( 'creating new agenda %s', data.title );

    const agenda = { ...data, uid: _newUid() };

    _.find( networks, { uid: networkUid } ).agendas.splice( 0, 0, agenda );

    return agenda;

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

function _newUid() {

  return Math.floor( Math.random() * 1000000 );

}
