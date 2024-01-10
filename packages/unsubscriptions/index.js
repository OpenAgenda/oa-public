import Tokens from './lib/Tokens.js';
import Registry from './lib/Registry.js';

export default function Unsubscriptions({ secret, knex }) {
  return {
    tokens: Tokens({ secret, knex }),
    registry: Registry({ knex }),
  };
}
