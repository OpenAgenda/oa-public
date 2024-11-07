// simple dev db
import fixtures from './fixtures.json' with { type: 'json' };

// dev interface functions
import interfaces from './interfaces.js';

export default {
  interfaces: interfaces(fixtures),
};
