var creds = [], hasAvailable = false,

cn = require('../../js/lib/common/common.mod.js'),

lightbox = require('../../js/lib/lightbox/lightbox.mod.js'),

ejs = require('ejs'),

debug = require('debug'),

action = require('./action'),

log = debug('userCreds'),

credTypes = {0: 'editor', 1: 'community', null: 'custom'},

userCreds = [],

credElems = [],

params = {
  creds: [], // array of credentials of user
  selectors: {
    upgrade: '.upgrade',
    downgrade: '.downgrade'
  },
  templates: {
    empty: '<div class="cred"><span><%= basic %></span></div>',
    custom: '<div class="cred"><span><%= custom %></span></div>',
    upgrade: '<div class="cred"><span><%= basic %></span><a class="url upgrade"><%= upgrade %></a></div>',
    editor: '<div class="cred"><span><%= editor %></span><a class="url downgrade"><%= downgrade %></a></div>',
    community: '<div class="cred"><span><%= community %></span><a class="url downgrade"><%= downgrade %></a></div>'
  },
  labels: {
    basic: 'basic',
    custom: 'custom',
    upgrade: 'upgrade',
    downgrade: 'downgrade',
    editor: 'editor',
    community: 'community'
  },
  res: {
    upgrade: '#up',
    downgrade: '#down'
  },
  lightboxClasses: {frame: 'wsq lightbox-frame', canvas: 'lightbox-canvas', buttonBox: 'lightbox-buttons'},
  debug: false
};

exports.load = function(options) {

  cn.extend(params, options);

  initUserCreds(params.creds);

  evaluateAvailability();

  action.init({debug: params.debug, lightboxClasses: params.lightboxClasses});

};


/**
 * append cred actions to agenda item
 */

var setCredElem = function(elem, item) {

  log('setCredElem');

  // clear the previous cred elem if exists
  clearCredElem(item);

  // a user cred is assigned to agenda
  var aCred = getAgendaUserCred(item.uid);

  var credElem = false;

  if (typeof item.cred === 'undefined') {

    if (hasAvailable)
      credElem = addUpgradeAction(elem, item);
    else
      credElem = createCredElem(elem);

  } else if (item.cred === null) {

    credElem = addCustomInfos(elem);

  } else if (parseInt(item.cred, 10) === 0) {

    credElem = addEditorInfos(elem, !!aCred, item);

  } else if (parseInt(item.cred, 10) === 1) {

    credElem = addCommunityInfos(elem, !!aCred, item);

  }

  indexCredElem(elem, credElem, item.uid, item.cred);

};

exports.decorateAgendaItem = setCredElem;

var addUpgradeAction = function(elem, item) {

  var credElem = createCredElem(elem, 'upgrade');

  credUpgradeAction(elem, credElem, item);

  return credElem;

},

addEditorInfos = function(elem, displayAction, item) {

  var credElem = createCredElem(elem, 'editor');

  credDowngradeAction(elem, credElem, item);

  return credElem;

},

addCommunityInfos = function(elem, displayAction, item) {

  var credElem = createCredElem(elem, 'community');

  credDowngradeAction(elem, credElem, item);

  return credElem;

},

addCustomInfos = function(elem) {

  var credElem = createCredElem(elem, 'custom');

  return credElem;

},

createCredElem = function(canvasElem, name) {

  var credElem = document.createElement('div');

  if (typeof name == 'undefined') name = 'empty';

  credElem.innerHTML = ejs.render(params.templates[name], params.labels);

  credElem = cn.childObject(credElem, 0);

  cn.el(canvasElem, params.selectors.credActions).insertAdjacentElement('afterbegin', credElem);

  return credElem;

},

indexCredElem = function(elem, credElem, uid, cred) {

  var value = {canvas: elem, elem: credElem, uid: uid, cred: cred};

  for (var i = 0; i < credElems.length; i++)
    if (credElems[i].uid == uid) {
      credElems[i] = value;
      return;
    }

  credElems.push(value);

},

clearCredElem = function(item) {

  var f = false;

  for (var i = 0; i < credElems.length; i++)
    if (credElems[i].uid == item.uid) f = i;

  if (f===false) return;

  credElems[f].elem.parentNode.removeChild(credElems[f].elem);

},

credSelectFormBehavior = function(elem, credElem, formElem) {

  cn.addEvent(cn.el(formElem, 'button'), 'click', function(e) {

    cn.preventDefault(e);

    var type = false;

    // get the checked radio
    cn.forEach(cn.els(formElem, 'input'), function(radioElem) {
      if (radioElem.checked) type = radioElem.value;
    });

    // send choice via ajax
    action.get(cn.el(formElem, 'form').getAttribute('action'), {data: {type: type}, onResponse: function(responseType, data) {

      displayLightbox(data.message);

      if (!data.success) return;

      var cred = assignCred(data.type, data.uid);

      setCredElem(elem, cred, credElem);

    }});

  });

},

credDowngradeAction = function(elem, credElem, item) {

  credAction(credElem, true, function() {

    action.get(params.res.downgrade.replace('uid', item.uid), {
      onResponse: function(responseType, data) {

        displayLightbox(data.message);

        if (!data.success) return;

        unassignCred(item.uid);

      }, loadLightbox: true });

  });

},

credUpgradeAction = function(elem, credElem, item) {

  credAction(credElem, true, function() {

    action.get(params.res.upgrade.replace('uid', item.uid), {
      onResponse: function(responseType, data) {

        if (data.partial) return;

        displayLightbox(data.message);

        if (!data.success) return;

        var cred = assignCred(data.type, item.uid);

        setCredElem(elem, cred, credElem);

      },
      onElemReady: function(formElem) {

        credSelectFormBehavior(elem, credElem, formElem);
        
      },
      loadLightbox: true
    });

  });

},

credAction = function(elem, displayAction, callback) {

  if (typeof displayAction == 'undefined') displayAction = true;

  if (displayAction) {

    cn.addEvent(cn.el(elem, 'a'), 'click', function(e) {

      cn.preventDefault(e);

      callback();

    });

  } else {

    elem.removeChild(cn.el(elem, 'a'));

  }

},

displayLightbox = function(message) {

  lightbox({
    message: message,
    classes: params.lightboxClasses
  });

},


initUserCreds = function(initCreds) {

  userCreds = initCreds;

},


/**
 * assign cred of type to agenda of uid
 */

assignCred = function(type, uid) {

  for (var i = 0; i < userCreds.length; i++)
    if ((userCreds[i].type == type) && userCreds[i].aUid===null) {
      userCreds[i].aUid = uid;
      break;
    }

  evaluateAvailability();

  if (!hasAvailable) removeUpgradeActions();

  return {cred: parseInt(type, 10), uid: uid};

},


/**
 * unassign cred
 */

unassignCred = function(uid) {

  for (var i = 0; i < userCreds.length; i++)
    if ((userCreds[i].aUid===uid)) userCreds[i].aUid = null;

  for (i = 0; i < credElems.length; i++)
    if (credElems[i].uid==uid) delete credElems[i].cred;

  evaluateAvailability();

  refreshCredElems();

},


/**
 * check if agenda is assigned to a cred of user
 */

getAgendaUserCred = function(uid) {

  for (var i = 0; i < userCreds.length; i++)
    if (userCreds[i].aUid===uid) return userCreds[i].type;
    
  return false;

},


/**
 * returns true if user has unassigned creds
 */

evaluateAvailability = function() {

  hasAvailable =  false;

  for (var i = 0; i < userCreds.length; i++) {

    if (userCreds[i].aUid===null) {

      hasAvailable = true;
      return;

    }

  }

},


/**
 * loop through cred elements and remove cred actions
 */

removeUpgradeActions = function() {

  credElems.forEach(function(credElem) {

    var upgradeLink = cn.el(credElem.elem, params.selectors.upgrade);

    if (upgradeLink) upgradeLink.parentNode.removeChild(upgradeLink);

  });

},


refreshCredElems = function() {

  cn.forEach(credElems, function(credElem) {

    setCredElem(credElem.canvas, credElem);
  });

};

