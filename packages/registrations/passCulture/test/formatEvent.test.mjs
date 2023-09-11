import formatEvent from '../lib/formatEvent.mjs';

import fixtures from './fixtures/cart.events.json' assert { type: 'json' };

const pickEvent = slug => fixtures.find(e => slug === e.slug);
const isBase64 = value => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(value);

describe('formatEvent', () => {
  it('title is flattened and goes in name', async () => {
    const ev = pickEvent('visite-guidee-le-cri-de-liberte-chagall-politique-464182');

    expect(
      await formatEvent(ev, { lang: 'fr' }).then(e => e.name),
    ).toBe('Visite guidée - Le cri de liberté : Chagall politique');
  });

  it('accessibility is mapped to audio, mental/psychic, motor and visual Pass criterias', async () => {
    const ev = pickEvent('1er-dimanche-du-mois-3097557');

    expect(
      await formatEvent(ev, { lang: 'fr' }).then(e => e.accessibility),
    ).toEqual({
      audioDisabilityCompliant: true,
      mentalDisabilityCompliant: true,
      motorDisabilityCompliant: true,
      visualDisabilityCompliant: true,
    });
  });

  it('Pass description is text variant of OA event long description', async () => {
    const ev = pickEvent('visite-guidee-le-cri-de-liberte-chagall-politique-464182');

    const description = await formatEvent(ev, { lang: 'fr' }).then( e => e.description);

    expect(description.length).toBe(1000);
  });

  it('When venueId is provided in second argument it placed in the formatted event. Other options are placed in third argument.', async () => {
    const ev = pickEvent('visite-guidee-le-cri-de-liberte-chagall-politique-464182');

    const formatted = await formatEvent(ev, { venueId: 12345 }, { lang: 'fr' });

    expect(formatted.location).toEqual({
      type: 'physical',
      venueId: 12345
    });
  });

  it('When category is provided in the second argument it is placed in the formatted event. Other options are placed in third argument.', async () => {
    const ev = pickEvent('visite-guidee-le-cri-de-liberte-chagall-politique-464182');

    const formatted = await formatEvent(ev, { category: 'CINE_PLEIN_AIR' }, { lang: 'fr' });

    expect(formatted.categoryRelatedFields).toEqual({
      category: 'CINE_PLEIN_AIR',
    });
  });

  it('images are converted to base64 format', async () => {
    const ev = pickEvent('animation-enfant-parure-de-terre-2615625');

    const formatted = await formatEvent(ev, { lang: 'fr' });

    expect(
      isBase64(formatted.image.file)
    ).toBe(true);
  });
});
