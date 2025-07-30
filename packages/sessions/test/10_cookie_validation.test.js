import validate from '../src/iso/cookie.validate.js';

describe('session - unit (iso): cookie data validate', () => {
  it('cookie validate describes and cleans data kept in session cookie', () => {
    const cookieData = {
      user: {
        name: 'Gaetan Latouche',
        culture: 'fr',
        uid: 12345678,
        thumbnail: '//graph.facebook.com/100002280111541/picture',
      },
      expires: undefined,
      sessionId: null,
    };

    expect(validate(cookieData)).toEqual(cookieData);
  });
});
