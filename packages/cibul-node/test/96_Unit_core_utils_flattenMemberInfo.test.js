'use strict';

const flattenMemberInfo = require('../core/agendas/utils/flattenMemberInfo');

const schema = {
  custom: {},
  fields: [
    {
      field: 'phone',
      label: {
        fr: 'Télephone',
      },
      sub: {
        fr: 'blabla',
      },
    },
    {
      field: 'num_orga',
      label: "Numero d'organisme",
    },
    {
      field: 'participant',
      label: 'Type de participant',
      sub: '/!\\ Les pros doivent participer le WE. Dates obligatoires à l’intérieur des dates officielles.',
      options: [
        {
          id: 1,
          value: 'professionnels',
          label: 'Professionnels',
        },
        {
          id: 2,
          value: 'porteurs_de_projet',
          label: 'Porteurs de projet',
        },
        {
          id: 3,
          value: 'centre de formations',
          label: 'Centre de formations',
        },
      ],
    },
    {
      field: 'organization',
      label: {
        fr: 'Org',
      },
      fieldType: 'text',
    },
    {
      field: 'name',
      label: {
        fr: 'Nom',
      },
      fieldType: 'text',
    },
    {
      field: 'position',
      label: {
        fr: 'Position',
      },
      fieldType: 'text',
    },
    {
      field: 'email',
      label: {
        fr: 'Mail',
      },
      fieldType: 'email',
    },
  ],
};

const memberInfo = {
  deletedUser: false,
  email: 'con@stance.com',
  eventCount: 0,
  invited: false,
  name: 'Constance',
  num_orga: '30org',
  participant: [2, 3],
  organization: null,
  phone: null,
  position: null,
  role: 'contributor',
  updatedAt: '2017-10-30T13:21:07.000Z',
  userUid: 6887,
};

describe('96 - core unit - flattenMemberInfo', () => {
  it('basic', () => {
    const fct = flattenMemberInfo(schema, 'fr');
    const res = fct(memberInfo);
    expect(res).toStrictEqual({
      'Evénements contribués': 0,
      Nom: 'Constance',
      Mail: 'con@stance.com',
      "Numero d'organisme": '30org',
      Rôle: 'Contributeur',
      'Type de participant': 'Porteurs de projet | Centre de formations',
      Statut: 'Compte existant',
      Org: null,
      Télephone: null,
      Position: null,
    });
  });

  it('undefined lang', () => {
    const fct = flattenMemberInfo(schema, 'en');
    const res = fct(memberInfo);
    expect(res).toStrictEqual({
      'Contributed events': 0,
      Nom: 'Constance',
      Mail: 'con@stance.com',
      "Numero d'organisme": '30org',
      Role: 'Contributor',
      'Type de participant': 'Porteurs de projet | Centre de formations',
      State: 'Account exists',
      Org: null,
      Télephone: null,
      Position: null,
    });
  });
});
