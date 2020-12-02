'use strict';

const base64 = require('../lib/utils/base64');

describe('base64', () => {
  it('decodes', () => {
    const decoded = base64.decode(
      decodeURIComponent(
        'eyJpbmRleCI6MTYsInRvdGFsIjoxOCwic2VhcmNoIjp7InRhZ3MiOlsic3BvcnRzIl19fQ%3D%3D'
      )
    );
    expect(decoded).toBe(
      '{"index":16,"total":18,"search":{"tags":["sports"]}}'
    );
  });
});
