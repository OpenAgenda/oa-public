const { produce } = require('immer');

const detailedAgenda = require('./mdb.detailed.agenda.json');
const agenda = require('./mdb.agenda.json');
const basicAgenda = require('./basic.agenda.json');
const basicDetailedAgenda = require('./basic.detailed.agenda.json');
const detailedAgendaWithAdditionalFields = require('./detailed.withAdditionalFields.json');
const detailedAgendaWithMoreConstraints = require('./detailed.withMoreConstraints.json');
const eventContributorContext = require('./contributor.context.json');
const agendaContributorContext = require('./agendaContributor.context.json');
const agendaIncompleteContributorContext = require('./agendaContributor.incomplete.context.json');
const basicEventResponse = require('./event.json');
const bareboneEventResponse = require('./barebone.event.json');

function getLocation(uid) {
  return [basicEventResponse.event.location].filter(l => l.uid === parseInt(uid, 10)).pop();
}

const storySets = {};

storySets.ContributorGoesToEventStepAfterMemberFormSubmit = {
  agendaContext: agendaContributorContext,
  agenda: produce(detailedAgenda, draft => {
    draft.settings.contribution.type = 1;
  }),
  extraProps: {
    lang: 'fr',
    agenda: produce(detailedAgenda, draft => {
      draft.uid = 1;
      draft.settings.contribution.type = 1;
    })
  }
};

storySets.MemberIsAdminModAndDataIsIncomplete = {
  agendaContext: produce(agendaIncompleteContributorContext, draft => {
    draft.me.member.role = 'administrator';
  }),
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
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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
  agendaContext: agendaIncompleteContributorContext,
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
  agendaContext: produce(agendaIncompleteContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member = null;
  }),
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
  agendaContext: produce(agendaIncompleteContributorContext, draft => {
    draft.me.member.role = 'administrator';
  }),
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
  agendaContext: agendaContributorContext,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: produce(agenda, draft => {
      draft.uid = 8;
      draft.settings.contribution.type = 0;
    })
  }
};

storySets.NonMemberIsShownMemberFormOnContributiveAgenda = {
  agendaContext: null,
  agenda: detailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 9
    }
  }
};

storySets.NonMemberIsShownEventFormOnAgendaNotRequestingMemberInfo = {
  agendaContext: null,
  agenda: produce(basicAgenda, draft => {
    draft.settings.contribution.useFields = false;
  }),
  extraProps: {
    lang: 'fr',
    agenda: produce(basicAgenda, draft => {
      draft.uid = 10;
      draft.settings.contribution.useFields = false;
    })
  }
};

storySets.NewEventForm = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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

storySets.EditDraftEventFormFromEditRoute = produce(storySets.EditDraftEventForm, draft => {
  draft.extraProps.agenda.uid = 105;
});

storySets.AdminEditEventForm = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.role = 'administrator';
    draft.me.authorizations.canChangeState = true;
  }),
  agenda: basicDetailedAgenda,
  event: basicEventResponse,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 106
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canChangeState = true;
  })
};

storySets.EditEventFormByAdminWithoutEditRights = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.role = 'administrator';
    draft.me.authorizations.canEditEvent = false;
    draft.me.authorizations.canChangeState = true;
  }),
  agenda: basicDetailedAgenda,
  event: basicEventResponse,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 107
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canChangeState = true;
    draft.me.authorizations.canEditEvent = false;
  })
};

storySets.EventCreateByDuplication = {
  agendaContext: agendaContributorContext,
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 108
    }
  }
};
storySets.EventCreateByDuplicationOrigin = {
  extraProps: {
    agenda: {
      ...basicAgenda,
      uid: 109
    }
  },
  event: basicEventResponse,
  agenda: basicDetailedAgenda
};

storySets.BasicConfirmation = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
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

storySets.ConfirmationRedirect = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...basicAgenda,
      uid: 202
    }
  }
};

storySets.ShareEventForm = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: detailedAgendaWithAdditionalFields,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithAdditionalFields,
      uid: 300
    }
  }
};
storySets.ShareEventFormFromAgenda = {
  agenda: basicDetailedAgenda,
  event: basicEventResponse,
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  extraProps: {
    agenda: {
      uid: 1234,
      title: 'Où on va'
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = false;
  })
};

storySets.ShareEventFormToConstrainedAgenda = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: detailedAgendaWithMoreConstraints,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 301
    }
  }
};
storySets.ShareEventFormToConstrainedAgendaFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  extraProps: {
    agenda: {
      uid: 5678
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = false;
  })
};

storySets.ShareEventFormWithoutEditionRightsAndNoAdditionalFields = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 302
    }
  }
};
storySets.ShareEventFormWithoutEditionRightsAndNoAdditionalFieldsFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  extraProps: {
    agenda: {
      uid: 5679
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = false;
  })
};

storySets.EventWasShared = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 303
    }
  },
  extraDevInitialState: {
    contribute: {
      sharedEvent: {
        uid: 3902019,
        title: { fr: 'Alaska by night' },
        state: 2
      }
    }
  }
};
storySets.EventWasSharedFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  extraProps: {
    agenda: {
      uid: 5680
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = false;
  })
};

storySets.ShareEventWithEditionRightsAndAdditionalFields = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: detailedAgendaWithAdditionalFields,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithAdditionalFields,
      uid: 304
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = true;
  })
};
storySets.ShareEventWithEditionRightsAndAdditionalFieldsFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  extraProps: {
    agenda: {
      uid: 5681
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = true;
  })
};

storySets.ShareEventWithEditionRightsAndNoAdditionalFields = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 305
    }
  }
};
storySets.ShareEventWithEditionRightsAndNoAdditionalFieldsFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: agendaContributorContext,
  extraProps: {
    agenda: {
      uid: 5682
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = true;
  })
};

storySets.AdminShareEventWithEditionRightsAndNoAdditionalFields = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
    draft.me.member.role = 'administrator';
    draft.me.authorizations.canChangeState = true;
  }),
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 306
    }
  }
};
storySets.AdminShareEventWithEditionRightsAndNoAdditionalFieldsFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: agendaContributorContext,
  extraProps: {
    agenda: {
      uid: 5683
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = true;
  })
};

storySets.AdminShareAlreadySharedEvent = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
    draft.me.member.role = 'administrator';
    draft.me.authorizations.canChangeState = true;
  }),
  event: bareboneEventResponse,
  agenda: basicDetailedAgenda,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 307
    }
  }
};
storySets.AdminShareAlreadySharedEventFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: agendaContributorContext,
  extraProps: {
    agenda: {
      uid: 5684
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = true;
  })
};

storySets.ShareIncompleteEventWithEditRights = {
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  agenda: detailedAgendaWithMoreConstraints,
  extraProps: {
    lang: 'fr',
    agenda: {
      ...detailedAgendaWithMoreConstraints,
      uid: 308
    }
  }
};
storySets.ShareIncompleteEventWithEditRightsFromAgenda = {
  agenda: basicDetailedAgenda,
  event: bareboneEventResponse,
  agendaContext: produce(agendaContributorContext, draft => {
    draft.me.member.updatedAt = new Date();
  }),
  extraProps: {
    agenda: {
      uid: 5685
    }
  },
  eventContext: produce(eventContributorContext, draft => {
    draft.me.authorizations.canEditEvent = true;
  })
};

module.exports = Object.assign(function getFixtures(agendaUid) {
  return Object.keys(storySets).map(key => storySets[key]).find(set => set.extraProps.agenda.uid === parseInt(agendaUid, 10));
}, storySets, { getLocation });
