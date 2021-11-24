const { produce } = require('immer');

const contributorMemberData = require('./complete.contributor.json');
const incompleteAdminMemberData = require('./administrator.incomplete.json');
const incompleteContributorMemberData = require('./contributor.json');
const detailedAgenda = require('./mdb.detailed.agenda.json');
const agenda = require('./mdb.agenda.json');
const basicAgenda = require('./basic.agenda.json');
const basicDetailedAgenda = require('./basic.detailed.agenda.json');
const detailedAgendaWithAdditionalFields = require('./detailed.withAdditionalFields.json');
const detailedAgendaWithMoreConstraints = require('./detailed.withMoreConstraints.json');
const eventContributorContext = require('./contributor.context.json');
const basicEventResponse = require('./event.json');
const bareboneEventResponse = require('./barebone.event.json');

function getLocation(uid) {
  return [basicEventResponse.event.location].filter(l => l.uid === parseInt(uid, 10)).pop();
}

const storySets = {};

storySets.ContributorGoesToEventStepAfterMemberFormSubmit = {
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

storySets.MemberIsAdminModAndDataIsIncomplete = {
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

storySets.MemberIsContributorAndDataIsCompleteAndFresh = {
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

storySets.MemberIsContributorAndDataIsCompleteButIsOld = {
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

storySets.MemberDataRequiredAndContributorIsIncomplete = {
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

storySets.NonMemberOnMembersOnly = {
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

storySets.ClosedAgendaForAdminMods = {
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

storySets.ClosedAgendaForContributor = {
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

storySets.NewEventForm = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 100
    }
  }
};

storySets.EditEventForm = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: basicDetailedAgenda,
  event: basicEventResponse,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 101
    }
  },
  eventContext: eventContributorContext
};

storySets.NewEventFormWithDefaults = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 102
    }
  }
};

storySets.EventCreateLeadsToCompletionStep = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 103
    }
  }
};

storySets.EditDraftEventForm = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: basicDetailedAgenda,
  event: produce(basicEventResponse, draft => {
    draft.event.draft = true;
  }),
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 104
    }
  },
  eventContext: eventContributorContext
};

storySets.BasicConfirmation = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 200
    }
  },
  extraDevInitialState: {
    contribute: {
      createdEvent: basicEventResponse.event
    }
  }
};

storySets.CustomMessageConfirmation = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: produce(basicAgenda, draft => {
      draft.settings.contribution.messages.complete = 'Un message personnalisé';
      draft.uid = 201;
    })
  },
  extraDevInitialState: {
    contribute: {
      createdEvent: basicEventResponse.event
    }
  }
};

storySets.ShareEventForm = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: detailedAgendaWithAdditionalFields,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithAdditionalFields,
      uid: 300
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = false;
  })
};
storySets.ShareEventFormFromAgenda = {
  agenda: basicDetailedAgenda,
  event: basicEventResponse,
  extraProps: {
    agenda: {
      uid: 1234
    }
  }
};

storySets.ShareEventFormToConstrainedAgenda = {
  member: { ...contributorMemberData, updatedAt: new Date() },
  agenda: detailedAgendaWithMoreConstraints,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 301
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = false;
  })
};
storySets.ShareEventFormToConstrainedAgendaFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  extraProps: {
    agenda: {
      uid: 5678
    }
  }
};

module.exports = Object.assign(function getFixtures(agendaUid) {
  return Object.keys(storySets).map(key => storySets[key]).find(set => set.extraProps.agenda.uid === parseInt(agendaUid, 10));
}, storySets, { getLocation });
