"use strict";

const domain = require( '../../domain' );

module.exports = {
  attributes: {
    lang: 'data-lang',
    config: 'data-cbctl',
    count: 'data-count',
    json: 'data-json'
  },
  selector: '.cbpgpr',
  backupSelector: '[data-oapr]',
  backupClasses: 'oa-preview',
  timeout: 5000,
  defaultLang: 'fr',
  count: 3,
  res: {
    all: {
      json: '//' + domain + '/agendas/{uid}/events.json',
      eventPart: '/events/{uid}',
      embedEventPart: '?oaq[uid]={uid}'
    },
    dev: {
      json: '//d.openagenda.com/agendas/{uid}/events.json',
      eventPart: '/events/{uid}',
      embedEventPart: '?oaq[uid]={uid}'
    },
    tpl: {
      json: '/server/testdata/previewwidgetres.json',
      page: '#page',
      eventPart: '#/events/{uid}',
      embedEventPart: '#?oaq[uid]={uid}'
    }
  }
}
