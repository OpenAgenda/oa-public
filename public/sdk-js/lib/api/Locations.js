"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class Locations {
  constructor(sdk) {
    this.sdk = sdk;
  }
  get(agendaUid, locationUid) {
    return this.sdk.api.get("/agendas/".concat(agendaUid, "/locations/").concat(locationUid)).then(v => v.data.location);
  }
  list(agendaUid, data) {
    return this.sdk.api.get("/agendas/".concat(agendaUid, "/locations"), {
      params: data
    }).then(v => v.data);
  }
  create(agendaUid, data) {
    /*
     * name
     * address
     * latitude
     * longitude
     * countryCode
     * */

    return this.sdk.api.post("/agendas/".concat(agendaUid, "/locations"), data).then(v => v.data.location);
  }
  patch(agendaUid, eventUid, data) {
    return this.sdk.api.patch("/agendas/".concat(agendaUid, "/locations/").concat(eventUid), data).then(v => v.data.location);
  }
  update(agendaUid, eventUid, data) {
    return this.sdk.api.post("/agendas/".concat(agendaUid, "/locations/").concat(eventUid), data).then(v => v.data.location);
  }
  delete(agendaUid, eventUid) {
    return this.sdk.api.delete("/agendas/".concat(agendaUid, "/locations/").concat(eventUid)).then(v => v.data.location);
  }
}
exports.default = Locations;
module.exports = exports.default;
//# sourceMappingURL=Locations.js.map