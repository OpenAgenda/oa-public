import parseJsonResponse from './utils/parseJsonResponse';
import baseUrl from './baseUrl';

export default class Events {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async get(eventUid) {
    await this.sdk.refreshToken();

    return this.sdk.agent
      .get(`${baseUrl.v1}/events/${eventUid}`)
      .accept('json')
      .query({ key: this.sdk.params.publicKey })
      .then(parseJsonResponse)
      .then(v => v.body.data);
  }

  async create(agendaUid, data) {
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
      .post(`${baseUrl.v2}/agendas/${agendaUid}/events`)
      .type('form')
      .accept('json')
      .query({ key: this.sdk.params.publicKey })
      .set('access-token', this.sdk.accessToken)
      .set('nonce', this.sdk.getNonce())
      .field({
        data: JSON.stringify(data),
      })
      .then(parseJsonResponse)
      .then(v => v.body);
  }

  async update(agendaUid, eventUid, data) {
    await this.sdk.refreshToken();

    return this.sdk.agent
      .patch(`${baseUrl.v2}/agendas/${agendaUid}/events/${eventUid}`)
      .accept('json')
      .query({ key: this.sdk.params.publicKey })
      .set('access-token', this.sdk.accessToken)
      .set('nonce', this.sdk.getNonce())
      .field({
        data: JSON.stringify(data),
      })
      .then(parseJsonResponse)
      .then(v => v.body);
  }

  async delete(agendaUid, eventUid) {
    await this.sdk.refreshToken();

    return this.sdk.agent
      .delete(`${baseUrl.v2}/agendas/${agendaUid}/events/${eventUid}`)
      .type('form')
      .accept('json')
      .query({ key: this.sdk.params.publicKey })
      .set('access-token', this.sdk.accessToken)
      .set('nonce', this.sdk.getNonce())
      .then(parseJsonResponse)
      .then(v => v.body);
  }
}
