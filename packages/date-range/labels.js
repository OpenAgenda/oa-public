"use strict";

module.exports = {
  oneDate: {
    en: '%day%, %times%',
    fr: '%day%, %times%',
    ar: '%day%, %times%',
    he: ''
  },
  twoDates: {
    en: '%firstDate% and %lastDate%',
    fr: '%firstDate% et %lastDate%',
    ar: '%lastDate% و %firstDate%',
    he: ''
  },
  moreDates: {
    en: '%firstDate% - %lastDate%',
    fr: '%firstDate% - %lastDate%',
    ar: '%lastDate% - %firstDate%',
    he: ''
  },
  noDates: {
    en: 'no dates available',
    fr: 'aucune date disponible',
    ar: 'لا يتوفر أي تاريخ',
    he: 'אין תאריך זמין'
  },
  months: [
    { en: 'january', fr: 'janvier', ar: 'كانون الثاني', he: 'ינואר' },
    { en: 'february', fr: 'février', ar: 'شباط', he: 'פברואר' },
    { en: 'march', fr: 'mars', ar: 'آذار', he: 'מרץ' },
    { en: 'april', fr: 'avril', ar: 'نيسان', he: 'אפריל' },
    { en: 'may', fr: 'mai', ar: 'أيار', he: 'מאי' },
    { en: 'june', fr: 'juin', ar: 'حزيران', he: 'יוני' },
    { en: 'july', fr: 'juillet', ar: 'تموز', he: 'יולי' },
    { en: 'august', fr: 'août', ar: 'آب', he: 'אוגוסט' },
    { en: 'september', fr: 'septembre', ar: 'أيلول', he: 'ספטמבר' },
    { en: 'october', fr: 'octobre', ar: 'تشرين الأول', he: 'אוקטובר' },
    { en: 'november', fr: 'novembre', ar: 'تشرين الثاني', he: 'נובמבר' },
    { en: 'december', fr: 'décembre', ar: 'كانون الأول', he: 'דצמבר' }
  ],
  minuteSeparator: {
    en: ':',
    fr: 'h',
    ar: ':',
    he: ':'
  },
  prefix: {
    en: 'on',
    fr: 'les',
    ar: 'في',
    he: 'במועדים'
  },
  weekdays: [ {
    en: 'sundays',
    fr: 'dimanches',
    ar: 'الأحد',
    he: 'ימי ראשון'
  }, {
    en: 'mondays',
    fr: 'lundis',
    ar: 'الاثنين',
    he: 'ימי שני'
  }, {
    en: 'tuesdays',
    fr: 'mardis',
    ar: 'الثلاثاء',
    he: 'ימי שלישי'
  }, {
    en: 'wednesdays',
    fr: 'mercredis',
    ar: 'الأربعاء',
    he: 'ימי רביעי'
  }, {
    en: 'thursdays',
    fr: 'jeudis',
    ar: 'الخميس',
    he: 'ימי חמישי'
  }, {
    en: 'fridays',
    fr: 'vendredis',
    ar: 'الجمعة',
    he: 'ימי שישי'
  }, {
    en: 'saturdays',
    fr: 'samedis',
    ar: 'السبت',
    he: 'ימי שבת'
  } ]
};
