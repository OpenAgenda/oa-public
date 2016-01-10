"use strict";

module.exports = {

  adminTabs: [ {
    section : "manage",
    key : "events",
    label : "Events",
    uri : "agendaAdminShow"
  }, {
    section : "manage",
    key : "contributors",
    label : "Contributors",
    uri : "agendaAdminContributors"
  }, {
    section : "manage",
    key : "moderators",
    label : "Moderators",
    uri : "agendaAdminModerators",
    requiredCred: 'moderators'
  }, {
    section : "manage",
    key : "locations",
    label : "Locations",
    uri : "agendaAdminLocations",
    requiredCred: 'location'
  }, {
    section : "manage",
    key : "dataviz",
    label : "Dataviz",
    uri : "agendaAdminDataviz"
  }, {
    section : "manage",
    key : "categories",
    label : "Categories and Tags",
    uri : "agendaAdminCategories"
  }, {
    section : "manage",
    key : "sources",
    label : "Sources",
    uri : "agendaAdminSources",
    requiredCred: "aggregator"
  }, {
    section : "export",
    key : "facebook",
    label: "Facebook",
    uri: "facebookShow"
  }, {
    section : "export",
    key : "swapcard",
    label : "Swapcard",
    uri : "serviceIndex",
    uriParams : { service : "swapcard" },
    requiredCred: 'swapcard'
  }, {
    section : "export",
    key : "web",
    label : "Web Integration",
    uri : "agendaAdminWeb"
  }, {
    section : "export",
    key : "indesign",
    label : "Indesign - Xml",
    uri : "agendaAdminIndesign",
    requiredCred: 'indesign'
  }, {
    section : "export",
    key: "emailstrategie",
    label: "EmailStrategie",
    uri: "agendaAdminEmailStrategie",
    requiredCred: 'emailstrategie'
  }, {
    section : "settings",
    key : "administrators",
    label : "Administrators",
    uri : "agendaAdminAdministrators"
  }, {
    section : "settings",
    key : "settings",
    label : "Settings",
    uri : "agendaAdminSettings"
  } ]

}