import base64 from '../lib/utils/base64.js';

describe('base64', () => {
  it('decodes', () => {
    const decoded = base64.decode(
      decodeURIComponent(
        'eyJpbmRleCI6MTYsInRvdGFsIjoxOCwic2VhcmNoIjp7InRhZ3MiOlsic3BvcnRzIl19fQ%3D%3D',
      ),
    );
    expect(decoded).toBe(
      '{"index":16,"total":18,"search":{"tags":["sports"]}}',
    );
  });
});
