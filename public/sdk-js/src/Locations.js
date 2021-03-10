import parseJsonResponse from './utils/parseJsonResponse';
import baseUrl from './baseUrl';

export default class Locations {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async create(agendaUid, data) {
    /*
     * name
     * address
     * latitude
     * longitude
     * */

    await this.sdk.refreshToken();

    return this.sdk.agent
      .post(`${baseUrl.v1}/locations`)
      .type('form')
      .accept('json')
      .field({
        access_token: this.sdk.accessToken,
        nonce: this.sdk.getNonce(),
        data: JSON.stringify({ ...data, agenda_uid: agendaUid }),
      })
      .then(parseJsonResponse)
      .then(v => v.body);
  }
}
