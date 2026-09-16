import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';
import { OPERATIONS } from '../src/docs/operations.js';

// The cards tell an LLM how to call `@openagenda/api-client`, and that client is
// generated from the same contract by a DIFFERENT interpreter. So the generated
// types are an independent reading of the contract, and where the two disagree
// the card is the one the agent believes: `file` rendered `string` here while
// the client took `Blob | File`, and an upload written from that card fails.
//
// Compared: the operation inventory, the argument groups (`path`, `query`,
// `body`), each key's name and optionality, a coarse type kind, and the success
// response. Coarse on purpose — the two sides say the same thing differently
// (`Array<string>` / `string[]`, a literal union / an `enum` listed under the
// field), and a comparison that cannot tell those apart from a real divergence
// would be turned off the first time it cried wolf.
const generated = new URL(
  'src/generated/types.gen.ts',
  new URL(import.meta.resolve('@openagenda/api-client/package.json')),
);

// `@openagenda/api-client` publishes `dist` only, so the generated SOURCE is
// there when the workspace is checked out and absent from an installed copy.
// Skipping is right: this guards the two packages against drifting apart in the
// repo, which is the only place they can drift.
const available = existsSync(generated);
const parity = available ? describe : describe.skip;

const aliases = new Map();
if (available) {
  const source = ts.createSourceFile(
    'types.gen.ts',
    readFileSync(generated, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  ts.forEachChild(source, (node) => {
    if (ts.isTypeAliasDeclaration(node)) aliases.set(node.name.text, node.type);
  });
}

// Hey API names the types after the operationId: `agendas.events.list` becomes
// `AgendasEventsListData`, `…Responses`.
const pascal = (id) =>
  id
    .split('.')
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join('');

const text = (node) => node.getText().replace(/\s+/g, ' ');

// The members of a type literal, through a reference to a named alias and
// through an intersection — the shapes an `allOf` generates.
const fieldsOf = (node) => {
  if (!node) return null;
  if (ts.isTypeReferenceNode(node)) return fieldsOf(aliases.get(text(node)));
  if (ts.isIntersectionTypeNode(node)) {
    const all = {};
    for (const member of node.types) Object.assign(all, fieldsOf(member) ?? {});
    return all;
  }
  if (!ts.isTypeLiteralNode(node)) return null;
  const members = {};
  for (const member of node.members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    members[member.name.getText().replace(/^['"]|['"]$/g, '')] = {
      optional: !!member.questionToken,
      type: member.type ? text(member.type) : 'unknown',
    };
  }
  return members;
};

const groupsOf = (operationId) => {
  const node = aliases.get(`${pascal(operationId)}Data`);
  const groups = {};
  for (const member of node.members) groups[member.name.getText()] = member.type;
  return groups;
};

const LITERAL = /^(['"].*['"]|-?\d+)$/;

// Split a union at the TOP level only: `Array<'a' | 'b'>` is one type, and
// `{ [key: string]: 'count' | 'alpha' }` is one type. Splitting on every `|`
// reads both as unions and reports a disagreement that is not there.
const branches = (type) => {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of type) {
    if ('<{(['.includes(char)) depth += 1;
    else if ('>})]'.includes(char)) depth -= 1;
    if (char === '|' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  parts.push(current.trim());
  return parts.filter(
    (part) => part && part !== 'null' && part !== 'undefined',
  );
};

// Both sides, reduced to the same vocabulary. `null` means "no confident
// reading" and skips the comparison rather than inventing a disagreement.
const sdkKind = (type) => {
  const bare = branches(type);
  if (bare.length > 1) {
    return bare.every((part) => LITERAL.test(part)) ? 'enum' : 'union';
  }
  const one = bare[0] ?? 'null';
  if (/^Array</.test(one) || one.endsWith('[]')) return 'array';
  if (['string', 'number', 'boolean'].includes(one)) return one;
  if (one.startsWith('{')) return 'object';
  if (LITERAL.test(one)) return 'enum';
  if (/^[A-Z]\w*$/.test(one)) return `named:${one}`;
  return null;
};

const cardKind = (field) => {
  const bare = branches(field.type);
  const one = bare.length === 1 ? bare[0] : null;
  // An array of enum values is an array on both sides; only a SCALAR enum is
  // where the two say the same thing differently.
  if (one?.endsWith('[]')) return 'array';
  if (field.enum) return 'enum';
  if (field.type === 'Blob | File') return 'blob';
  if (!one) return 'union';
  if (one === 'string' || one === 'boolean') return one;
  if (one === 'integer' || one === 'number') return 'number';
  if (one === 'object' || one.startsWith('Record<')) return 'object';
  if (/^[A-Z]\w*$/.test(one)) return `named:${one}`;
  return null;
};

// Where the two describe the same thing in different words. A card gives the
// wire type and lists the values (`sort (string) [one of: …]`) where the client
// generates a union of literals; `Blob | File` is two named types there and one
// word here. Everything else must match, or the comparison guards nothing.
const ALIKE = [
  ['enum', 'union'],
  ['enum', 'string'],
  ['enum', 'number'],
  ['blob', 'union'],
];

const same = (sdk, card) =>
  sdk === null
  || card === null
  || sdk === card
  || ALIKE.some(
    ([a, b]) => (a === card && b === sdk) || (a === sdk && b === card),
  );

parity(
  'the cards and the generated client read the contract the same way',
  () => {
    it('documents every operation the client generates, and no other', () => {
      const generatedIds = [...aliases.keys()]
        .filter((name) => name.endsWith('Data'))
        .map((name) => name.slice(0, -'Data'.length))
        .sort();
      expect(OPERATIONS.map((op) => pascal(op.id)).sort()).toEqual(
        generatedIds,
      );
    });

    it('gives each call the same argument groups', () => {
      const disagreements = [];
      for (const op of OPERATIONS) {
        const groups = groupsOf(op.id);
        const card = {
          path: op.params.some((p) => p.in === 'path'),
          query: op.params.some((p) => p.in === 'query'),
          body: !!op.request,
        };
        for (const group of ['path', 'query', 'body']) {
          const sdk = groups[group] ? text(groups[group]) !== 'never' : false;
          if (sdk !== card[group]) {
            disagreements.push(
              `${op.id}: the client takes ${sdk ? '' : 'no '}\`${group}\`, the card shows ${card[group] ? '' : 'none'}`,
            );
          }
        }
      }
      expect(disagreements).toEqual([]);
    });

    it('gives each parameter the same name, optionality and type', () => {
      const disagreements = [];
      for (const op of OPERATIONS) {
        const groups = groupsOf(op.id);
        for (const group of ['path', 'query']) {
          const sdk = fieldsOf(groups[group]) ?? {};
          const card = Object.fromEntries(
            op.params.filter((p) => p.in === group).map((p) => [p.name, p]),
          );
          for (const name of new Set([
            ...Object.keys(sdk),
            ...Object.keys(card),
          ])) {
            const at = `${op.id} ${group}.${name}`;
            if (!sdk[name]) disagreements.push(`${at}: on the card, not in the client`);
            else if (!card[name]) disagreements.push(`${at}: in the client, not on the card`);
            else if (sdk[name].optional === card[name].required) {
              disagreements.push(
                `${at}: the client says ${sdk[name].optional ? 'optional' : 'required'}, the card says ${card[name].required ? 'required' : 'optional'}`,
              );
            } else if (!same(sdkKind(sdk[name].type), cardKind(card[name]))) {
              disagreements.push(
                `${at}: the client takes ${sdk[name].type}, the card says ${card[name].type}`,
              );
            }
          }
        }
      }
      expect(disagreements).toEqual([]);
    });

    it('gives each request body the same fields — this is what `Blob | File` was', () => {
      const disagreements = [];
      for (const op of OPERATIONS.filter((o) => o.request)) {
        const sdk = fieldsOf(groupsOf(op.id).body) ?? {};
        const card = Object.fromEntries(
          (op.request.fields ?? []).map((field) => [field.name, field]),
        );
        for (const name of new Set([
          ...Object.keys(sdk),
          ...Object.keys(card),
        ])) {
          const at = `${op.id} body.${name}`;
          if (!sdk[name]) disagreements.push(`${at}: on the card, not in the client`);
          else if (!card[name]) disagreements.push(`${at}: in the client, not on the card`);
          else if (sdk[name].optional === card[name].required) {
            disagreements.push(
              `${at}: the client says ${sdk[name].optional ? 'optional' : 'required'}, the card says ${card[name].required ? 'required' : 'optional'}`,
            );
          } else if (!same(sdkKind(sdk[name].type), cardKind(card[name]))) {
            disagreements.push(
              `${at}: the client takes ${sdk[name].type}, the card says ${card[name].type}`,
            );
          }
        }
      }
      expect(disagreements).toEqual([]);
    });

    it('reads the same success response', () => {
      const disagreements = [];
      for (const op of OPERATIONS) {
        const responses = fieldsOf(aliases.get(`${pascal(op.id)}Responses`)) ?? {};
        const codes = Object.keys(responses);
        // The card renders the lowest 2xx; anything else the client exposes is a
        // shape the LLM would never be shown (the compat check reports it).
        const [lowest] = codes.sort();
        if (!lowest) {
          if (op.response) {
            disagreements.push(
              `${op.id}: a response on the card, none in the client`,
            );
          }
          continue;
        }
        if (!op.response) {
          disagreements.push(
            `${op.id}: ${responses[lowest].type} in the client, no response on the card`,
          );
          continue;
        }
        const { root } = op.response;
        const sdk = responses[lowest].type;
        if (root && sdk !== root) {
          disagreements.push(
            `${op.id}: the client answers ${sdk}, the card says ${root}`,
          );
        }
      }
      expect(disagreements).toEqual([]);
    });
  },
);
