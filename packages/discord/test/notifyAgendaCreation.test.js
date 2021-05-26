'use strict';

const Discord = require('..');

let svc;

beforeAll(async () => {
  svc = await Discord({
    token: process.env.DISCORD_TOKEN,
    channel: process.env.DISCORD_CHANNEL_ID,
  });
});

test('notifying an agenda creation', async () => {
  const response = await svc.notifyAgendaCreation({ uid: 123, title: 'Mon agenda' }, {
    fullName: 'Olivia',
    email: 'email@email.com',
    userUid: 123456
  });
  expect(response).toBeDefined();
});
