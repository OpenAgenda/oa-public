/**
 * handles interaction with user to add a new graph configuration
 */
var cn = require('../../js/lib/common/common.mod.js'),

_ = require('lodash'),

labels = {
  add: 'Add',
  cancel: 'cancel',
  create: 'create',
  sectionSelect: 'select a breakdown',
  subsectionSelect: 'add another breakdown',
  sections: { date: 'Date', month: 'Month', year: 'Year', tag: 'Tag', category: 'Category', country: 'Country', place: 'Place Name', city: 'City', region: 'Region', department: 'Department', postalCode: 'Postal Code'},
  includeAll: 'all events',
  includeUpcoming: 'upcoming events',
  count: 'select a count'
},

params = {
  canvas: false,  // required. canvas where to put config maker
  templates: {
    add: '<button><%= add %></button>',
    menu: '<div class="cform addMenu"><ul class="line"><li><select></select></li><li><select></select></li><li><button><%= create %></button></li></ul><ul><li><a class="url" href="#"><%= subsectionSelect %></a></li></ul></div>',
    subsectionMenu: '<div><select></select> <a href="#" class="url"><%= cancel %></a></div>'
  },
  sections: ['country', 'department', 'region', 'city', 'postalCode', 'place', 'year', 'month', 'day', 'category', 'tag'],
  mux: [
    ['country', 'department', 'region', 'city', 'postalCode', 'place'],
    ['year', 'month', 'day']
  ]
};

module.exports = function(ctl, options) {

  params = cn.extend(params, {
    hasCategories: ctl.ct.length,
    hasTags: ctl.t.length
  }, options);

  cn.extend(labels, typeof params.labels !== 'undefined'?params.labels:{});

  return create;

};

var create = function(callback) {

  var sandbox = document.createElement('div');

  sandbox.innerHTML = _.template(params.templates.add)(labels);

  var addButton = cn.childObject(sandbox, 0);

  cn.addEvent(addButton, 'click', function(e) {
    cn.preventDefault(e);

    createMenu(addButton, callback);
    removeButton(addButton);

  });

  params.canvas.appendChild(addButton);

},

createMenu = function(button, callback) {

  // initialize dom object

  var sandbox = document.createElement('div');

  sandbox.innerHTML = _.template(params.templates.menu)(labels);

  var menu = cn.childObject(sandbox, 0),

  section = false, subsection = false, filter = false,

  filterSelect = cn.el(menu, 'select'),

  sectionSelect = cn.els(menu, 'select')[1],

  subsectionLink = cn.el(menu, 'a');

  createLink = cn.els(menu, 'button')[0];

  subsectionMenu = false; // subsection menu does not exist


  // add behavior and content to section selectbox

  addSectionOptions(sectionSelect, labels.sectionSelect);

  cn.addEvent(sectionSelect, 'change', function() {

    section = sectionSelect.value;

    if (subsectionMenu) {

      removeSubsection(subsectionMenu);

      subsection = subsectionMenu = false;

      subsectionLink.removeAttribute('style');

    }

  });


  // add behavior and content to filter select box

  createFilterSelect(filterSelect, function(value) {

    filter = value;

  });


  // add behavior to subsection link

  cn.addEvent(subsectionLink, 'click', function(e) {

    cn.preventDefault(e);

    subsectionLink.style.display = 'none';

    subsectionMenu = createSubsection(section, function() { // subsection select callback

      subsection = cn.el(subsectionMenu, 'select').value;

    }, function() { // cancel callback

      subsection = subsectionMenu = false;

      subsectionLink.removeAttribute('style');

    });

    subsectionLink.insertAdjacentElement('afterend', subsectionMenu);

  });

  // add behavior to create link

  cn.addEvent(createLink, 'click', function(e) {

    cn.preventDefault(e);

    if (!section && !subsection) return;

    if (!section) section = subsection;

    callback(section, subsection, filter);

    menu.parentNode.removeChild(menu);

    create(callback);

  });

  button.insertAdjacentElement('afterend', menu);

  return menu;

},

createSubsection = function(currentSection, selectCallback, cancelCallback) {

  var sandbox = document.createElement('div');

  sandbox.innerHTML = _.template(params.templates.subsectionMenu)(labels);

  var subsection = cn.childObject(sandbox, 0);

  resetSubsection(subsection, currentSection);

  cn.addEvent(subsection, 'change', selectCallback);

  // the first a of the subsection is the cancel link
  cn.addEvent(cn.el(subsection, 'a'), 'click', function(e) {

    cn.preventDefault(e);

    removeSubsection(subsection);
    cancelCallback();

  });

  return subsection;

},

createFilterSelect = function(elem, callback) {

  addOption(elem, '', labels.countSelect);
  addOption(elem, '', labels.includeAll);
  addOption(elem, 'upcoming', labels.includeUpcoming);

  cn.addEvent(elem, 'change', function() {
    callback(elem.value);
  });

},

removeSubsection = function(subsection) {

  subsection.parentNode.removeChild(subsection);

},

resetSubsection = function(subsection, currentSection) {

  while (cn.el(subsection, 'select').options.length > 0)
    cn.el(subsection, 'select').remove(0);

  // look at mutually exclusive sections to establish exception lists
  var exclusions = [];

  for (var i = 0; i < params.mux.length; i++)
    if (cn.contains(params.mux[i], currentSection)) exclusions = exclusions.concat(params.mux[i]);

  // add all except the one already used
  addSectionOptions(cn.el(subsection, 'select'), labels.subsectionSelect, exclusions);

},

removeButton = function(button) {

  button.parentNode.removeChild(button);

},

addSectionOptions = function(select, defaultLabel, exclusions) {

  addOption(select, '', defaultLabel);

  cn.forEach(params.sections, function(section) {

    if ((typeof exclusions !== 'undefined') && cn.contains(exclusions, section)) return;

    addOption(select, section, labels.sections[section]);

  });

},

addOption = function(select, value, label) {

  if (typeof label == 'undefined') label = value;

  var option = document.createElement('option');

  option.value = value;
  option.innerHTML = label;
  select.appendChild(option);

};
