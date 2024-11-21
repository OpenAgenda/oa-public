import mark from '../segment-pages/mark.js';

describe('02 - markdown (unit)', () => {
  it('mark should not process links', () => {
    expect(mark('https://openagenda.com')).toBe('https://openagenda.com');
  });

  it('mark should not process emails', () => {
    expect(mark('support@openagenda.com')).toBe('support@openagenda.com');
  });

  it('mark processes markdown', () => {
    expect(mark('**This is bold**')).toBe('<strong>This is bold</strong>');
  });
});
