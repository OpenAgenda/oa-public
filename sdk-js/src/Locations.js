export default class Locations {
  constructor(sdk) {
    this.sdk = sdk;
  }

  get(agendaUid, locationUid) {
    return this.sdk.api
      .get(`/agendas/${agendaUid}/locations/${locationUid}`)
      .then(v => v.data.location);
  }

  list(agendaUid, data) {
    return this.sdk.api
      .get(`/agendas/${agendaUid}/locations`, {
        params: data
      })
      .then(v => v.data);
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
      .post(`/agendas/${agendaUid}/locations`, data)
      .then(v => v.data.location);
  }

  patch(agendaUid, eventUid, data) {
    return this.sdk.api
      .patch(`/agendas/${agendaUid}/locations/${eventUid}`, data)
      .then(v => v.data.location);
  }

  update(agendaUid, eventUid, data) {
    return this.sdk.api
      .post(`/agendas/${agendaUid}/locations/${eventUid}`, data)
      .then(v => v.data.location);
  }

  delete(agendaUid, eventUid) {
    return this.sdk.api
      .delete(`/agendas/${agendaUid}/locations/${eventUid}`)
      .then(v => v.data.location);
  }
}
