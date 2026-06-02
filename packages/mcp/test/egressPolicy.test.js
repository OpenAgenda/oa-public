import {
  buildSrtSettings,
  defaultReadPolicy,
  policySha256,
  renderEgressPolicy,
} from '../src/egressPolicy.js';

// The wrapper-policy emitter (`print-egress-policy`). It exists so an operator
// running the MCP under an outer sandbox wraps with the app's OWN derived
// policy — never a hand-copied one that can drift.

describe('buildSrtSettings', () => {
  it('allows egress ONLY to the given hosts and permits no writes', () => {
    const s = buildSrtSettings({ allowNet: ['api.openagenda.com'] });
    expect(s.network.allowedDomains).toEqual(['api.openagenda.com']);
    expect(s.network.deniedDomains).toEqual([]);
    expect(s.filesystem.allowWrite).toEqual([]); // allow-only → nothing writable
  });

  it('carries the read deny/allow lists through (srt allows reads by default)', () => {
    const s = buildSrtSettings({
      allowNet: ['h'],
      denyRead: ['~'],
      allowRead: ['.', '/runtime'],
    });
    expect(s.filesystem.denyRead).toEqual(['~']);
    expect(s.filesystem.allowRead).toEqual(['.', '/runtime']);
  });
});

describe('defaultReadPolicy', () => {
  it('denies the home dir and re-allows the workspace + runtime root', () => {
    const p = defaultReadPolicy({
      execPath: '/home/u/.nvm/versions/node/v24/bin/node',
    });
    expect(p.denyRead).toEqual(['~']); // secrets (~/.ssh, ~/.aws, .env…) blocked
    expect(p.allowRead).toContain('.'); // workspace re-allowed
    expect(p.allowRead).toContain('/home/u/.nvm/versions/node/v24'); // runtime libs readable
  });
});

describe('policySha256', () => {
  it('is stable for the same policy and differs when reads change', () => {
    const a = policySha256({
      allowNet: ['h'],
      denyRead: ['~'],
      allowRead: ['.'],
    });
    expect(a).toBe(
      policySha256({ allowNet: ['h'], denyRead: ['~'], allowRead: ['.'] }),
    );
    expect(a).not.toBe(
      policySha256({ allowNet: ['h'], denyRead: [], allowRead: [] }),
    );
  });
});

describe('renderEgressPolicy', () => {
  it('srt format is a valid srt --settings object that also denies reads', () => {
    const out = JSON.parse(
      renderEgressPolicy({ allowNet: ['api.openagenda.com'], format: 'srt' }),
    );
    expect(out.network.allowedDomains).toEqual(['api.openagenda.com']);
    expect(out.filesystem.denyRead).toEqual(['~']); // NOT the [] footgun
  });

  it('json format carries the policy + a fingerprint', () => {
    const out = JSON.parse(
      renderEgressPolicy({ allowNet: ['api.openagenda.com'], format: 'json' }),
    );
    expect(out.allowNet).toEqual(['api.openagenda.com']);
    expect(out.denyRead).toEqual(['~']);
    expect(typeof out.policySha256).toBe('string');
  });
});
