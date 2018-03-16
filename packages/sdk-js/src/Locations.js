import _ from 'lodash';
import parseJsonResponse from './utils/parseJsonResponse';

export default class Locations {
  constructor( sdk ) {
    this.sdk = sdk;
  }

  async create( agendaUid, data ) {
    /*
     * name
     * address
     * latitude
     * longitude
     * */

    await this.sdk.refreshToken();

    return this.sdk.agent
      .post( `/v1/locations` )
      .type( 'form' )
      .accept( 'json' )
      .field( {
        access_token: this.sdk.accessToken,
        nonce: _.random( Math.pow( 10, 6 ) ),
        data: JSON.stringify( { ...data, agenda_uid: agendaUid } )
      } )
      .then( parseJsonResponse() )
      .then( v => v.body );
  }
}
