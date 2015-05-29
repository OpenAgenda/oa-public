var cn = require('../../js/lib/common/common.mod.js'),

handleListPage = require('../../program small list page/js/handleListPage.mod.js'),

userCreds = require('./userCreds.js'),

ejs = require('ejs'),

debug = require('debug'),

log = debug('main'),

sessionData = false, pageReady = false,

params = {
  url: '/home',
  template: false, // see at the bottom
  selectors: {
    prev: '.js_nav_previous',
    next: '.js_nav_next',
    list: '.js_list_content',
    credActions: '.sub',
  },
  labels: {},
  res: {
    upgrade: '#',
    downgrade: '#'
  }
};


window.run = function(options) {

  if (options.debug) debug.enable('*');

  cn.extend(params, options);

  window.getSession( function(data) {

    log('session data fetched');

    sessionData = data;
    handlePage();

  });

  cn.addEvent(window, 'load', function() {

    log('window loaded');

    pageReady = true;
    handlePage();

  });

};


/**
 * general page behavior
 */

var handlePage = function() {

  if (!pageReady || !sessionData) return;

  /*userCreds.load({
    creds: sessionData.creds,
    selectors: {
      credActions: params.selectors.credActions,
      upgrade: '.upgrade',
      downgrade: '.downgrade'
    },
    res: params.res,
    labels: params.labels,
    debug: params.debug
  });*/

  log('all is set to load up page content');

  handleListPage({
    eh: params.eh,
    url: params.url,
    debug: params.debug,
    elems: {
      listCanvas: cn.el(params.selectors.list),
      navNext: cn.el(params.selectors.next),
      navPrevious: cn.el(params.selectors.prev)
    },
    itemFilter: function(item) {

      item.main = item.uid==sessionData.uid;

      item.owned = (typeof item.oUid!=='undefined')&&(item.oUid==sessionData.uid);

      item.admin = sessionData.reviews?(cn.contains(sessionData.reviews.admUids, item.uid) || item.owned):false;

      item.moderator = sessionData.reviews? cn.contains(sessionData.reviews.modUids, item.uid ) : false;

      item.invited = !!item.hasInvitations;

    },
    onItemLoad: {
      program: false//userCreds.decorateAgendaItem
    },
    templates: {
      program: params.template
    }
  });

};

// this takes up space, it is better at the bottom
params.template = [
  '<li class="mli">',
    '<div class="rwa-item">',
      '<div class="desc">',
        '<a class="url" href="<%= \'/frontend_dev.php/slug/fr\'.replace(\'slug\', slug) %>">',
          '<%= title %>',
        '</a>',
        '<div class="sub">',
          '<span class="indication">',
            '<% if (main) { %>votre agenda principal<% } else if (owned) { %>vous êtes propriétaire<% } else if (admin) { %>vous êtes administrateur<% } else { %>vous êtes éditeur<% } %>',
          '</span>',
        '</div>',
      '</div>',
      '<div class="act">',
        '<% if (admin) { %>',
        '<a class="button" href="<%= \'/frontend_dev.php/slug/admin\'.replace(\'slug\', slug) %>">',
          '<i class="icon-cog"></i><span>gérer</span>',
        '</a>',
        '<% } %>',
        '<a href="<%= \'/frontend_dev.php/slug/addevent\'.replace(\'slug\', slug) %>" class="button">publier un événement</a>',
      '</div>',
    '</div>',
  '</li>'
].join('');