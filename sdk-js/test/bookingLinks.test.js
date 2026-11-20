import { httpUrl, providerBookingUrl, rowBookingUrl } from '../src/index.js';

describe('booking links', () => {
  it('accepts http and https only', () => {
    expect(httpUrl('https://a.example/x')).toBe('https://a.example/x');
    expect(httpUrl('http://a.example/x')).toBe('http://a.example/x');
    // eslint-disable-next-line no-script-url
    expect(httpUrl('javascript:alert(1)')).toBeNull();
    expect(httpUrl('www.a.example')).toBeNull();
    expect(httpUrl(undefined)).toBeNull();
    expect(httpUrl(' https://a.example/x\n')).toBe('https://a.example/x');
    expect(httpUrl('https://a.exa\tmple/x')).toBeNull();
    expect(httpUrl('https://a.example/x y')).toBeNull();
  });

  it("gives a provider's catalogue link", () => {
    expect(
      providerBookingUrl(
        [
          { provider: 'mapado', url: 'https://m.example/1' },
          { provider: 'billetweb', url: 'https://b.example/1' },
        ],
        'billetweb',
      ),
    ).toBe('https://b.example/1');
  });

  it('gives none when the provider sells through two shops', () => {
    expect(
      providerBookingUrl(
        [
          { provider: 'billetweb', url: 'https://b.example/1' },
          { provider: 'billetweb', url: 'https://b.example/2' },
        ],
        'billetweb',
      ),
    ).toBeNull();
  });

  it('takes two spellings of one shop as one', () => {
    expect(
      providerBookingUrl(
        [
          { provider: 'billetweb', url: 'https://b.example/1' },
          { provider: 'billetweb', url: 'https://B.example/1' },
        ],
        'billetweb',
      ),
    ).toBe('https://b.example/1');
  });

  it('takes the same link repeated as one', () => {
    expect(
      providerBookingUrl(
        [
          { provider: 'billetweb', url: 'https://b.example/1' },
          { provider: 'billetweb', url: 'https://b.example/1' },
        ],
        'billetweb',
      ),
    ).toBe('https://b.example/1');
  });

  it("prefers the date's own page, and says so", () => {
    const links = [{ provider: 'billetweb', url: 'https://b.example/1' }];

    expect(
      rowBookingUrl(
        { provider: 'billetweb', bookingUrl: 'https://b.example/1?d=2' },
        links,
      ),
    ).toEqual({ url: 'https://b.example/1?d=2', perDate: true });
    expect(rowBookingUrl({ provider: 'billetweb' }, links)).toEqual({
      url: 'https://b.example/1',
      perDate: false,
    });
    expect(rowBookingUrl({ provider: 'mapado' }, links)).toBeNull();
  });
});
