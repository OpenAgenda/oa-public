import extractEmails from '../utils/extractEmails/index.js';
import normalizeInput from '../utils/extractEmails/normalizeInput.js';

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

  it('normalizes different email formats', () => {
    expect(normalizeInput('GAJUS@GAJUS.COM')).toBe('gajus@gajus.com');
    expect(normalizeInput('：gajus@gajus.com')).toBe('gajus@gajus.com');
    expect(normalizeInput('📧gajus@gajus.com')).toBe('gajus@gajus.com');
    expect(normalizeInput('g a j u s [at] g a j u s [dot] c o m')).toBe(
      'gajus@gajus.com',
    );
    expect(normalizeInput('foo g a j u s [at] g a j u s [dot] c o m bar')).toBe(
      'foo gajus@gajus.com bar',
    );
    expect(normalizeInput('gajus[at]gajus[dot]co[dot]uk')).toBe(
      'gajus@gajus.co.uk',
    );
    expect(normalizeInput('gajus[at]gajus[dot]com')).toBe('gajus@gajus.com');
    expect(normalizeInput('gajus(at)gajus(dot)com')).toBe('gajus@gajus.com');
    expect(normalizeInput('gajus [at] gajus   [dot]   com')).toBe(
      'gajus@gajus.com',
    );
    expect(normalizeInput('gajus (at) gajus   (dot)   com')).toBe(
      'gajus@gajus.com',
    );
    expect(normalizeInput('gajus <at> gajus   <dot>   com')).toBe(
      'gajus@gajus.com',
    );
    expect(normalizeInput('gajus at gajus   dot   com')).toBe(
      'gajus@gajus.com',
    );
  });
});
