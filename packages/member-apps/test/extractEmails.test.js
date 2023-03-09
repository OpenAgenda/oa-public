import extractEmails from '../src/utils/extractEmails';

describe('extractEmails', () => {
  it('basic case', () => {
    expect(extractEmails('here is an email: support@oa.com')).toEqual([
      {
        email: 'support@oa.com',
      },
    ]);
  });

  it('several emails', () => {
    expect(
      extractEmails(
        'here is one: support@oa.com, here is another: wigglypoof@oa.com',
      ),
    ).toEqual([
      {
        email: 'support@oa.com',
      },
      {
        email: 'wigglypoof@oa.com',
      },
    ]);
  });
});
