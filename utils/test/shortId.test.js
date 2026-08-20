import unique, { draw, normalize, ALPHABET, LENGTH } from '../shortId.js';

describe('utils.shortId.draw', () => {
  it('is 6 characters of the Crockford alphabet', () => {
    for (let i = 0; i < 200; i += 1) {
      const id = draw();

      expect(id).toHaveLength(LENGTH);
      expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{6}$/);
    }
  });

  // The whole reason for the alphabet: these four never appear, so a human
  // reading an id aloud cannot produce one of them.
  it('never emits I, L, O or U', () => {
    const drawn = Array.from({ length: 2000 }, () => draw()).join('');

    expect(drawn).not.toMatch(/[ILOU]/);
  });

  it('honours a requested length', () => {
    expect(draw(1)).toHaveLength(1);
    expect(draw(32)).toHaveLength(32);
  });

  // A published API: 0, -1, 2.5 and NaN all used to return something rather than
  // complain — and `''` then travelled on as a perfectly good "unique" id, into
  // a URL that ends in a bare slash.
  //
  // 65537 joins them for the opposite reason: it used to PASS this validation
  // and die one line later inside `getRandomValues`, which refuses more than
  // 65 536 bytes with an opaque QuotaExceededError — a platform error in place
  // of the message this check exists to give.
  it.each([0, -1, 2.5, NaN, Infinity, '6', null, 65537])(
    'refuses %s as a length',
    (length) => {
      expect(() => draw(length)).toThrow(/length must be an integer between 1 and 65536/);
    },
  );

  it('still accepts the largest length the platform allows', () => {
    expect(draw(65536)).toHaveLength(65536);
  });

  it('treats an absent length as the default', () => {
    expect(draw(undefined)).toHaveLength(LENGTH);
  });

  it('does not repeat itself over 10 000 draws', () => {
    const seen = new Set();

    for (let i = 0; i < 10000; i += 1) {
      seen.add(draw());
    }

    expect(seen.size).toBeGreaterThan(9990);
  });

  // 32 divides 256, so masking five bits is unbiased by construction — no
  // redraw, and nothing to prove beyond every character being reachable and the
  // spread being flat.
  //
  // The numbers, computed rather than guessed, because the previous version of
  // this note was wrong by nine orders of magnitude and the next person to
  // retune these bounds would have reasoned from it. With 64 000 draws over 32
  // characters, each count has mean 2000 and sigma 44. The 1600/2400 bounds are
  // therefore at 9.09 sigma: a fair generator fails this about once in 3×10^17
  // runs, not once in 10^8.
  //
  // And they do not catch a 1.6% skew — that is 32 counts, 0.73 sigma, well
  // inside. What they would have caught is the real modulo bias of the base62
  // alphabet this replaced: 256 = 4×62 + 8, so its first eight characters drew
  // 5 times in 256 against 4.13 expected, a +21% skew at 9.55 sigma — barely
  // outside. These bounds are calibrated for that defect and little else.
  it('draws every character about as often as any other', () => {
    const counts = new Map();
    const perChar = 2000;
    const drawn = Array.from(
      { length: ALPHABET.length * perChar },
      () => draw(1),
    ).join('');

    for (const char of drawn) {
      counts.set(char, (counts.get(char) || 0) + 1);
    }

    expect(counts.size).toBe(ALPHABET.length);
    expect(Math.min(...counts.values())).toBeGreaterThan(perChar * 0.8);
    expect(Math.max(...counts.values())).toBeLessThan(perChar * 1.2);
  });
});

describe('utils.shortId.normalize', () => {
  // The other half of the readable-alphabet promise: without this at the route,
  // the alphabet buys nothing.
  it.each([
    ['s5oo0', 'S5000'],
    ['ILO', '110'],
    ['  abc  ', 'ABC'],
    ['o1l', '011'],
  ])('folds %s to %s', (typed, expected) => {
    expect(normalize(typed)).toBe(expected);
  });

  it('returns null for anything that is not a string', () => {
    expect(normalize(42)).toBe(null);
    expect(normalize(null)).toBe(null);
  });

  it('leaves an id it produced untouched', () => {
    const id = draw();

    expect(normalize(id)).toBe(id);
  });

  // [F24] Crockford autorise les séparateurs précisément pour qu'un identifiant
  // se groupe, et « 4H7, tiret, M2K » est la forme sous laquelle il revient au
  // téléphone. Laissés en place, ils faisaient échouer l'égalité exacte sur le
  // `keyword` ES : l'identifiant « ne résolvait vers rien ».
  it.each([
    ['4H7-M2K', '4H7M2K'],
    ['4H7 M2K', '4H7M2K'],
    ['4h7-m2k', '4H7M2K'],
    ['  4H7 - M2K  ', '4H7M2K'],
  ])('drops the separators of %s', (typed, expected) => {
    expect(normalize(typed)).toBe(expected);
  });

  // Valider l'alphabet donne une réponse à vérifier au lieu d'une recherche qui
  // ne trouve rien. `U` est exclu par Crockford et n'est mappé sur rien.
  it.each([
    ['a character outside the alphabet', '4H7U2K'],
    ['punctuation', '4H7.M2K'],
    ['an accent', '4H7É2K'],
    ['an empty string', ''],
    ['separators only', ' - '],
  ])('returns null for %s', (_label, typed) => {
    expect(normalize(typed)).toBe(null);
  });
});

describe('utils.shortId (unique, the default export)', () => {
  // Single-character ids against a third of the alphabet: collisions land often
  // enough that the redraw path is genuinely exercised, while ten in a row —
  // what makes `unique` give up — stays far out of reach at this ratio.
  const third = () => new Set(ALPHABET.slice(0, 10).split(''));

  // A FRESH set per iteration, and that is the whole point. `unique` adds each
  // draw to `taken` — the behaviour the next test exists to pin — so a loop
  // sharing one set walks it toward saturation instead of holding the ratio
  // still: starting at 10 of 32 and drawing 15 times ends at 24 of 32, where ten
  // collisions in a row carry a 5.6% chance on that iteration alone and the test
  // as a whole failed about one run in seven. It was written believing `taken`
  // stayed at 10, and it flaked. Measured before fixing: 2 failures in 25 runs.
  //
  // Held at 10 of 32, a spurious failure is around one run in ten thousand.
  it('never returns an id already taken', () => {
    for (let i = 0; i < 15; i += 1) {
      const taken = third();
      const before = new Set(taken);

      expect(before.has(unique(taken, 1))).toBe(false);
    }
  });

  // The point of returning through `taken`: a caller assigning ids to a batch
  // gets uniqueness across the batch without having to remember to record each
  // draw, which is the mistake that ships duplicates.
  it('remembers what it just handed out', () => {
    const taken = new Set();
    const handed = Array.from({ length: 200 }, () => unique(taken));

    expect(new Set(handed).size).toBe(200);
    expect(taken.size).toBe(200);
  });

  it.each([
    ['a Set', () => new Set(['0'])],
    ['a plain array', () => ['0']],
  ])('accepts %s and grows it', (_label, make) => {
    const taken = make();
    const id = unique(taken, 6);

    expect(id).not.toBe('0');
    expect(Array.isArray(taken) ? taken.includes(id) : taken.has(id)).toBe(true);
  });

  // [F21] La Map était acceptée, et l'enregistrement y écrivait `set(id, true)`
  // — des entrées fantômes au milieu des vraies valeurs, si bien que le premier
  // `for (const t of taken.values())` de l'appelant mourait sur `true.begin`.
  // Sur une `Map<id, plage>` il n'y a rien d'honnête à enregistrer : on n'a pas
  // la plage. Refuser tout de suite, en disant quoi faire, vaut mieux qu'un
  // TypeError plus tard chez l'appelant.
  it('refuses a Map rather than seeding it with phantom values', () => {
    const taken = new Map([['0', { some: 'value' }]]);

    expect(() => unique(taken, 6)).toThrow(/must be a Set or an array/);
    expect(taken.get('0')).toEqual({ some: 'value' });
    expect(taken.size).toBe(1);
  });

  // La promesse « anything with a `.has()` » que portait le commentaire était
  // déjà fausse : une telle collection levait `taken.add is not a function`,
  // seulement après un tirage réussi, donc par intermittence.
  it('refuses a collection that only knows how to answer has()', () => {
    expect(() => unique({ has: () => false }, 6)).toThrow(
      /must be a Set or an array/,
    );
  });

  it('gives up on the facts rather than a diagnosis', () => {
    const taken = new Set(ALPHABET.split(''));

    expect(() => unique(taken, 1)).toThrow(/identifier space is too small/);
  });
});

describe('utils.shortId — les garde-fous du module', () => {
  // [F26] Le plafond du modulo est dérivé de l'alphabet, pas écrit à côté :
  // désynchronisés, les deux sens échouent en silence — un alphabet raccourci
  // rend `undefined` pour le dernier reste et les identifiants contiennent la
  // chaîne littérale « undefined », un alphabet allongé n'est jamais tiré en
  // entier.
  it('keeps an alphabet whose size divides 256', () => {
    expect(256 % ALPHABET.length).toBe(0);
  });

  // [F29] Le plafond vaut pour les deux portes : `unique` valide la longueur
  // avant de tirer, et devait refuser la même chose que `draw`.
  it('applies the same length ceiling to unique', () => {
    expect(() => unique(new Set(), 65537)).toThrow(
      /length must be an integer between 1 and 65536/,
    );
  });
});
