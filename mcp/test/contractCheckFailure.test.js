import { jest } from '@jest/globals';

// The compat check walks constructs the renderer never touches, so a contract
// the cards render fine can still make the CHECK throw - and it runs inside
// the search_docs request path, on the first payload. Uncaught, that turned
// every search_docs call into an error, and, with nothing memoised, on every
// call after it too. Own file: the mock has to be in place before
// operations.js is first imported, and every other suite imports the real one.
jest.unstable_mockModule('../src/docs/compat.js', () => ({
  checkContract: jest.fn(() => {
    throw new TypeError('walk is not a function');
  }),
  contractWarning: (findings) =>
    (findings.length
      ? findings.map((f) => `${f.pointer}: ${f.message}`).join('\n')
      : ''),
  formatFindings: (findings) => findings.map((f) => f.message).join('\n'),
}));

const { checkContract } = await import('../src/docs/compat.js');
const { renderSearch, searchOperations } = await import(
  '../src/docs/operations.js'
);

describe('a compat check that throws', () => {
  it('becomes a warning on the payload, once, instead of an error on every call', () => {
    const first = renderSearch(searchOperations('events'));
    expect(first).toContain(
      '/: the contract check itself failed (walk is not a function)',
    );
    expect(first).toContain('### agendas.events.list');
    renderSearch(searchOperations('events'));
    expect(checkContract).toHaveBeenCalledTimes(1);
  });
});
