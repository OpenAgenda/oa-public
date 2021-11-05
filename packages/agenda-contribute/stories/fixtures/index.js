const { produce } = require('immer');

const contributorMemberData = require('./complete.contributor.json');
const incompleteAdminMemberData = require('./administrator.incomplete.json');
const incompleteContributorMemberData = require('./contributor.json');
const detailedAgenda = require('./mdb.detailed.agenda.json');
const agenda = require('./mdb.agenda.json');

const ContributorGoesToEventStepAfterMemberFormSubmit = {
  member: contributorMemberData,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 1,
    }
  }
};

const MemberIsAdminModAndDataIsIncomplete = {
  member: incompleteAdminMemberData,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 2
    }
  }
};

const MemberIsContributorAndDataIsCompleteAndFresh = {
  member: {
    ...contributorMemberData,
    updatedAt: new Date()
  },
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 3
    }
  }
};

const MemberIsContributorAndDataIsCompleteButIsOld = {
  member: contributorMemberData,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 4
    }
  }
};

const MemberDataRequiredAndContributorIsIncomplete = {
  member: {
    ...incompleteContributorMemberData,
    updatedAt: new Date()
  },
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...agenda,
      uid: 5
    }
  }
};

const NonMemberOnMembersOnly = {
  member: null,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: produce(agenda, draft => {
      draft.uid = 6;
      draft.settings.contribution.type = 2;
    })
  }
};

const ClosedAgendaForAdminMods = {
  member: incompleteAdminMemberData,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: produce(agenda, draft => {
      draft.uid = 7;
      draft.settings.contribution.type = 0;
    })
  }
};

const ClosedAgendaForContributor = {
  member: contributorMemberData,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: produce(agenda, draft => {
      draft.uid = 8;
      draft.settings.contribution.type = 0;
    })
  }
};

const sets = {
  ContributorGoesToEventStepAfterMemberFormSubmit,
  MemberIsAdminModAndDataIsIncomplete,
  MemberIsContributorAndDataIsCompleteAndFresh,
  MemberIsContributorAndDataIsCompleteButIsOld,
  MemberDataRequiredAndContributorIsIncomplete,
  NonMemberOnMembersOnly,
  ClosedAgendaForAdminMods,
  ClosedAgendaForContributor
};

module.exports = Object.assign(function getFixtures(agendaUid) {
  return Object.keys(sets).map(key => sets[key]).find(set => set.extraProps.agenda.uid === parseInt(agendaUid, 10));
}, sets);
