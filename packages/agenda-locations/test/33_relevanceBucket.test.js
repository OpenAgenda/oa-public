import { relevanceBucket, deburr } from '../lib/scoreLocation.js';
import tokenizeSearch from '../lib/tokenizeSearch.js';

// Mirror how list.js feeds the ranker: tokenize the search, deburr each token.
const bucketOf = (placename, search) =>
  relevanceBucket(placename, tokenizeSearch(search).map(deburr));

describe('relevanceBucket (per-token relevance)', () => {
  it('0 — placename is exactly the query words', () => {
    expect(bucketOf('Château Musée', 'château musée')).toBe(0);
  });

  it('1 — placename begins with the first token (full or partial)', () => {
    expect(bucketOf('Mairie de Rezé', 'mairie rezé')).toBe(1);
    expect(bucketOf('Médiathèque municipale', 'media')).toBe(1);
  });

  it('2 — every token is a whole word of the placename, in any order', () => {
    expect(bucketOf("Beffroi de l'Hôtel de Ville", 'ville hôtel')).toBe(2);
    expect(bucketOf('Château Musée', 'musée château')).toBe(2); // reversed
  });

  it('3 — tokens appear only as substrings, not whole words', () => {
    expect(bucketOf('Salle Polyvalente', 'valente')).toBe(3);
  });

  it('4 — a token is absent from the placename (matched via another column)', () => {
    expect(bucketOf('Salle Polyvalente', 'mairie polyvalente')).toBe(4);
  });

  it('is accent- and case-insensitive', () => {
    expect(bucketOf('Château Musée', 'CHATEAU MUSEE')).toBe(0);
  });

  // The whole point of the fix: the old whole-string bucket scored every one of
  // these as the worst bucket (so ranking collapsed to recency); per-token
  // scoring now ranks them by genuine relevance.
  it('regression: reordered / connector-word multi-word queries no longer collapse', () => {
    expect(bucketOf("Beffroi de l'Hôtel de Ville", 'ville hôtel')).toBeLessThan(
      3,
    );
    expect(bucketOf('Mairie de Rezé', 'mairie rezé')).toBeLessThan(3);
    expect(bucketOf('Château Musée', 'musée château')).toBeLessThan(3);
  });
});
