module.exports = {
  attributes: {
    lang: 'data-lang',
    config: 'data-cbctl',
    count: 'data-count'
  },
  selector: '.cbpgpr',
  timeout: 5000,
  defaultLang: 'fr',
  count: 3,
  res: {
    all: {
      json: '//openagenda.com/agendas/{uid}/events.json',
      page: '//openagenda.com/agendas/{uid}',
      eventPart: '/events/{slug}',
      embedEventPart: '?search[uid]={uid}'
    },
    dev: {
      json: '//d.openagenda.com/agendas/{uid}/events.json',
      page: '//d.openagenda.com/agendas/{uid}',
      eventPart: '/events/{slug}',
      embedEventPart: '?search[uid]={uid}'
    },
    tpl: {
      json: '/server/testdata/previewwidgetres.json',
      page: '#page',
      eventPart: '#/events/{slug}',
      embedEventPart: '#?search[uid]={uid}'
    }
  }
}