const contributorMemberData = require('./complete.contributor.json');
const detailedAgenda = require('./mdb.detailed.agenda.json');

const ContributorGoesToEventStepAfterMemberFormSubmit = {
  member: contributorMemberData,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      uid: 1000000,
      slug: 'mdb',
      title: 'Mieux se Déplacer à Bicyclette',
      description: 'MDB a pour but de développer l’usage de la bicyclette tant pour les déplacements que pour les loisirs en Île-de-France.',
      url: 'http://www.mdb-idf.org',
      settings: {
        contribution: {
          type: 1,
          useFields: true
        }
      }
    }
  }
};

const sets = {
  ContributorGoesToEventStepAfterMemberFormSubmit
};

module.exports = Object.assign(function getFixtures(agendaUid) {
  return Object.keys(sets).map(key => sets[key]).find(set => set.extraProps.agenda.uid === parseInt(agendaUid, 10));
}, sets);
