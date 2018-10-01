'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex( schemas.agenda ).del();

  return knex( schemas.agenda ).insert( [
    {
      id: "218",
      title: "La Gargouille",
      owner_id: "1",
      slug: "la-gargouille",
      description: "Des \u00e9v\u00e9nements \u00e0 Paris",
      image: "agenda48959239.jpg",
      url: "",
      collaborative: "1",
      created_at: "2012-04-19 12:46:46",
      updated_at: "2018-08-14 00:10:15",
      uid: "48959239",
      main: "0",
      store:
        '{"mails":false,"publicationMessage":"Bonjour,\\n\\nNous avons bien re\u00e7u votre proposition d\u2019\u00e9v\u00e9nement et nous vous en remercions.\\n\\nVotre \u00e9v\u00e9nement est labellis\u00e9 et publi\u00e9 sur le site internet de la Semaine de l\u2019industrie.\\n\\nVeuillez trouver ci-joint le lien pour t\u00e9l\u00e9charger le kit de communication : http://www.entreprises.gouv.fr/files/files/directions_services/semaine-industrie/kit-com/kit-de-comm-2016.zip\\n\\nVous pouvez nous transmettre tout support de communication (vid\u00e9os, articles, photos\u2026) que nous pourrions relayer sur la Page Facebook de la Semaine de l\u2019industrie et sur le site internet.\\ncontact-semaine-industrie.dge@finances.gouv.fr\\n\\nPour toute information compl\u00e9mentaire, n\u2019h\u00e9sitez pas \u00e0 nous contacter !!!\\n\\nBien cordialement,\\n\\nLe Comit\u00e9 de validation des labellisations","fb":{"token":"CAADGUgYTo9EBAHyiiO3URlqxXlMAQyj5EgmNKpAf5d92LkZAaffYVfmx2bCRyGdxSyXKoRQFgcrBPqqsE8uPddp8KWZAyKWpfMZCZCAZA7jL5PhY1qwObg0YyZCnxiZCqt2CDhIJqVCJDmSjW5apghKe9w14k37Qv4ZBYp2q6dIARqaNHLgVtqRGYR5hXs2KdiAZD","error":false,"profile":false,"profileId":false,"page":"La Gargouille","pageId":"255978121227306"},"order":"relative","moderated":true,"send_invitation_email":true,"contributorconfigstep":-1,"cFields":{"organization":[],"contact_number":[],"contact_name":[],"contact_position":[],"email":[]},"form":{"fields":[{"name":"references","display":true},{"name":"image","title":{"fr":"Picto de l\'\u00e9v\u00e9nement","en":"Visual of the event"}},{"name":"credits","label":{"fr":"Cr\u00e9dits de l\'\u00e9v\u00e9nement *","en":"Image credits *"},"info":{"fr":"C\'est obligatoire","en":"Its compulsory"},"placeholder":{"fr":"Le placeholder","en":"The placeholder"}}]},"customFields":[{"name":"picto","fieldType":"image","copy":true,"optional":true,"label":{"fr":"Picto","en":"Picto"}},{"name":"email","type":"private","fieldType":"text","optional":true,"label":{"fr":"Email de l\'organisateur","en":"Organizer email"}},{"name":"pdf","fieldType":"file","extension":"pdf","type":"public","label":{"fr":"Charger un pdf, n\'importe","en":"Load a pdf, any pdf"},"info":{"fr":"Fonction en test","en":"Feature being tested"}}],"emailstrategie":3,"dataviz":"[{\\"sections\\":[\\"city\\"]}]"}',
      contribution_type: "2",
      contribution_info: "",
      official: "1",
      credentials:
        '{"moderators":true,"tags":true,"embedsHead":false,"embedsTemplates":false,"indesign":false,"activatingInvitations":false,"emailstrategie":false,"aggregator":true,"invitationMessage":true,"prioritizedAggregator":false,"calendarView":true, "docxExport":true}',
      settings:
        '{"mailing":{"eventAggregation":true},"contribution":{"type":2,"defaultState":0,"canPublish":["administrators"],"defaultLang":null,"allowLocationCreate":true,"message":null,"useFields":true,"authorizedIPAddresses":["176.205.248.239","92.154.49.68","5.49.87.90","2.49.185.113","176.205.193.148"],"survey":false,"messages":{"instructions":null,"publication":"Bonjour,\\n\\nNous avons bien re\u00e7u votre proposition d\u2019\u00e9v\u00e9nement et nous vous en remercions.\\n\\nVotre \u00e9v\u00e9nement est labellis\u00e9 et publi\u00e9 sur le site internet de la Semaine de l\u2019industrie.\\n\\nVeuillez trouver ci-joint le lien pour t\u00e9l\u00e9charger le kit de communication : http://www.entreprises.gouv.fr/files/files/directions_services/semaine-industrie/kit-com/kit-de-comm-2016.zip\\n\\nVous pouvez nous transmettre tout support de communication (vid\u00e9os, articles, photos\u2026) que nous pourrions relayer sur la Page Facebook de la Semaine de l\u2019industrie et sur le site internet.\\ncontact-semaine-industrie.dge@finances.gouv.fr\\n\\nPour toute information compl\u00e9mentaire, n\u2019h\u00e9sitez pas \u00e0 nous contacter !!!\\n\\nBien cordialement,\\n\\nLe Comit\u00e9 de validation des labellisations","complete":null}},"translation":{"enabled":false,"source":"fr","sets":[],"service":"reverso","options":null}}',
      private: "1",
      form_schema_id: "1",
      officialized_at: "2017-08-11 15:42:18",
      indexed: "1"
    }
  ] );
};
