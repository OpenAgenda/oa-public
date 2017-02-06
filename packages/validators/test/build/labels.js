"use strict";

/**
 * french & english labels matching
 * error codes
 */

var presetLang = 'en';

module.exports = {

  getLabel: getLabel,

  setLang: setLang,

  'number.toosmall': {
    fr: 'Le nombre doit être supérieur ou égal à %min%',
    en: 'The number must be equal to or higher than %min%'
  },

  'number.toobig': {
    fr: 'Le nombre doit être inférieur ou égal à %max%',
    en: 'The number must be equal to or lower than %max%'
  },

  'multi-input.info': {
    fr: 'Saisissez une ou plusieurs valeurs',
    en: 'Type in one or multiple values'
  },

  'multi-input.error': {
    fr: 'Les saisies non valides ne seront pas sauvegardées',
    en: 'Invalid entries will not be saved'
  },

  'string.tooshort': {
    fr: 'Le champ doit comporter au moins %min% caractères',
    en: 'The field must contain at least %min% caracters'
  },

  'string.toolong': {
    fr: 'Le champ doit comporter au plus %max% caractères',
    en: 'The field must contain at must %max% caracters'
  },

  'email.invalid': {
    fr: 'Un email valide doit être renseigné',
    en: 'A valid email must be input'
  },

  'phone.invalid': {
    fr: 'Un numéro de télephone valide doit être renseigné',
    en: 'A valid phone number must be input'
  },

  'link.invalid': {
    fr: 'Un lien valide doit être renseigné',
    en: 'A valid link must be input'
  },

  'number.invalid': {
    fr: 'Un nombre valide doit être renseigné',
    en: 'A valid number must be input'
  },

  'groupTags.required': {
    fr: 'Au moins un élément doit être sélectionné',
    en: 'At least one item must be selected'
  },

  'required': {
    fr: 'Requis',
    en: 'Required'
  }

};

function getLabel(name, values, lang) {

  if (arguments.length == 2 && typeof values == 'string') {

    lang = values;
    values = {};
  }

  if (!lang) {

    lang = presetLang;
  }

  if (!module.exports[name]) {

    return null;
  }

  var str = module.exports[name][lang],
      k;

  if (values) {

    for (k in values) {

      str = str.replace('%' + k + '%', values[k]);
    }
  }

  return str;
}

function setLang(lang) {

  presetLang = lang;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYWJlbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7O0FBS0EsSUFBSSxhQUFhLElBQWpCOztBQUVBLE9BQU8sT0FBUCxHQUFpQjs7QUFFZixZQUFVLFFBRks7O0FBSWYsV0FBUyxPQUpNOztBQU1mLHFCQUFvQjtBQUNsQixRQUFJLCtDQURjO0FBRWxCLFFBQUk7QUFGYyxHQU5MOztBQVdmLG1CQUFrQjtBQUNoQixRQUFJLCtDQURZO0FBRWhCLFFBQUk7QUFGWSxHQVhIOztBQWdCZixzQkFBb0I7QUFDbEIsUUFBSSxvQ0FEYztBQUVsQixRQUFJO0FBRmMsR0FoQkw7O0FBcUJmLHVCQUFxQjtBQUNuQixRQUFJLG9EQURlO0FBRW5CLFFBQUk7QUFGZSxHQXJCTjs7QUEwQmYscUJBQW9CO0FBQ2xCLFFBQUksbURBRGM7QUFFbEIsUUFBSTtBQUZjLEdBMUJMOztBQStCZixvQkFBbUI7QUFDakIsUUFBSSxrREFEYTtBQUVqQixRQUFJO0FBRmEsR0EvQko7O0FBb0NmLG1CQUFrQjtBQUNoQixRQUFJLHFDQURZO0FBRWhCLFFBQUk7QUFGWSxHQXBDSDs7QUF5Q2YsbUJBQWtCO0FBQ2hCLFFBQUksbURBRFk7QUFFaEIsUUFBSTtBQUZZLEdBekNIOztBQThDZixrQkFBaUI7QUFDZixRQUFJLG9DQURXO0FBRWYsUUFBSTtBQUZXLEdBOUNGOztBQW1EZixvQkFBbUI7QUFDakIsUUFBSSxzQ0FEYTtBQUVqQixRQUFJO0FBRmEsR0FuREo7O0FBd0RmLHdCQUF1QjtBQUNyQixRQUFJLDJDQURpQjtBQUVyQixRQUFJO0FBRmlCLEdBeERSOztBQTZEZixjQUFZO0FBQ1YsUUFBSSxRQURNO0FBRVYsUUFBSTtBQUZNOztBQTdERyxDQUFqQjs7QUFvRUEsU0FBUyxRQUFULENBQW1CLElBQW5CLEVBQXlCLE1BQXpCLEVBQWlDLElBQWpDLEVBQXdDOztBQUV0QyxNQUFLLFVBQVUsTUFBVixJQUFvQixDQUFwQixJQUF5QixPQUFPLE1BQVAsSUFBaUIsUUFBL0MsRUFBMEQ7O0FBRXhELFdBQU8sTUFBUDtBQUNBLGFBQVMsRUFBVDtBQUVEOztBQUVELE1BQUssQ0FBQyxJQUFOLEVBQWE7O0FBRVgsV0FBTyxVQUFQO0FBRUQ7O0FBRUQsTUFBSyxDQUFDLE9BQU8sT0FBUCxDQUFnQixJQUFoQixDQUFOLEVBQStCOztBQUU3QixXQUFPLElBQVA7QUFFRDs7QUFFRCxNQUFJLE1BQU0sT0FBTyxPQUFQLENBQWdCLElBQWhCLEVBQXdCLElBQXhCLENBQVY7QUFBQSxNQUEwQyxDQUExQzs7QUFFQSxNQUFLLE1BQUwsRUFBYzs7QUFFWixTQUFLLENBQUwsSUFBVSxNQUFWLEVBQW1COztBQUVqQixZQUFNLElBQUksT0FBSixDQUFhLE1BQU0sQ0FBTixHQUFVLEdBQXZCLEVBQTRCLE9BQVEsQ0FBUixDQUE1QixDQUFOO0FBRUQ7QUFFRjs7QUFFRCxTQUFPLEdBQVA7QUFFRDs7QUFHRCxTQUFTLE9BQVQsQ0FBa0IsSUFBbEIsRUFBeUI7O0FBRXZCLGVBQWEsSUFBYjtBQUVEIiwiZmlsZSI6ImxhYmVscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIGZyZW5jaCAmIGVuZ2xpc2ggbGFiZWxzIG1hdGNoaW5nXG4gKiBlcnJvciBjb2Rlc1xuICovXG5cbnZhciBwcmVzZXRMYW5nID0gJ2VuJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0TGFiZWw6IGdldExhYmVsLFxuXG4gIHNldExhbmc6IHNldExhbmcsXG5cbiAgJ251bWJlci50b29zbWFsbCcgOiB7XG4gICAgZnI6ICdMZSBub21icmUgZG9pdCDDqnRyZSBzdXDDqXJpZXVyIG91IMOpZ2FsIMOgICVtaW4lJyxcbiAgICBlbjogJ1RoZSBudW1iZXIgbXVzdCBiZSBlcXVhbCB0byBvciBoaWdoZXIgdGhhbiAlbWluJSdcbiAgfSxcblxuICAnbnVtYmVyLnRvb2JpZycgOiB7XG4gICAgZnI6ICdMZSBub21icmUgZG9pdCDDqnRyZSBpbmbDqXJpZXVyIG91IMOpZ2FsIMOgICVtYXglJyxcbiAgICBlbjogJ1RoZSBudW1iZXIgbXVzdCBiZSBlcXVhbCB0byBvciBsb3dlciB0aGFuICVtYXglJ1xuICB9LFxuXG4gICdtdWx0aS1pbnB1dC5pbmZvJzoge1xuICAgIGZyOiAnU2Fpc2lzc2V6IHVuZSBvdSBwbHVzaWV1cnMgdmFsZXVycycsXG4gICAgZW46ICdUeXBlIGluIG9uZSBvciBtdWx0aXBsZSB2YWx1ZXMnXG4gIH0sXG5cbiAgJ211bHRpLWlucHV0LmVycm9yJzoge1xuICAgIGZyOiAnTGVzIHNhaXNpZXMgbm9uIHZhbGlkZXMgbmUgc2Vyb250IHBhcyBzYXV2ZWdhcmTDqWVzJyxcbiAgICBlbjogJ0ludmFsaWQgZW50cmllcyB3aWxsIG5vdCBiZSBzYXZlZCdcbiAgfSxcblxuICAnc3RyaW5nLnRvb3Nob3J0JyA6IHtcbiAgICBmcjogJ0xlIGNoYW1wIGRvaXQgY29tcG9ydGVyIGF1IG1vaW5zICVtaW4lIGNhcmFjdMOocmVzJyxcbiAgICBlbjogJ1RoZSBmaWVsZCBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgJW1pbiUgY2FyYWN0ZXJzJ1xuICB9LFxuXG4gICdzdHJpbmcudG9vbG9uZycgOiB7XG4gICAgZnI6ICdMZSBjaGFtcCBkb2l0IGNvbXBvcnRlciBhdSBwbHVzICVtYXglIGNhcmFjdMOocmVzJyxcbiAgICBlbjogJ1RoZSBmaWVsZCBtdXN0IGNvbnRhaW4gYXQgbXVzdCAlbWF4JSBjYXJhY3RlcnMnXG4gIH0sXG5cbiAgJ2VtYWlsLmludmFsaWQnIDoge1xuICAgIGZyOiAnVW4gZW1haWwgdmFsaWRlIGRvaXQgw6p0cmUgcmVuc2VpZ27DqScsXG4gICAgZW46ICdBIHZhbGlkIGVtYWlsIG11c3QgYmUgaW5wdXQnXG4gIH0sXG5cbiAgJ3Bob25lLmludmFsaWQnIDoge1xuICAgIGZyOiAnVW4gbnVtw6lybyBkZSB0w6lsZXBob25lIHZhbGlkZSBkb2l0IMOqdHJlIHJlbnNlaWduw6knLFxuICAgIGVuOiAnQSB2YWxpZCBwaG9uZSBudW1iZXIgbXVzdCBiZSBpbnB1dCdcbiAgfSxcblxuICAnbGluay5pbnZhbGlkJyA6IHtcbiAgICBmcjogJ1VuIGxpZW4gdmFsaWRlIGRvaXQgw6p0cmUgcmVuc2VpZ27DqScsXG4gICAgZW46ICdBIHZhbGlkIGxpbmsgbXVzdCBiZSBpbnB1dCdcbiAgfSxcblxuICAnbnVtYmVyLmludmFsaWQnIDoge1xuICAgIGZyOiAnVW4gbm9tYnJlIHZhbGlkZSBkb2l0IMOqdHJlIHJlbnNlaWduw6knLFxuICAgIGVuOiAnQSB2YWxpZCBudW1iZXIgbXVzdCBiZSBpbnB1dCdcbiAgfSxcblxuICAnZ3JvdXBUYWdzLnJlcXVpcmVkJyA6IHtcbiAgICBmcjogJ0F1IG1vaW5zIHVuIMOpbMOpbWVudCBkb2l0IMOqdHJlIHPDqWxlY3Rpb25uw6knLFxuICAgIGVuOiAnQXQgbGVhc3Qgb25lIGl0ZW0gbXVzdCBiZSBzZWxlY3RlZCdcbiAgfSxcblxuICAncmVxdWlyZWQnOiB7XG4gICAgZnI6ICdSZXF1aXMnLFxuICAgIGVuOiAnUmVxdWlyZWQnXG4gIH1cblxufVxuXG5mdW5jdGlvbiBnZXRMYWJlbCggbmFtZSwgdmFsdWVzLCBsYW5nICkge1xuXG4gIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PSAyICYmIHR5cGVvZiB2YWx1ZXMgPT0gJ3N0cmluZycgKSB7XG5cbiAgICBsYW5nID0gdmFsdWVzO1xuICAgIHZhbHVlcyA9IHt9O1xuXG4gIH1cblxuICBpZiAoICFsYW5nICkge1xuXG4gICAgbGFuZyA9IHByZXNldExhbmc7XG5cbiAgfVxuXG4gIGlmICggIW1vZHVsZS5leHBvcnRzWyBuYW1lIF0gKSB7IFxuXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgfVxuXG4gIHZhciBzdHIgPSBtb2R1bGUuZXhwb3J0c1sgbmFtZSBdWyBsYW5nIF0sIGs7XG5cbiAgaWYgKCB2YWx1ZXMgKSB7XG5cbiAgICBmb3IoIGsgaW4gdmFsdWVzICkge1xuXG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSggJyUnICsgayArICclJywgdmFsdWVzWyBrIF0gKTtcblxuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuIHN0cjtcblxufVxuXG5cbmZ1bmN0aW9uIHNldExhbmcoIGxhbmcgKSB7XG5cbiAgcHJlc2V0TGFuZyA9IGxhbmc7XG5cbn0iXX0=