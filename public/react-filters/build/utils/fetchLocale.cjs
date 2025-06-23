var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __glob = (map) => (path) => {
  var fn = map[path];
  if (fn) return fn();
  throw new Error("Module not found in bundle: " + path);
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/locales-compiled/br.json
var require_br = __commonJS({
  "src/locales-compiled/br.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "Du "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " au "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "Fin"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "\xC0 partir du "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "D\xE9but"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Jusqu'au "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "Du "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " au "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "Fin"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "\xC0 partir du "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "D\xE9but"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Jusqu'au "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Ordre chronologique"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Vue publique"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Mise \xE0 jour r\xE9cente"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Pertinence"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Choisissez un jour"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Choisissez un mois"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "Du "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " au "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "\xC0 partir du "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Jusqu'au "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Supprimer le filtre"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Supprimer le filtre ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Ce mois"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Cette semaine"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Ce week-end"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Aujourd'hui"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Demain"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "Date de fin"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Date de d\xE9but"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Carte"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Recherche"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Handicap auditif"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Handicap intellectuel"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Handicap moteur"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Handicap psychique"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Handicap visuel"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mixte"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "Sur place"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "En ligne"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Non s\xE9lectionn\xE9"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "S\xE9lectionn\xE9"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Moins d'options"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "Plus d'options"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "Aucun r\xE9sultat"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Valeur de filtre inconnue ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "En une"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibilit\xE9"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Provenance"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Intercommunalit\xE9"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Doare perzhia\xF1"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "K\xEAr"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Vro"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Date de cr\xE9ation"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Departamant"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "Quartier"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Mis en une"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "G\xE9olocalisation"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Mots cl\xE9s"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Langues"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Lieu"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Membre"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Agenda d'origine"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "R\xE9gion"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Pass\xE9 / en cours / \xE0 venir"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Agenda source"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Statut"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "\xC9tat"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Eurio\xF9"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Date de mise \xE0 jour"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Rechercher ici"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Rechercher avec la carte"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Agr\xE9gation"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribution"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Partage"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "En cours"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Pass\xE9"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "\xC0 venir"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Pr\xEAt \xE0 publier"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Publi\xE9"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Refus\xE9"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "\xC0 mod\xE9rer"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Annul\xE9"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Complet"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "D\xE9plac\xE9 en ligne"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Report\xE9"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Programm\xE9"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Reprogramm\xE9"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Sans valeur)"
        }
      ]
    };
  }
});

// src/locales-compiled/ca.json
var require_ca = __commonJS({
  "src/locales-compiled/ca.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "Inicio"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "Inicio"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Chronological order"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Public view"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Recently updated"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Relevance"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Select day"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Select month"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Eliminar filtro"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Remove filter ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Este mes"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Esta semana"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Este fin de semana"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Hoy"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Ma\xF1ana"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "End date"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Start date"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Hearing impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Intellectual impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Motor impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Psychic impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Visual impairment"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mezclado"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "Desconnectad"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "En linea"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Not selected"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "Selected"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Less options"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "More options"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "No result"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Unknown filter value ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibility"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Provenance"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Administrative level 3"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Modo de asistencia"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "City"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Pa\xEDs"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Creation date"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Department"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "District"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Keywords"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Idiomas"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Lugar"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Member"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Origin agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "Region"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Pasados / actuales / pr\xF3ximos"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Source agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Estado"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "Estado"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Fecha"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Date of update"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Search here"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Buscar en el mapa"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Aggregation"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribuci\xF3n"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Share"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "Current"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Passed"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "Pr\xF3ximos"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Controlled"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Published"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Refused"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "To moderate"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Cancelled"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Fully booked"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "Moved online"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Postponed"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Programado"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Rescheduled"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Without value)"
        }
      ]
    };
  }
});

// src/locales-compiled/de.json
var require_de = __commonJS({
  "src/locales-compiled/de.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "Von "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " bis "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "Ende"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "Von "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "Start"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Bis "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "Von "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " bis "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "Ende"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "Von "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "Start"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Bis "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Chronologische reihenfolge"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Public view"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "K\xFCrzlich aktualisiert"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Relevanz"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Select day"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Select month"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "Von "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " bis "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "Von "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Bis "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Filter entfernen"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Filter entfernen ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Search"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Diesen Monat"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Diese Woche"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Dieses Wochenende"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Heute"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Morgen"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "End date"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Start date"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Karte"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Suchen"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Suchen"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Schwerh\xF6rig"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Geistige Behinderung"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Motorische beeintr\xE4chtigung"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Psychische behinderung"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Sehbehinderung"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Gemischt"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "Offline"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "Online"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Nicht ausgew\xE4hlt"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "Ausw\xE4hlen"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Weniger Optionen"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "Mehr Optionen"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "Kein Ergebnis"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Suchen"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Unbekannter Filterwert ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "ausgew\xE4hlt"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Zug\xE4nglichkeit"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Herkunft"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Verwaltungsebene 3"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Anwesenheitsmodus"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "Stadt"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Land"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Erstellungsdatum"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Abteilung"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "Kreis"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Ausgew\xE4hlt"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "Karte"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Schl\xFCsselw\xF6rter"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Sprachen"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Ort"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Mitglied"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Origin Kalender"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "Region"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Bestanden / aktuell / bevorstehend"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Search"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Quelle Kalender"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Zustand"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "Status"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Datum"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Datum der Aktualisierung"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Search here"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Suche mit Karte"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Aggregation"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Beitrag"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "teilen"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "Aktuell"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Bestanden"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "Bevorstehend"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Kontrolliert"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Ver\xF6ffentlicht"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Verweigert"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "Moderieren"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Abgesagt"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Ausgebucht"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "Online verschoben"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Verschoben"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Geplant"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Verschoben"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Ohne Wert)"
        }
      ]
    };
  }
});

// src/locales-compiled/en.json
var require_en = __commonJS({
  "src/locales-compiled/en.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "Start"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "Start"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Chronological order"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Public view"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Recently updated"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Relevance"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Select day"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Select month"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Remove filter"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Remove filter ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Search"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "This month"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "This week"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "This week-end"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Today"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Tomorrow"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "End date"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Start date"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Search"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Search"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Hearing impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Intellectual impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Motor impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Psychic impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Visual impairment"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mixed"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "In situ"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "Online"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Not selected"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "Selected"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Less options"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "More options"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "No result"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Search"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Unknown filter value ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibility"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Provenance"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Administrative level 3"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Attendance mode"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "City"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Country"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Creation date"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Department"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "District"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Keywords"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Languages"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Location"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Member"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Origin agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "Region"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Passed / current / upcoming"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Search"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Source agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "State"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "Status"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Date"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Date of update"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Search here"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Aggregation"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribution"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Share"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "Current"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Passed"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "Upcoming"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Controlled"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Published"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Refused"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "To moderate"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Cancelled"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Fully booked"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "Moved online"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Postponed"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Scheduled"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Rescheduled"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Without value)"
        }
      ]
    };
  }
});

// src/locales-compiled/es.json
var require_es = __commonJS({
  "src/locales-compiled/es.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "Inicio"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "Inicio"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Chronological order"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Public view"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Recently updated"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Relevance"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Select day"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Select month"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Eliminar filtro"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Remove filter ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Este mes"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Esta semana"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Este fin de semana"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Hoy"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Ma\xF1ana"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "End date"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Start date"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Hearing impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Intellectual impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Motor impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Psychic impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Visual impairment"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mezclado"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "Desconnectad"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "En linea"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Not selected"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "Selected"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Less options"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "More options"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "No result"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Unknown filter value ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibility"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Provenance"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Administrative level 3"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Modo de asistencia"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "City"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Pa\xEDs"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Creation date"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Department"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "District"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Keywords"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Idiomas"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Lugar"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Member"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Origin agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "Region"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Pasados / actuales / pr\xF3ximos"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Source agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Estado"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "Estado"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Fecha"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Date of update"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Search here"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Buscar en el mapa"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Aggregation"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribuci\xF3n"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Share"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "Current"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Passed"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "Pr\xF3ximos"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Controlled"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Published"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Refused"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "To moderate"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Cancelled"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Fully booked"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "Moved online"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Postponed"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Programado"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Rescheduled"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Without value)"
        }
      ]
    };
  }
});

// src/locales-compiled/eu.json
var require_eu = __commonJS({
  "src/locales-compiled/eu.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "Inicio"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "End"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "Inicio"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Chronological order"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Public view"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Recently updated"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Relevance"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Select day"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Select month"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Eliminar filtro"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Remove filter ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Este mes"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Esta semana"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Este fin de semana"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Hoy"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Ma\xF1ana"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "End date"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Start date"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Hearing impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Intellectual impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Motor impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Psychic impairment"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Visual impairment"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mezclado"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "Desconnectad"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "En linea"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Not selected"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "Selected"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Less options"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "More options"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "No result"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Unknown filter value ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibility"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Provenance"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Administrative level 3"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Modo de asistencia"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "City"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Pa\xEDs"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Creation date"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Department"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "District"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Featured"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "Map"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Keywords"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Idiomas"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Lugar"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Member"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Origin agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "Region"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Pasados / actuales / pr\xF3ximos"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Buscar"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Source agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Estado"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "Estado"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Fecha"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Date of update"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Search here"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Buscar en el mapa"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Aggregation"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribuci\xF3n"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Share"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "Current"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Passed"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "Pr\xF3ximos"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Controlled"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Published"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Refused"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "To moderate"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Cancelled"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Fully booked"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "Moved online"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Postponed"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Programado"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Rescheduled"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Without value)"
        }
      ]
    };
  }
});

// src/locales-compiled/fr.json
var require_fr = __commonJS({
  "src/locales-compiled/fr.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "Du "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " au "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "Fin"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "\xC0 partir du "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "D\xE9but"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Jusqu'au "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "Du "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " au "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "Fin"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "\xC0 partir du "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "D\xE9but"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Jusqu'au "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Ordre chronologique"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Vue publique"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Mise \xE0 jour r\xE9cente"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Pertinence"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Choisissez un jour"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Choisissez un mois"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "Du "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " au "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "\xC0 partir du "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Jusqu'au "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Supprimer le filtre"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Supprimer le filtre ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Ce mois"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Cette semaine"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Ce week-end"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Aujourd'hui"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Demain"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "Date de fin"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Date de d\xE9but"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Carte"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Recherche"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Handicap auditif"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Handicap intellectuel"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Handicap moteur"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Handicap psychique"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Handicap visuel"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mixte"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "Sur place"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "En ligne"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Non s\xE9lectionn\xE9"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "S\xE9lectionn\xE9"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Moins d'options"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "Plus d'options"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "Aucun r\xE9sultat"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Valeur de filtre inconnue ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "En une"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibilit\xE9"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Provenance"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Intercommunalit\xE9"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Mode de participation"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "Ville"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Pays"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Date de cr\xE9ation"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "D\xE9partement"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "Quartier"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Mis en une"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "G\xE9olocalisation"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Mots cl\xE9s"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Langues"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Lieu"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Membre"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Agenda d'origine"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "R\xE9gion"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Pass\xE9 / en cours / \xE0 venir"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Rechercher"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Agenda source"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Statut"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "\xC9tat"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Date"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Date de mise \xE0 jour"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Rechercher ici"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Rechercher avec la carte"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Agr\xE9gation"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribution"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Partage"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "En cours"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Pass\xE9"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "\xC0 venir"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Pr\xEAt \xE0 publier"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Publi\xE9"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Refus\xE9"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "\xC0 mod\xE9rer"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Annul\xE9"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Complet"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "D\xE9plac\xE9 en ligne"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Report\xE9"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Programm\xE9"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Reprogramm\xE9"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Sans valeur)"
        }
      ]
    };
  }
});

// src/locales-compiled/io.json
var require_io = __commonJS({
  "src/locales-compiled/io.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "crwdns16546:0"
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: "crwdnd16546:0"
        },
        {
          type: 1,
          value: "endDate"
        },
        {
          type: 0,
          value: "crwdne16546:0"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "crwdns16548:0crwdne16548:0"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "crwdns16550:0"
        },
        {
          type: 1,
          value: "date"
        },
        {
          type: 0,
          value: "crwdne16550:0"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "crwdns16554:0crwdne16554:0"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "crwdns16556:0"
        },
        {
          type: 1,
          value: "date"
        },
        {
          type: 0,
          value: "crwdne16556:0"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "crwdns16558:0"
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: "crwdnd16558:0"
        },
        {
          type: 1,
          value: "endDate"
        },
        {
          type: 0,
          value: "crwdne16558:0"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "crwdns16560:0crwdne16560:0"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "crwdns16562:0"
        },
        {
          type: 1,
          value: "date"
        },
        {
          type: 0,
          value: "crwdne16562:0"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 0,
          value: "crwdns16564:0"
        },
        {
          type: 1,
          value: "date"
        },
        {
          type: 0,
          value: "crwdne16564:0"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "crwdns16566:0crwdne16566:0"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "crwdns16568:0"
        },
        {
          type: 1,
          value: "date"
        },
        {
          type: 0,
          value: "crwdne16568:0"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "crwdns17304:0crwdne17304:0"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "crwdns33908:0crwdne33908:0"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "crwdns17306:0crwdne17306:0"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "crwdns17308:0crwdne17308:0"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "crwdns34401:0crwdne34401:0"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "crwdns34403:0crwdne34403:0"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "crwdns34405:0"
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: "crwdnd34405:0"
        },
        {
          type: 1,
          value: "endDate"
        },
        {
          type: 0,
          value: "crwdne34405:0"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "crwdns34407:0"
        },
        {
          type: 1,
          value: "date"
        },
        {
          type: 0,
          value: "crwdne34407:0"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "crwdns34409:0"
        },
        {
          type: 1,
          value: "date"
        },
        {
          type: 0,
          value: "crwdne34409:0"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "crwdns16572:0crwdne16572:0"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "crwdns16870:0"
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: "crwdne16870:0"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "crwdns34411:0crwdne34411:0"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "crwdns16574:0crwdne16574:0"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "crwdns16576:0crwdne16576:0"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "crwdns16578:0crwdne16578:0"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "crwdns16580:0crwdne16580:0"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "crwdns16582:0crwdne16582:0"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "crwdns33910:0crwdne33910:0"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "crwdns33912:0crwdne33912:0"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "crwdns34413:0crwdne34413:0"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "crwdns34415:0crwdne34415:0"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "crwdns16584:0crwdne16584:0"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "crwdns16586:0crwdne16586:0"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "crwdns16588:0crwdne16588:0"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "crwdns32422:0crwdne32422:0"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "crwdns32424:0crwdne32424:0"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "crwdns32426:0crwdne32426:0"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "crwdns32428:0crwdne32428:0"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "crwdns32430:0crwdne32430:0"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "crwdns16872:0crwdne16872:0"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "crwdns16874:0crwdne16874:0"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "crwdns16876:0crwdne16876:0"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "crwdns17310:0crwdne17310:0"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "crwdns17312:0crwdne17312:0"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "crwdns32809:0crwdne32809:0"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "crwdns32811:0crwdne32811:0"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "crwdns32813:0crwdne32813:0"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "crwdns32815:0crwdne32815:0"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "crwdns32817:0"
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: "crwdne32817:0"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "crwdns16878:0crwdne16878:0"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "crwdns32434:0crwdne32434:0"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "crwdns16596:0crwdne16596:0"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "crwdns16598:0crwdne16598:0"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "crwdns16600:0crwdne16600:0"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "crwdns16602:0crwdne16602:0"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "crwdns33337:0crwdne33337:0"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "crwdns16604:0crwdne16604:0"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "crwdns16606:0crwdne16606:0"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "crwdns16608:0crwdne16608:0"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "crwdns16610:0crwdne16610:0"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "crwdns16612:0crwdne16612:0"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "crwdns16614:0crwdne16614:0"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "crwdns32825:0crwdne32825:0"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "crwdns16616:0crwdne16616:0"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "crwdns16618:0crwdne16618:0"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "crwdns16620:0crwdne16620:0"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "crwdns16622:0crwdne16622:0"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "crwdns16624:0crwdne16624:0"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "crwdns34417:0crwdne34417:0"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "crwdns16626:0crwdne16626:0"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "crwdns16628:0crwdne16628:0"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "crwdns16630:0crwdne16630:0"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "crwdns16632:0crwdne16632:0"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "crwdns16634:0crwdne16634:0"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "crwdns34419:0crwdne34419:0"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "crwdns32827:0crwdne32827:0"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "crwdns16880:0crwdne16880:0"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "crwdns16882:0crwdne16882:0"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "crwdns16884:0crwdne16884:0"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "crwdns16886:0crwdne16886:0"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "crwdns16888:0crwdne16888:0"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "crwdns16890:0crwdne16890:0"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "crwdns16892:0crwdne16892:0"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "crwdns16894:0crwdne16894:0"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "crwdns16896:0crwdne16896:0"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "crwdns16898:0crwdne16898:0"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "crwdns16900:0crwdne16900:0"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "crwdns16902:0crwdne16902:0"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "crwdns16904:0crwdne16904:0"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "crwdns16906:0crwdne16906:0"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "crwdns16908:0crwdne16908:0"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "crwdns16910:0crwdne16910:0"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "crwdns16912:0crwdne16912:0"
        }
      ]
    };
  }
});

// src/locales-compiled/it.json
var require_it = __commonJS({
  "src/locales-compiled/it.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "Fine"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "Da "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "Iniziare"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "Da "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " a "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "Fine"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "Da "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "Iniziare"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "Ordine cronologico"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Vista pubblica"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Aggiornamento recente"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Rilevanza"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Select day"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Select month"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "From "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " to "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "Da "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Until "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Rimuovere il filtro"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Remove filter ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Cerca"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Mese corrente"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Settimana corrente"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Questo week end"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "Oggi"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Domani"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "End date"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Start date"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Mappa"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Cerca"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Cerca"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Disabilit\xE0 uditiva"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Disabilit\xE0 cognitiva"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Disabilit\xE0 motoria"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Disabilit\xE0 psichica"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Disabilit\xE0 visiva"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mista"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "In presenza"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "Evento online"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Non selezionato"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "Selezionato"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Less options"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "More options"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "Nessun risultato"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Cerca"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Unknown filter value ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "Fissato"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibilit\xE0"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Origine"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Citt\xE0 metropolitane"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "Modalit\xE0 di partecipazione"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "Citt\xE0"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Paese"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Creazione del record"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Provincia"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "Quartiere"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Fissato"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "Mappa"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Parole Chiave"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Lingue"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "Luogo"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Membro"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Origin agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "Regione"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Passati / in corso / futuri"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Cerca"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Source agenda"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Stato"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "Stato"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Orari"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Data di aggiornamento"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Search here"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Cercare con la carta"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Aggregazione"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribuzione"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Condividere"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "Attuale"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Passato"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "Futuro"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Controllato"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Pubblicato"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Rifiutato"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "Da moderare"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Cancellato"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Completo"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "Oramai online"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Riprogrammato"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Programmato"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Riprogrammato"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Nessun valore)"
        }
      ]
    };
  }
});

// src/locales-compiled/oc.json
var require_oc = __commonJS({
  "src/locales-compiled/oc.json"(exports2, module2) {
    module2.exports = {
      "ReactFilters.DateRangeFilter.dateRange": [
        {
          type: 0,
          value: "Del "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " al "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DateRangeFilter.endDate": [
        {
          type: 0,
          value: "Fin"
        }
      ],
      "ReactFilters.DateRangeFilter.from": [
        {
          type: 0,
          value: "A comptar del "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DateRangeFilter.startDate": [
        {
          type: 0,
          value: "Comen\xE7ar"
        }
      ],
      "ReactFilters.DateRangeFilter.until": [
        {
          type: 0,
          value: "Fins al "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.dateRange": [
        {
          type: 0,
          value: "Del "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " al "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.DefinedRangeFilter.endDate": [
        {
          type: 0,
          value: "Fin"
        }
      ],
      "ReactFilters.DefinedRangeFilter.from": [
        {
          type: 0,
          value: "A comptar del "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.singleDate": [
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.DefinedRangeFilter.startDate": [
        {
          type: 0,
          value: "Comen\xE7ar"
        }
      ],
      "ReactFilters.DefinedRangeFilter.until": [
        {
          type: 0,
          value: "Fins al "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.Sort.chronological": [
        {
          type: 0,
          value: "\xD2rdre cronologic"
        }
      ],
      "ReactFilters.Sort.publicView": [
        {
          type: 0,
          value: "Vue publique"
        }
      ],
      "ReactFilters.Sort.recentlyUpdated": [
        {
          type: 0,
          value: "Mes a jorn recentament"
        }
      ],
      "ReactFilters.Sort.relevance": [
        {
          type: 0,
          value: "Pertin\xE9ncia"
        }
      ],
      "ReactFilters.TimelineField.selectDay": [
        {
          type: 0,
          value: "Choisissez un jour"
        }
      ],
      "ReactFilters.TimelineField.selectMonth": [
        {
          type: 0,
          value: "Choisissez un mois"
        }
      ],
      "ReactFilters.TimelineFilter.dateRange": [
        {
          type: 0,
          value: "Del "
        },
        {
          type: 1,
          value: "startDate"
        },
        {
          type: 0,
          value: " al "
        },
        {
          type: 1,
          value: "endDate"
        }
      ],
      "ReactFilters.TimelineFilter.from": [
        {
          type: 0,
          value: "A comptar del "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.TimelineFilter.until": [
        {
          type: 0,
          value: "Fins al "
        },
        {
          type: 1,
          value: "date"
        }
      ],
      "ReactFilters.ValueBadge.removeFilter": [
        {
          type: 0,
          value: "Tirar lo filtre"
        }
      ],
      "ReactFilters.ValueBadge.removeFilterWithTitle": [
        {
          type: 0,
          value: "Tirar lo filtre ("
        },
        {
          type: 1,
          value: "title"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.components.fields.SearchInput.ariaLabel": [
        {
          type: 0,
          value: "Cercar"
        }
      ],
      "ReactFilters.dateRanges.currentMonth": [
        {
          type: 0,
          value: "Mes en cors"
        }
      ],
      "ReactFilters.dateRanges.currentWeek": [
        {
          type: 0,
          value: "Setmana en cors"
        }
      ],
      "ReactFilters.dateRanges.thisWeekend": [
        {
          type: 0,
          value: "Aquesta dimenjada"
        }
      ],
      "ReactFilters.dateRanges.today": [
        {
          type: 0,
          value: "U\xE8i"
        }
      ],
      "ReactFilters.dateRanges.tomorrow": [
        {
          type: 0,
          value: "Deman"
        }
      ],
      "ReactFilters.fields.NumberRangeField.gte": [
        {
          type: 0,
          value: "Min"
        }
      ],
      "ReactFilters.fields.NumberRangeField.lte": [
        {
          type: 0,
          value: "Max"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.endDate": [
        {
          type: 0,
          value: "Date de fin"
        }
      ],
      "ReactFilters.fields.SimpleRangeField.startDate": [
        {
          type: 0,
          value: "Date de d\xE9but"
        }
      ],
      "ReactFilters.filters.MapFilter.previewLabel": [
        {
          type: 0,
          value: "Mapa"
        }
      ],
      "ReactFilters.filters.searchFilter.placeholder": [
        {
          type: 0,
          value: "Cercar"
        }
      ],
      "ReactFilters.filters.searchFilter.previewLabel": [
        {
          type: 0,
          value: "Cercar"
        }
      ],
      "ReactFilters.messages.accessiblities.hi": [
        {
          type: 0,
          value: "Handicap auditiu"
        }
      ],
      "ReactFilters.messages.accessiblities.ii": [
        {
          type: 0,
          value: "Handicap intellectual"
        }
      ],
      "ReactFilters.messages.accessiblities.mi": [
        {
          type: 0,
          value: "Handicap motor"
        }
      ],
      "ReactFilters.messages.accessiblities.pi": [
        {
          type: 0,
          value: "Handicap psiquic"
        }
      ],
      "ReactFilters.messages.accessiblities.vi": [
        {
          type: 0,
          value: "Handicap visual"
        }
      ],
      "ReactFilters.messages.attendanceMode.mixed": [
        {
          type: 0,
          value: "Mesclat"
        }
      ],
      "ReactFilters.messages.attendanceMode.offline": [
        {
          type: 0,
          value: "Sus pla\xE7a"
        }
      ],
      "ReactFilters.messages.attendanceMode.online": [
        {
          type: 0,
          value: "En linha"
        }
      ],
      "ReactFilters.messages.boolean.notSelected": [
        {
          type: 0,
          value: "Pas seleccionat"
        }
      ],
      "ReactFilters.messages.boolean.selected": [
        {
          type: 0,
          value: "Seleccionat"
        }
      ],
      "ReactFilters.messages.choiceFilter.lessOptions": [
        {
          type: 0,
          value: "Mens d'opcions"
        }
      ],
      "ReactFilters.messages.choiceFilter.moreOptions": [
        {
          type: 0,
          value: "Mai d'opcions"
        }
      ],
      "ReactFilters.messages.choiceFilter.noResult": [
        {
          type: 0,
          value: "Pas cap resultat"
        }
      ],
      "ReactFilters.messages.choiceFilter.searchPlaceholder": [
        {
          type: 0,
          value: "Cercar"
        }
      ],
      "ReactFilters.messages.choiceFilter.unrecognizedOption": [
        {
          type: 0,
          value: "Valor de filtre desconeguda ("
        },
        {
          type: 1,
          value: "value"
        },
        {
          type: 0,
          value: ")"
        }
      ],
      "ReactFilters.messages.featured.featured": [
        {
          type: 0,
          value: "Meses en avant"
        }
      ],
      "ReactFilters.messages.filterTitles.accessibility": [
        {
          type: 0,
          value: "Accessibilitat"
        }
      ],
      "ReactFilters.messages.filterTitles.addMethod": [
        {
          type: 0,
          value: "Origina"
        }
      ],
      "ReactFilters.messages.filterTitles.adminLevel3": [
        {
          type: 0,
          value: "Administrative level 3"
        }
      ],
      "ReactFilters.messages.filterTitles.attendanceMode": [
        {
          type: 0,
          value: "M\xF2de de participacion"
        }
      ],
      "ReactFilters.messages.filterTitles.city": [
        {
          type: 0,
          value: "Vila"
        }
      ],
      "ReactFilters.messages.filterTitles.countryCode": [
        {
          type: 0,
          value: "Pa\xEDs"
        }
      ],
      "ReactFilters.messages.filterTitles.createdAt": [
        {
          type: 0,
          value: "Data de creacion"
        }
      ],
      "ReactFilters.messages.filterTitles.department": [
        {
          type: 0,
          value: "Departament"
        }
      ],
      "ReactFilters.messages.filterTitles.district": [
        {
          type: 0,
          value: "Districte"
        }
      ],
      "ReactFilters.messages.filterTitles.featured": [
        {
          type: 0,
          value: "Meses en avant"
        }
      ],
      "ReactFilters.messages.filterTitles.geo": [
        {
          type: 0,
          value: "Mapa"
        }
      ],
      "ReactFilters.messages.filterTitles.keyword": [
        {
          type: 0,
          value: "Mots claus"
        }
      ],
      "ReactFilters.messages.filterTitles.languages": [
        {
          type: 0,
          value: "Lengas"
        }
      ],
      "ReactFilters.messages.filterTitles.locationUid": [
        {
          type: 0,
          value: "L\xF2c"
        }
      ],
      "ReactFilters.messages.filterTitles.memberUid": [
        {
          type: 0,
          value: "Membre"
        }
      ],
      "ReactFilters.messages.filterTitles.originAgendaUid": [
        {
          type: 0,
          value: "Agenda d'origina"
        }
      ],
      "ReactFilters.messages.filterTitles.region": [
        {
          type: 0,
          value: "Region"
        }
      ],
      "ReactFilters.messages.filterTitles.relative": [
        {
          type: 0,
          value: "Passat / en cors / a venir"
        }
      ],
      "ReactFilters.messages.filterTitles.search": [
        {
          type: 0,
          value: "Cercar"
        }
      ],
      "ReactFilters.messages.filterTitles.sourceAgendaUid": [
        {
          type: 0,
          value: "Agenda sorsa"
        }
      ],
      "ReactFilters.messages.filterTitles.state": [
        {
          type: 0,
          value: "Estatut"
        }
      ],
      "ReactFilters.messages.filterTitles.status": [
        {
          type: 0,
          value: "Estat"
        }
      ],
      "ReactFilters.messages.filterTitles.timings": [
        {
          type: 0,
          value: "Data"
        }
      ],
      "ReactFilters.messages.filterTitles.updatedAt": [
        {
          type: 0,
          value: "Data de mesa a jorn"
        }
      ],
      "ReactFilters.messages.map.searchHere": [
        {
          type: 0,
          value: "Rechercher ici"
        }
      ],
      "ReactFilters.messages.map.searchWithMap": [
        {
          type: 0,
          value: "Cercar sus la mapa"
        }
      ],
      "ReactFilters.messages.provenance.aggregation": [
        {
          type: 0,
          value: "Agregacion"
        }
      ],
      "ReactFilters.messages.provenance.contribution": [
        {
          type: 0,
          value: "Contribucion"
        }
      ],
      "ReactFilters.messages.provenance.share": [
        {
          type: 0,
          value: "Partatjar"
        }
      ],
      "ReactFilters.messages.relative.current": [
        {
          type: 0,
          value: "Actual"
        }
      ],
      "ReactFilters.messages.relative.passed": [
        {
          type: 0,
          value: "Passat"
        }
      ],
      "ReactFilters.messages.relative.upcoming": [
        {
          type: 0,
          value: "A venir"
        }
      ],
      "ReactFilters.messages.state.controlled": [
        {
          type: 0,
          value: "Revisat"
        }
      ],
      "ReactFilters.messages.state.published": [
        {
          type: 0,
          value: "Publicat"
        }
      ],
      "ReactFilters.messages.state.refused": [
        {
          type: 0,
          value: "Refusat"
        }
      ],
      "ReactFilters.messages.state.toModerate": [
        {
          type: 0,
          value: "De moderar"
        }
      ],
      "ReactFilters.messages.status.cancelled": [
        {
          type: 0,
          value: "Anullat"
        }
      ],
      "ReactFilters.messages.status.full": [
        {
          type: 0,
          value: "Totalament compl\xE8t"
        }
      ],
      "ReactFilters.messages.status.movedOnline": [
        {
          type: 0,
          value: "Transferit en linha"
        }
      ],
      "ReactFilters.messages.status.postponed": [
        {
          type: 0,
          value: "Remandat"
        }
      ],
      "ReactFilters.messages.status.programmed": [
        {
          type: 0,
          value: "Previst"
        }
      ],
      "ReactFilters.messages.status.rescheduled": [
        {
          type: 0,
          value: "Tornat planificar"
        }
      ],
      "ReactFilters.useGetFilterOptions.emptyOption": [
        {
          type: 0,
          value: "(Sens valor)"
        }
      ]
    };
  }
});

// src/utils/fetchLocale.js
var fetchLocale_exports = {};
__export(fetchLocale_exports, {
  default: () => fetchLocale
});
module.exports = __toCommonJS(fetchLocale_exports);

// import("../locales-compiled/**/*.json") in src/utils/fetchLocale.js
var globImport_locales_compiled_json = __glob({
  "../locales-compiled/br.json": () => Promise.resolve().then(() => __toESM(require_br())),
  "../locales-compiled/ca.json": () => Promise.resolve().then(() => __toESM(require_ca())),
  "../locales-compiled/de.json": () => Promise.resolve().then(() => __toESM(require_de())),
  "../locales-compiled/en.json": () => Promise.resolve().then(() => __toESM(require_en())),
  "../locales-compiled/es.json": () => Promise.resolve().then(() => __toESM(require_es())),
  "../locales-compiled/eu.json": () => Promise.resolve().then(() => __toESM(require_eu())),
  "../locales-compiled/fr.json": () => Promise.resolve().then(() => __toESM(require_fr())),
  "../locales-compiled/io.json": () => Promise.resolve().then(() => __toESM(require_io())),
  "../locales-compiled/it.json": () => Promise.resolve().then(() => __toESM(require_it())),
  "../locales-compiled/oc.json": () => Promise.resolve().then(() => __toESM(require_oc()))
});

// src/utils/fetchLocale.js
function fetchLocale(locale) {
  return globImport_locales_compiled_json(`../locales-compiled/${locale}.json`).then(
    (mod) => mod.default
  );
}
//# sourceMappingURL=fetchLocale.cjs.map