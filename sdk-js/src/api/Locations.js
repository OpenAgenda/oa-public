import qs from 'qs';

export default class Locations {
  constructor(sdk) {
    this.sdk = sdk;
  }

  get(agendaUid, locationUid) {
    return this.sdk.api
      .get(`agendas/${agendaUid}/locations/${locationUid}`)
      .json()
      .then((v) => v.location);
  }

  list(agendaUid, data) {
    return this.sdk.api
      .get(`agendas/${agendaUid}/locations`, {
        searchParams: qs.stringify(data),
      })
      .json();
  }

  create(agendaUid, data) {
    /*
     * name
     * address
     * latitude
     * longitude
     * countryCode
     * */

    return this.sdk.api
      .post(`agendas/${agendaUid}/locations`, { json: data })
      .json()
      .then((v) => v.location);
  }

  patch(agendaUid, eventUid, data) {
    return this.sdk.api
      .patch(`agendas/${agendaUid}/locations/${eventUid}`, { json: data })
      .json()
      .then((v) => v.location);
  }

  update(agendaUid, eventUid, data) {
    return this.sdk.api
      .post(`agendas/${agendaUid}/locations/${eventUid}`, { json: data })
      .json()
      .then((v) => v.location);
  }

  delete(agendaUid, eventUid) {
    return this.sdk.api
      .delete(`agendas/${agendaUid}/locations/${eventUid}`)
      .json()
      .then((v) => v.location);
  }
}
