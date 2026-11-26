import tokenizeSearch from '../tokenizeSearch.js';

describe('utils.tokenizeSearch', () => {
  it('splits on separators and drops single characters', () => {
    expect(tokenizeSearch("Hôtel-de-ville l'été")).toEqual([
      'Hôtel',
      'ville',
      'été',
    ]);
  });

  it('drops French stopwords unless only stopwords are left', () => {
    expect(tokenizeSearch('Nuit des musées')).toEqual(['Nuit', 'musées']);
    expect(tokenizeSearch('de la')).toEqual(['de', 'la']);
  });

  it('answers no token for a non-string', () => {
    expect(tokenizeSearch(undefined)).toEqual([]);
  });
});
