'use strict';

const Discord = require('..');

let svc;

beforeAll(async () => {
  svc = await Discord({
  });
});

test('no config given', async () => {
  const response = await svc.notifyUserCreation({
    fullName: 'Olivia',
    email: 'email@email.com',
    userUid: 123456
  });
  expect(response).toBe(null);
});
