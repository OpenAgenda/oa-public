'use strict';

const Newsletter = require('../index.js');

const config = {
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  contactsListId: process.env.CONTACTS_LIST_ID,
};

let newsletter;

describe('Add user', () => {
  beforeAll(() => {
    newsletter = Newsletter({ mailjet: config });
  });

  it('add to list - success', async () => {
    const email = 'example@gmail.com';
    const result = await newsletter.addSubscriber(email);

    expect(result.body.Total).toBe(1);
    expect(result.body.Data[0].Email).toBe(email);
  });

  it('add to list - fail', async () => {
    await expect(newsletter.addSubscriber()).rejects.toMatchObject({
      code: 'ERR_BAD_REQUEST'
    });
  });
});
