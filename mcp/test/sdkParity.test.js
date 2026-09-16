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
// through an intersection — the shapes an `allOf` generates. The member NODE is
// kept, not its text: the comparison below reads the TypeScript AST rather than
// re-parsing type strings, which is what a `'a|b'` literal or a union nested in
// an `Array<>` would break.
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
      node: member.type,
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

const names = (values) => `{${[...values].map(String).sort().join(', ')}}`;
const unquote = (value) => value.replace(/^['"]|['"]$/g, '');

// Both sides reduced to the SAME canonical key, one structural level deep on
// each: `array:string`, `record:enum{count, alpha}`, `object:{gte, lte}`. A flat
// kind ("both are arrays") let `Array<string>` match `number[]` and a map of
// literals match `Record<string, string>` — which is how the 22 `deepObject`
// query parameters went unnoticed. `null` means no confident reading, and skips
// the comparison rather than inventing a disagreement.
const DEPTH = 2;

const sdkKey = (node, depth = DEPTH) => {
  if (!node) return null;
  if (depth <= 0) return 'deep';
  if (ts.isParenthesizedTypeNode(node)) return sdkKey(node.type, depth);
  if (ts.isUnionTypeNode(node)) {
    const kept = node.types.filter(
      (branch) => text(branch) !== 'null' && text(branch) !== 'undefined',
    );
    if (kept.length === 1) return sdkKey(kept[0], depth);
    const texts = kept.map(text);
    // The generated client takes a file as two named types; a card says it in
    // one word.
    if (
      texts.length === 2
      && texts.includes('Blob')
      && texts.includes('File')
    ) {
      return 'blob';
    }
    return kept.every((branch) => ts.isLiteralTypeNode(branch))
      ? `enum:${names(texts.map(unquote))}`
      : `union:${names(texts)}`;
  }
  if (ts.isArrayTypeNode(node)) return `array:${sdkKey(node.elementType, depth - 1)}`;
  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText();
    if (name === 'Array') return `array:${sdkKey(node.typeArguments?.[0], depth - 1)}`;
    return `named:${name}`;
  }
  if (ts.isLiteralTypeNode(node)) return `enum:${names([unquote(text(node))])}`;
  if (ts.isTypeLiteralNode(node)) {
    const [index] = node.members.filter(ts.isIndexSignatureDeclaration);
    if (index && node.members.length === 1) {
      const value = sdkKey(index.type, depth - 1);
      // A map of `unknown` is an opaque object, which is what a card calls it.
      return value === null ? 'object' : `record:${value}`;
    }
    return `object:${names(Object.keys(fieldsOf(node) ?? {}))}`;
  }
  const keyword = text(node);
  if (['string', 'number', 'boolean'].includes(keyword)) return keyword;
  return null;
};

const cardKey = (field, depth = DEPTH) => {
  if (!field) return null;
  if (depth <= 0) return 'deep';
  const { type } = field;
  if (type === 'Blob | File') return 'blob';
  // A card unfolds an array of unnamed objects into the ITEM's fields, so the
  // element carries this field's `enum` and `fields`.
  if (type.endsWith('[]')) {
    const element = type.slice(0, -2).replace(/^\((.*)\)$/, '$1');
    return `array:${cardKey({ ...field, type: element }, depth - 1)}`;
  }
  // A named type keeps its name even when the card also lists its values: the
  // enum belongs to the component, and the client names it too.
  if (/^[A-Z]\w*$/.test(type)) return `named:${type}`;
  if (field.enum) return `enum:${names(field.enum)}`;
  const map = type.match(/^Record<string, (.*)>$/);
  if (map) return `record:${cardKey({ type: map[1] }, depth - 1)}`;
  if (type.includes(' | ')) {
    const kept = type.split(' | ').filter((branch) => branch !== 'null');
    if (kept.length === 1) return cardKey({ ...field, type: kept[0] }, depth);
    return `union:${names(kept)}`;
  }
  if (type === 'string' || type === 'boolean') return type;
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'object') {
    return field.fields
      ? `object:${names(field.fields.map((nested) => nested.name))}`
      : 'object';
  }
  if (/^[A-Z]\w*$/.test(type)) return `named:${type}`;
  return null;
};

// The one place the two dialects genuinely differ: a card gives the wire type
// and lists the values on the same line (`threshold (string | number) [one of:
// off, auto]`), where the client widens the same enum into a union of literals
// and the underlying primitive. Accepted only when every value the card lists is
// one the client accepts — not as a blanket "enum is like union".
const alike = (sdk, card) => {
  if (!card?.startsWith('enum:') || !sdk) return false;
  const values = card.slice('enum:{'.length, -1).split(', ');
  return values.every((value) => sdk.includes(value));
};

const same = (sdk, card) =>
  sdk === null || card === null || sdk === card || alike(sdk, card);

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
            } else if (!same(sdkKey(sdk[name].node), cardKey(card[name]))) {
              disagreements.push(
                `${at}: the client takes ${text(sdk[name].node)}, the card says ${card[name].type}`,
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
          } else if (!same(sdkKey(sdk[name].node), cardKey(card[name]))) {
            disagreements.push(
              `${at}: the client takes ${text(sdk[name].node)}, the card says ${card[name].type}`,
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
            `${op.id}: ${text(responses[lowest].node)} in the client, no response on the card`,
          );
          continue;
        }
        const { root } = op.response;
        const sdk = text(responses[lowest].node);
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
