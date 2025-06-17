import extractStreetFromOAAddress from '../lib/extractStreetFromOAAddress.js';
import addresses from './fixtures/addresses.grand-est.json';

describe('extractStreetFromOAAddress', () => {
  test('rue du Mont-Aimé, 51130, Val-des-Marais', () => {
    const street = extractStreetFromOAAddress({
      address: 'rue du Mont-Aimé, 51130, Val-des-Marais',
      postalCode: '51130',
      city: 'Val-des-Marais',
    });
    expect(street).toBe('rue du Mont-Aimé');
  });

  test('Route de Villiers', () => {
    const street = extractStreetFromOAAddress({
      address: 'Route de Villiers en Lieu 52100 Saint-Dizier',
      postalCode: '52100',
      city: 'Villiers-en-Lieu',
      street: 'Route de Villiers en Lieu ',
    });
    expect(street).toBe('Route de Villiers en Lieu');
  });

  test('41 rue Meyer 67430 Weinbourg', () => {
    const street = extractStreetFromOAAddress({
      address: '41 rue Meyer 67430 Weinbourg',
      postalCode: '67340',
      city: 'Weinbourg',
    });
    expect(street).toBe('41 rue Meyer');
  });

  test('sample', () => {
    expect(
      JSON.stringify(
        addresses.map((item) => ({
          ...item,
          street: extractStreetFromOAAddress(item),
        })),
        null,
        2,
      ),
    ).toEqual(JSON.stringify(addresses, null, 2));
  });
});
