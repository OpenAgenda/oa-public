export default class Events {
  constructor(sdk) {
    this.sdk = sdk;
  }

  get(agendaUid, eventUid) {
    return this.sdk.api
      .get(`/agendas/${agendaUid}/events/${eventUid}`)
      .then(v => v.data.event);
  }

  list(agendaUid, data) {
    return this.sdk.api
      .get(`/agendas/${agendaUid}/events`, {
        params: data
      })
      .then(v => v.data);
  }

  create(agendaUid, data) {
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

    return this.sdk.api
      .post(`/agendas/${agendaUid}/events`, data)
      .then(v => v.data.event);
  }

  patch(agendaUid, eventUid, data) {
    return this.sdk.api
      .patch(`/agendas/${agendaUid}/events/${eventUid}`, data)
      .then(v => v.data.event);
  }

  update(agendaUid, eventUid, data) {
    return this.sdk.api
      .post(`/agendas/${agendaUid}/events/${eventUid}`, data)
      .then(v => v.data.event);
  }

  delete(agendaUid, eventUid) {
    return this.sdk.api
      .delete(`/agendas/${agendaUid}/events/${eventUid}`)
      .then(v => v.data.event);
  }
}
