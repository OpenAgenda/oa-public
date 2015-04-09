module.exports = function(data){

  if (!lib.contains(['France', 'La Réunion', 'Martinique', 'Guadeloupe', 'Mayotte'], data.country)) return data;
  
  for (var i = data.pieces.length - 1; i >= 0; i--) {

    if (typeof indexed[data.pieces[i]] !== 'undefined') {

      data.region = departments[indexed[data.pieces[i]]].region;

      data.department = departments[indexed[data.pieces[i]]].name;

      return data;

    }

  }

  // if we reach here, then the department was not found. there may be a matching postal code though amongst the pieces
  
  for (i = data.pieces.length - 1; i >= 0; i--) {

    if (data.pieces[i].match(/^[0-9][0-9][0-9][0-9][0-9]$/)) {
      for (var j = departments.length - 1; j >= 0; j--) {
        if (departments[j].code==data.pieces[i].substr(0,2)) {
          
          data.region = departments[j].region;

          data.department = departments[j].name;

          return data;

        }
      }
    }

  }

  return data;
};

var departments = [
  { name: 'Ain', region: 'Rhône-Alpes', code: '01', country: 'FR' },
  { name: 'Aisne', region: 'Picardie', code: '02', country: 'FR' },
  { name: 'Allier', region: 'Auvergne', code: '03', country: 'FR' },
  { name: 'Alpes-de-Haute-Provence', region: 'Provence-Alpes-Côte d\'Azur', code: '04', country: 'FR' },
  { name: 'Hautes-Alpes', region: 'Provence-Alpes-Côte d\'Azur', code: '05', country: 'FR' },
  { name: 'Alpes-Maritimes', region: 'Provence-Alpes-Côte d\'Azur', code: '06', country: 'FR' },
  { name: 'Ardèche', region: 'Rhône-Alpes', code: '07', country: 'FR' },
  { name: 'Ardennes', region: 'Champagne-Ardenne', code: '08', country: 'FR' },
  { name: 'Ariège', region: 'Midi-Pyrénées', code: '09', country: 'FR' },
  { name: 'Aube', region: 'Champagne-Ardenne', code: '10', country: 'FR' },
  { name: 'Aude', region: 'Languedoc-Roussillon', code: '11', country: 'FR' },
  { name: 'Aveyron', region: 'Midi-Pyrénées', code: '12', country: 'FR' },
  { name: 'Bouches-du-Rhône', region: 'Provence-Alpes-Côte d\'Azur', code: '13', country: 'FR' },
  { name: 'Calvados', region: 'Basse-Normandie', code: '14', country: 'FR' },
  { name: 'Cantal', region: 'Auvergne', code: '15', country: 'FR' },
  { name: 'Charente', region: 'Poitou-Charentes', code: '16', country: 'FR' },
  { name: 'Charente-Maritime', region: 'Poitou-Charentes', code: '17', country: 'FR' },
  { name: 'Cher', region: 'Centre', code: '18', country: 'FR' },
  { name: 'Corrèze', region: '  Limousin', code: '19', country: 'FR' },
  { name: 'Corse-du-Sud', region: 'Corse', code: '2A', country: 'FR' },
  { name: 'Haute-Corse', region: 'Corse', code: '2B', country: 'FR' },
  { name: 'Côte-d\'Or', region: 'Bourgogne', code: '21', country: 'FR' },
  { name: 'Côtes-d\'Armor', region: 'Bretagne', code: '22', country: 'FR' },
  { name: 'Creuse', region: 'Limousin', code: '23', country: 'FR' },
  { name: 'Dordogne', region: 'Aquitaine', code: '24', country: 'FR' },
  { name: 'Doubs', region: 'Franche-Comté', code: '25', country: 'FR' },
  { name: 'Drôme', region: 'Rhône-Alpes', code: '26', country: 'FR' },
  { name: 'Eure', region: 'Haute-Normandie', code: '27', country: 'FR' },
  { name: 'Eure-et-Loir', region: 'Centre', code: '28', country: 'FR' },
  { name: 'Finistère', region: 'Bretagne', code: '29', country: 'FR' },
  { name: 'Gard', region: 'Languedoc-Roussillon', code: '30', country: 'FR' },
  { name: 'Haute-Garonne', region: 'Midi-Pyrénées', code: '31', country: 'FR' },
  { name: 'Gers', region: 'Midi-Pyrénées', code: '32', country: 'FR' },
  { name: 'Gironde', region: 'Aquitaine', code: '33', country: 'FR' },
  { name: 'Hérault', region: 'Languedoc-Roussillon', code: '34', country: 'FR' },
  { name: 'Ille-et-Vilaine', region: 'Bretagne', code: '35', country: 'FR' },
  { name: 'Indre', region: 'Centre', code: '36', country: 'FR' },
  { name: 'Indre-et-Loire', region: 'Centre', code: '37', country: 'FR' },
  { name: 'Isère', region: 'Rhône-Alpes', code: '38', country: 'FR' },
  { name: 'Jura', region: 'Franche-Comté', code: '39', country: 'FR' },
  { name: 'Landes', region: 'Aquitaine', code: '40', country: 'FR' },
  { name: 'Loir-et-Cher', region: 'Centre', code: '41', country: 'FR' },
  { name: 'Loire', region: 'Rhône-Alpes', code: '42', country: 'FR' },
  { name: 'Haute-Loire', region: 'Auvergne', code: '43', country: 'FR' },
  { name: 'Loire-Atlantique', region: 'Pays de la Loire', code: '44', country: 'FR' },
  { name: 'Loiret', region: 'Centre', code: '45', country: 'FR' },
  { name: 'Lot', region: 'Midi-Pyrénées', code: '46', country: 'FR' },
  { name: 'Lot-et-Garonne', region: 'Aquitaine', code: '47', country: 'FR' },
  { name: 'Lozère', region: 'Languedoc-Roussillon', code: '48', country: 'FR' },
  { name: 'Maine-et-Loire', region: 'Pays de la Loire', code: '49', country: 'FR' },
  { name: 'Manche', region: 'Basse-Normandie', code: '50', country: 'FR' },
  { name: 'Marne', region: 'Champagne-Ardenne', code: '51', country: 'FR' },
  { name: 'Haute-Marne', region: 'Champagne-Ardenne', code: '52', country: 'FR' },
  { name: 'Mayenne', region: 'Pays de la Loire', code: '53', country: 'FR' },
  { name: 'Meurthe-et-Moselle', region: 'Lorraine', code: '54', country: 'FR' },
  { name: 'Meuse', region: 'Lorraine', code: '55', country: 'FR' },
  { name: 'Morbihan', region: 'Bretagne', code: '56', country: 'FR' },
  { name: 'Moselle', region: 'Lorraine', code: '57', country: 'FR' },
  { name: 'Nièvre', region: 'Bourgogne', code: '58', country: 'FR' },
  { name: 'Nord', region: 'Nord-Pas-de-Calais', code: '59', country: 'FR' },
  { name: 'Oise', region: 'Picardie', code: '60', country: 'FR' },
  { name: 'Orne', region: 'Basse-Normandie', code: '61', country: 'FR' },
  { name: 'Pas-de-Calais', region: 'Nord-Pas-de-Calais', code: '62', country: 'FR' },
  { name: 'Puy-de-Dôme', region: 'Auvergne', code: '63', country: 'FR' },
  { name: 'Pyrénées-Atlantiques', region: 'Aquitaine', code: '64', country: 'FR' },
  { name: 'Hautes-Pyrénées', region: 'Midi-Pyrénées', code: '65', country: 'FR' },
  { name: 'Pyrénées-Orientales', region: 'Languedoc-Roussillon', code: '66', country: 'FR' },
  { name: 'Bas-Rhin', region: 'Alsace', code: '67', country: 'FR' },
  { name: 'Haut-Rhin', region: 'Alsace', code: '68', country: 'FR' },
  { name: 'Rhône', region: 'Rhône-Alpes', code: '69', country: 'FR' },
  { name: 'Haute-Saône', region: 'Franche-Comté', code: '70', country: 'FR' },
  { name: 'Saône-et-Loire', region: 'Bourgogne', code: '71', country: 'FR' },
  { name: 'Sarthe', region: 'Pays de la Loire', code: '72', country: 'FR' },
  { name: 'Savoie', region: 'Rhône-Alpes', code: '73', country: 'FR' },
  { name: 'Haute-Savoie', region: 'Rhône-Alpes', code: '74', country: 'FR' },
  { name: 'Paris', region: 'Île-de-France', code: '75', country: 'FR' },
  { name: 'Seine-Maritime', region: 'Haute-Normandie', code: '76', country: 'FR' },
  { name: 'Seine-et-Marne', region: 'Île-de-France', code: '77', country: 'FR' },
  { name: 'Yvelines', region: 'Île-de-France', code: '78', country: 'FR' },
  { name: 'Deux-Sèvres', region: 'Poitou-Charentes', code: '79', country: 'FR' },
  { name: 'Somme', region: 'Picardie', code: '80', country: 'FR' },
  { name: 'Tarn', region: 'Midi-Pyrénées', code: '81', country: 'FR' },
  { name: 'Tarn-et-Garonne', region: 'Midi-Pyrénées', code: '82', country: 'FR' },
  { name: 'Var', region: 'Provence-Alpes-Côte d\'Azur', code: '83', country: 'FR' },
  { name: 'Vaucluse', region: 'Provence-Alpes-Côte d\'Azur', code: '84', country: 'FR' },
  { name: 'Vendée', region: 'Pays de la Loire', code: '85', country: 'FR' },
  { name: 'Vienne', region: 'Poitou-Charentes', code: '86', country: 'FR' },
  { name: 'Haute-Vienne', region: 'Limousin', code: '87', country: 'FR' },
  { name: 'Vosges', region: 'Lorraine', code: '88', country: 'FR' },
  { name: 'Yonne', region: 'Bourgogne', code: '89', country: 'FR' },
  { name: 'Territoire de Belfort', region: 'Franche-Comté', code: '90', country: 'FR' },
  { name: 'Essonne', region: 'Île-de-France', code: '91', country: 'FR' },
  { name: 'Hauts-de-Seine', region: 'Île-de-France', code: '92', country: 'FR' },
  { name: 'Seine-Saint-Denis', region: 'Île-de-France', code: '93', country: 'FR' },
  { name: 'Val-de-Marne', region: 'Île-de-France', code: '94', country: 'FR' },
  { name: 'Val-d\'Oise', region: 'Île-de-France', code: '95', country: 'FR' },
  { name: 'Guadeloupe', region: 'Guadeloupe', code: '971', country: 'FR' },
  { name: 'Martinique', region: 'Martinique', code: '972', country: 'FR' },
  { name: 'Guyane', region: 'Guyane', code: '973', country: 'FR' },
  { name: 'La Réunion', region: 'La Réunion', code: '974', country: 'FR' },
  { name: 'Mayotte', region: 'Mayotte', code: '976', country: 'FR' },
  { name: 'Île de Clipperton', region: 'Île de Clipperton', code: '989', country: 'FR' },
  { name: 'Saint-Barthélemy', region: 'Saint-Barthélemy', code: '977', country: 'FR' },
  { name: 'Saint-Martin', region: 'Saint-Martin', code: '978', country: 'FR' },
  { name: 'Saint-Pierre-et-Miquelon', region: 'Saint-Pierre-et-Miquelon', code: '975', country: 'FR' },
  { name: 'Polynésie française', region: 'Polynésie française', code: '987', country: 'FR' },
  { name: 'Nouvelle-Calédonie', region: 'Nouvelle-Calédonie', code: '988', country: 'FR' },
  { name: 'Wallis-et-Futuna', region: 'Wallis-et-Futuna', code: '986', country: 'FR' },
  { name: 'Terres australes et antarctiques françaises', region: 'Terres australes et antarctiques françaises', code: '984', country: 'FR' }
],

indexed = {},

initIndex = function() {

  for (var i = departments.length - 1; i >= 0; i--)
    indexed[departments[i].name] = i;

},

lib = {
  contains: function(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
  },
  forEach: function(array, action) {
    for (var i = 0; i < array.length; i++)
      action(array[i]);
  }
};

initIndex();
