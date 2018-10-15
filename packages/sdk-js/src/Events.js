import _ from 'lodash';
import parseJsonResponse from './utils/parseJsonResponse';

export default class Events {
  constructor( sdk ) {
    this.sdk = sdk;
  }

  async get( eventUid ) {
    await this.sdk.refreshToken();

    return this.sdk.agent
      .get( `/v1/events/${eventUid}` )
      .accept( 'json' )
      .query( { key: this.sdk.params.publicKey } )
      .then( parseJsonResponse() )
      .then( v => v.body.data );
  }

  async create( agendaUid, data ) {
    /*
     * title
     * description
     * longDescription
     * keywords
     * conditions
     * registration
     * locationUid
     * timings
     * age
     * accessibility
     * ...customs
     * */

    await this.sdk.refreshToken();

    return this.sdk.agent
      .post( `/v2/agendas/${agendaUid}/events` )
      .type( 'form' )
      .accept( 'json' )
      .field( {
        access_token: this.sdk.accessToken,
        nonce: _.random( Math.pow( 10, 6 ) ),
        data: JSON.stringify( data )
      } )
      .then( parseJsonResponse() )
      .then( v => v.body );
  }

  async update( agendaUid, eventUid, data ) {
    await this.sdk.refreshToken();

    return this.sdk.agent
      .post( `/v2/agendas/${agendaUid}/events/${eventUid}` )
      .type( 'form' )
      .accept( 'json' )
      .field( {
        access_token: this.sdk.accessToken,
        nonce: _.random( Math.pow( 10, 6 ) ),
        data: JSON.stringify( data )
      } )
      .then( parseJsonResponse() )
      .then( v => v.body );
  }

  async delete( agendaUid, eventUid ) {
    await this.sdk.refreshToken();

    return this.sdk.agent
      .delete( `/v2/agendas/${agendaUid}/events/${eventUid}` )
      .type( 'form' )
      .accept( 'json' )
      .field( {
        access_token: this.sdk.accessToken,
        nonce: _.random( Math.pow( 10, 6 ) )
      } )
      .then( parseJsonResponse() )
      .then( v => v.body );
  }
}
