module.exports = {
  attributes: {
    lang: 'data-lang',
    config: 'data-cbctl',
    count: 'data-count'
  },
  selector: '.cbpgpr',
  backupSelector: '[data-oapr]',
  backupClasses: 'oa-preview',
  timeout: 5000,
  defaultLang: 'fr',
  count: 3,
  res: {
    all: {
      json: '//openagenda.com/agendas/{uid}/events.json',
      eventPart: '/events/{uid}',
      embedEventPart: '?search[uid]={uid}'
    },
    dev: {
      json: '//d.openagenda.com/agendas/{uid}/events.json',
      eventPart: '/events/{uid}',
      embedEventPart: '?search[uid]={uid}'
    },
    tpl: {
      json: '/server/testdata/previewwidgetres.json',
      page: '#page',
      eventPart: '#/events/{uid}',
      embedEventPart: '#?search[uid]={uid}'
    }
  }
}