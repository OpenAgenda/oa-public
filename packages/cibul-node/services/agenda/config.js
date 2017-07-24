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
    uri : 'agendaAdminContributors',
    version: 'members:1'
  }, {
    section : 'manage',
    key : 'moderators',
    label : 'Moderators',
    uri : 'agendaAdminModerators',
    access: 'administrator',
    requiredCred: 'moderator',
    version: 'members:1'
  }, {
    section : 'manage',
    key : 'members',
    label : 'Members',
    uri : 'agendaAdminMembers',
    access: 'moderator',
    version: 'members:2'
  }, {
    section : 'manage',
    key : 'activities',
    label : 'Activities',
    uri : 'agendaAdminActivityApps',
    access: 'moderator',
    badge: {
      link: '#',
      label: 'newTab'
    }
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
    className: 'disabled',
    access: 'administrator',
    uri : 'categoryTagShow'
  }, {
    section : 'manage',
    key : 'sources',
    label : 'Sources',
    uri : 'aggregatorSourcesApp',
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
    uri : 'agendaAdminAdministrators',
    version: 'members:1'
  }, {
    section : 'settings',
    key : 'settings_profile',
    label : 'Profile',
    access: 'administrator',
    uri : 'agendaSettingsEditApp',
    suffix : '/profile'
  }, {
    section : 'settings',
    key : 'settings_contribution',
    label : 'Contribution',
    access: 'administrator',
    uri : 'agendaSettingsEditApp',
    suffix : '/contribution'
  }, {
    section : 'settings',
    key : 'customized',
    label : 'Customized',
    access: 'administrator',
    uri : 'customizedShow'
  }, {
    section : 'settings',
    key: 'settings_advanced',
    label : 'Advanced',
    access : 'administrator',
    uri : 'agendaSettingsEditApp',
    suffix : '/advanced',
    badge: {
      link: '#',
      label: 'newTab'
    }
  } ]

}