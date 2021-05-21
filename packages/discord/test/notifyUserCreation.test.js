'use strict';

const Discord = require('..');

let svc;

beforeAll(async () => {
  svc = await Discord({
    token: process.env.DISCORD_TOKEN,
    channel: process.env.DISCORD_CHANNEL_ID,
  });
});

test('notifying a user creation', async () => {
  const response = await svc.notifyUserCreation({
    fullName: 'Olivia',
    email: 'email@email.com',
    userUid: 123456
  });
  expect(response).toBeDefined();
});
