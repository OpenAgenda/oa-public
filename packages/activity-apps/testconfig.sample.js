module.exports = {
  mysql: {
    database: 'oa_members_test',
    host: 'localhost',
    user: 'root',
    password: 'grut'
  },
  schemas: {
    agenda: 'agenda',
    agendaEvent: 'agenda_event',
    apiKeySet: 'api_key_set',
    event: 'event',
    legacyCredentialSet: 'legacy_credential_set',
    occurrence: 'occurrence',
    stakeholder: 'stakeholder',
    stakeholderSettings: 'agenda_stakeholder_settings',
    user: 'user'
  },

  mw: {
    limit: 20
  }
};
