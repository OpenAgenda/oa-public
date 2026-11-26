import {
  relevanceBucket,
  deburr,
  foldText,
  fuzzyScore,
} from '../searchRank.js';
import tokenizeSearch from '../tokenizeSearch.js';

// Mirror how a caller feeds the ranker: tokenize the search, deburr each token.
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

describe('foldText', () => {
  it('folds case, accents, compatibility forms and ligatures', () => {
    expect(foldText('Métropole 𝗟𝗶𝗹𝗹𝗲')).toBe('metropole lille');
    expect(foldText('Œil, Cæcilia')).toBe('oeil caecilia');
  });

  it('turns what is neither a letter nor a digit into a word break', () => {
    expect(foldText("lille🎉métropole, l'été")).toBe('lille metropole l ete');
    expect(foldText('🎉')).toBe('');
  });
});

describe('fuzzyScore', () => {
  it('forgives one edit on a short word and two on a longer one', () => {
    expect(fuzzyScore(['lile'], 'metropole de lille')).toBe(1);
    expect(fuzzyScore(['metrople', 'lile'], 'metropole de lille')).toBe(2);
  });

  it('refuses a word too far from every word of the text', () => {
    expect(fuzzyScore(['lyon'], 'metropole de lille')).toBeNull();
  });
});
