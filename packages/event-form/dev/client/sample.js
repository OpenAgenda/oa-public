module.exports = [ {
  fields: [ {
    field: 'networkfield',
    label: {
      fr: 'Champ multilingue de réseau',
      en: 'Multilingual Network field'
    },
    languages: [],
    fieldType: 'text'
  } ]
}, {
  fields: [ {
    field: 'languages',
    fieldType: 'abstract'
  }, {
    field: 'title',
    fieldType: 'abstract',
    default: 'Le titre de l\'événement'
  }, {
    field: 'keywords',
    fieldType: 'abstract',
    display: false
  }, {
    field: 'agendafield',
    label: {
      fr: 'Champ d\'agenda',
      en: 'Agenda field'
    },
    fieldType: 'text'
  }, {
    field: 'references',
    fieldType: 'abstract'
  }, {
    field: 'location',
    fieldType: 'abstract',
    default: { uid: 14840617 },
    allowCreate: false
  }, {
    field: 'timings',
    fieldType: 'abstract',
    default: [ {
      begin: new Date( '2018-11-27T10:00' ),
      end: new Date( '2018-11-27T11:00' )
    } ],
    enabledRanges: [ {
      begin: '2018-11-27',
      end: '2018-11-29'
    } ]
  } ]
} ]
