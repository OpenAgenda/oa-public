'use strict';

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./fixtures');
const getUsersByUid = require('./fixtures/getUsersByUid');
const getEventCountByUserUid = require('./fixtures/getEventCountByUserUid');

describe('members - functional - remove', () => {
  const f = fixtures(config.mysql);

  let svc;
  let result;
  let onRemoveArguments;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getUsersByUid,
        getEventCountByUserUid,
        onRemove: (...args) => {
          onRemoveArguments = args;
        }
      }
    });
  });

  beforeAll(async () => {
    result = await svc.remove(
      { userUid: 2, agendaUid: 1 },
      {
        context: {
          user: { uid: 1920 }
        }
      }
    );
  });

  afterAll(f.destroyClient);

  test('simple remove removes', async () => {
    expect(result.success).toBe(true);

    const rows = await f
      .client('member')
      .select('*')
      .where({ user_uid: 2, agenda_uid: 1 });

    expect(rows).toHaveLength(0);
  });

  test('onRemove interface is given removed member and context', () => {
    expect(onRemoveArguments).toEqual([
      {
        id: 2,
        deletedUser: false,
        invited: false,
        agendaUid: 1,
        role: 1,
        userUid: 2,
        custom: {
          organization: 'Idpt',
          contactNumber: '013072171',
          contactName: 'JC Ponceau',
          contactPosition: 'Responsable des pains',
          email: 'jc@ponceau.fr'
        }
      },
      {
        user: { uid: 1920 }
      }
    ]);
  });
});
