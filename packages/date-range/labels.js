"use strict";

module.exports = {
  oneDate: {
    en: '%day%, %times%',
    fr: '%day%, %times%',
    he: '%day%, %times%',
    ar: '%day%, %times%'
  },
  twoDates: {
    en: '%firstDate% and %lastDate%',
    fr: '%firstDate% et %lastDate%',
    he: '%firstDate% וגם %lastDate% ',
    ar: '%firstDate% و %lastDate% ',
  },
  moreDates: {
    en: '%firstDate% - %lastDate%',
    fr: '%firstDate% - %lastDate%',
    he: '%firstDate% - %lastDate%',
    ar: '%firstDate% - %lastDate%'

  },
  noDates: {
    en: 'no dates available',
    fr: 'aucune date disponible',
    he: 'אין תאריך זמין',
    ar: 'لا يتوفر أي تاريخ',
  },
  months: [
    { en: 'january', fr: 'janvier', he: 'ינואר', ar:'كانون الثاني' },
    { en: 'february', fr: 'février', he: 'פברואר', ar:'شباط' },
    { en: 'march', fr: 'mars', he: 'מרץ', ar:'آذار'  },
    { en: 'april', fr: 'avril', he: 'אפריל', ar:'نيسان'  },
    { en: 'may', fr: 'mai', he: 'מאי', ar:'أيار'  },
    { en: 'june', fr: 'juin', he: 'יוני', ar:'حزيران' },
    { en: 'july', fr: 'juillet', he: 'יולי', ar:'تموز' },
    { en: 'august', fr: 'août', he: 'אוגוסט', ar:'آب' },
    { en: 'september', fr: 'septembre', he: 'ספטמבר', ar:'أيلول' },
    { en: 'october', fr: 'octobre', he: 'אוקטובר', ar:'تشرين الأول' },
    { en: 'november', fr: 'novembre', he: 'נובמבר', ar:'تشرين الثاني' },
    { en: 'december', fr: 'décembre', he: 'דצמבר', ar:'كانون الأول' }
  ],


  minuteSeparator: {
    en: ':',
    fr: 'h',
    he: ':',
    ar: ':'
  },
  prefix: {
    en: 'on',
    fr: 'les',
    he: 'במועדים',
    ar: 'في'
  },
  weekdays: [ {
    en: 'sundays',
    fr: 'dimanches',
    he: 'ימי ראשון',
    ar: 'الأحد'
  }, {
    en: 'mondays',
    fr: 'lundis',
    he: 'ימי שני',
    ar: 'الاثنين'
  }, {
    en: 'tuesdays',
    fr: 'mardis',
    he: 'ימי שלישי',
    ar: 'الثلاثاء'
  }, {
    en: 'wednesdays',
    fr: 'mercredis',
    he: 'ימי רביעי',
    ar: 'الأربعاء'
  }, {
    en: 'thursdays',
    fr: 'jeudis',
    he: 'ימי חמישי',
    ar: 'الخميس'
  }, {
    en: 'fridays',
    fr: 'vendredis',
    he: 'ימי שישי',
    ar: 'الجمعة'
  }, {
    en: 'saturdays',
    fr: 'samedis',
    he: 'ימי שבת',
    ar: 'السبت'
  } ]
};