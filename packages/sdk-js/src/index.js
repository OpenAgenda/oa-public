import _ from 'lodash';
import superagent from 'superagent';
import superagentUse from 'superagent-use';
import superagentPrefix from 'superagent-prefix';
import parseJsonResponse from './utils/parseJsonResponse';
import Events from './Events';
import Locations from './Locations';

export default class OaSdk {
  constructor( options ) {
    this.params = _.merge( {
      baseURL: 'https://api.openagenda.com',
      publicKey: null,
      secretKey: null
    }, options );

    this.accessToken = null;
    this.expiresIn = null;

    this.agent = superagentUse( superagent ).use( superagentPrefix( this.params.baseURL ) );
  }

  events = new Events( this );
  locations = new Locations( this );

  async connect( secretKey ) {
    const time = new Date().getTime();

    if ( !this.params.secretKey ) {
      this.params.secretKey = secretKey;
    }

    const response = await this.agent
      .post( '/v1/requestAccessToken' )
      .type( 'form' )
      .accept( 'json' )
      .send( {
        'grant-type': 'authorization_code',
        code: secretKey || this.params.secretKey
      } )
      .then( parseJsonResponse() );

    this.accessToken = response.body.access_token;
    this.expiresIn = response.body.expires_in;
    this.requestTokenTime = time;

    return response;
  }

  async refreshToken() {
    if ( this.tokenIsExpired() ) {
      await this.connect();
    }
  }

  tokenIsExpired() {
    if ( !this.accessToken ) {
      return true;
    }

    return new Date().getTime() > this.requestTokenTime + (this.expiresIn * 1000);
  }
}
