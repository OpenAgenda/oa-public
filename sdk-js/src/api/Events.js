import qs from 'qs';

export default class Events {
  constructor(sdk) {
    this.sdk = sdk;
  }

  get(agendaUid, eventUid) {
    return this.sdk.api
      .get(`agendas/${agendaUid}/events/${eventUid}`)
      .json()
      .then((v) => v.event);
  }

  list(agendaUid, data) {
    return this.sdk.api
      .get(`agendas/${agendaUid}/events`, {
        searchParams: qs.stringify(data),
      })
      .json();
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
      .post(`agendas/${agendaUid}/events`, { json: data })
      .json()
      .then((v) => v.event);
  }

  patch(agendaUid, eventUid, data) {
    return this.sdk.api
      .patch(`agendas/${agendaUid}/events/${eventUid}`, { json: data })
      .json()
      .then((v) => v.event);
  }

  update(agendaUid, eventUid, data) {
    return this.sdk.api
      .post(`agendas/${agendaUid}/events/${eventUid}`, { json: data })
      .json()
      .then((v) => v.event);
  }

  delete(agendaUid, eventUid) {
    return this.sdk.api
      .delete(`agendas/${agendaUid}/events/${eventUid}`)
      .json()
      .then((v) => v.event);
  }
}
