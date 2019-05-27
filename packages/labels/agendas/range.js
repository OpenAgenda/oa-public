"use strict";

module.exports = {
  oneDate: {
    en: '%day%, %times%',
    fr: '%day%, %times%',
    he: '%day%, %times%',
    ar: '%day%, %times%',
    de: '%day%, %times%'
  },
  twoDates: {
    en: '%firstDate% and %lastDate%',
    fr: '%firstDate% et %lastDate%',
    he: '%firstDate% וגם %lastDate% ',
    ar: '%firstDate% و %lastDate% ',
    de: '%firstDate% und %lastDate%'
  },
  moreDates: {
    en: '%firstDate% - %lastDate%',
    fr: '%firstDate% - %lastDate%',
    he: '%firstDate% - %lastDate%',
    ar: '%firstDate% - %lastDate%',
    de: '%firstDate% - %lastDate%'
  },
  noDates: {
    en: 'no dates available',
    fr: 'aucune date disponible',
    he: 'אין תאריך זמין',
    ar: 'لا يتوفر أي تاريخ',
    de: 'keine Termine vorhanden%'
  },
  months: [
    { en: 'january', fr: 'janvier', he: 'ינואר', ar:'كانون الثاني', de:'januar'},
    { en: 'february', fr: 'février', he: 'פברואר', ar:'شباط', de:'februar' },
    { en: 'march', fr: 'mars', he: 'מרץ', ar:'آذار', de:'märz' },
    { en: 'april', fr: 'avril', he: 'אפריל', ar:'نيسان', de:'april' },
    { en: 'may', fr: 'mai', he: 'מאי', ar:'أيار', de:'mai' },
    { en: 'june', fr: 'juin', he: 'יוני', ar:'حزيران', de:'juni' },
    { en: 'july', fr: 'juillet', he: 'יולי', ar:'تموز', de:'juli' },
    { en: 'august', fr: 'août', he: 'אוגוסט', ar:'آب', de:'august' },
    { en: 'september', fr: 'septembre', he: 'ספטמבר', ar:'أيلول', de:'september' },
    { en: 'october', fr: 'octobre', he: 'אוקטובר', ar:'تشرين الأول', de:'oktober' },
    { en: 'november', fr: 'novembre', he: 'נובמבר', ar:'تشرين الثاني', de:'november' },
    { en: 'december', fr: 'décembre', he: 'דצמבר', ar:'كانون الأول', de:'dezember' }
  ],
  minuteSeparator: {
    en: ':',
    fr: 'h',
    he: ':',
    ar: ':',
    de: ':'
  },
  prefix: {
    en: 'on',
    fr: 'les',
    he: 'במועדים',
    ar: 'في',
    de: 'am'
  },
  weekdays: [ {
    en: 'sundays',
    fr: 'dimanches',
    he: 'ימי ראשון',
    ar: 'الأحد',
    de: 'sonntag'
  }, {
    en: 'mondays',
    fr: 'lundis',
    he: 'ימי שני',
    ar: 'الاثنين',
    de: 'montag'
  }, {
    en: 'tuesdays',
    fr: 'mardis',
    he: 'ימי שלישי',
    ar: 'الثلاثاء',
    de: 'dienstag'
  }, {
    en: 'wednesdays',
    fr: 'mercredis',
    he: 'ימי רביעי',
    ar: 'الأربعاء',
    de: 'mittwoch'
  }, {
    en: 'thursdays',
    fr: 'jeudis',
    he: 'ימי חמישי',
    ar: 'الخميس',
    de: 'donnerstag'
  }, {
    en: 'fridays',
    fr: 'vendredis',
    he: 'ימי שישי',
    ar: 'الجمعة',
    de: 'freitag'
  }, {
    en: 'saturdays',
    fr: 'samedis',
    he: 'ימי שבת',
    ar: 'السبت',
    de: 'sonnabend'
  } ]
};
