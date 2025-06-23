"use strict";

/**
 * french & english labels matching
 * error codes
 */
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.replace.js");
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
//# sourceMappingURL=labels.js.map