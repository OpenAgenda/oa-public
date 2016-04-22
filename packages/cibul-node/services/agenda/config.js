'use strict';

module.exports = {

  adminTabs: [ {
    section : 'manage',
    key : 'events',
    label : 'Events',
    access: 'moderator',
    uri : 'agendaAdminShow'
  }, {
    section : 'manage',
    key : 'contributors',
    label : 'Contributors',
    access: 'moderator',
    uri : 'agendaAdminContributors'
  }, {
    section : 'manage',
    key : 'moderators',
    label : 'Moderators',
    uri : 'agendaAdminModerators',
    access: 'administrator',
    requiredCred: 'moderators'
  }, {
    section : 'manage',
    key : 'locations',
    label : 'Locations',
    uri : 'agendaAdminLocations',
    access: 'moderator'
  }, {
    section : 'manage',
    key : 'categories',
    label : 'Categories and Tags',
    access: 'administrator',
    uri : 'agendaAdminCategories'
  }, {
    section : 'manage',
    key : 'sources',
    label : 'Sources',
    uri : 'agendaAdminSources',
    access: 'administrator',
    requiredCred: 'aggregator'
  }, {
    section : 'export',
    key : 'facebook',
    label: 'Facebook',
    access: 'administrator',
    uri: 'facebookShow'
  }, {
    section : 'export',
    key : 'swapcard',
    label : 'Swapcard',
    uri : 'serviceIndex',
    uriParams : { service : 'swapcard' },
    access: 'administrator',
    requiredCred: 'swapcard'
  }, {
    section : 'export',
    key : 'web',
    label : 'Web Integration',
    access: 'administrator',
    uri : 'agendaAdminWeb'
  }, {
    section : 'export',
    key : 'indesign',
    label : 'Indesign - Xml',
    uri : 'agendaAdminIndesign',
    access: 'administrator',
    requiredCred: 'indesign'
  }, {
    section : 'export',
    key: 'emailstrategie',
    label: 'EmailStrategie',
    uri: 'agendaAdminEmailStrategie',
    access: 'administrator',
    requiredCred: 'emailstrategie'
  }, {
    section : 'settings',
    key : 'administrators',
    label : 'Administrators',
    access: 'administrator',
    uri : 'agendaAdminAdministrators'
  }, {
    section : 'settings',
    key : 'settings',
    label : 'Settings',
    access: 'administrator',
    uri : 'agendaAdminSettings'
  } ]

}