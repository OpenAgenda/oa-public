var cn = require('../../js/lib/common/common.mod.js'),

handleListPage = require('../../program small list page/js/handleListPage.mod.js'),

ejs = require('ejs'),

debug = require('debug'),

log = debug('main'),

sessionData = false, pageReady = false,

params = {
  url: '/home/agenda',
  template: false, // see at the bottom
  selectors: {
    prev: '.js_nav_previous',
    next: '.js_nav_next',
    list: '.js_list_content'
  }
};

window.run = function(options) {

  if (options.debug) debug.enable('*');

  cn.extend(params, options);

  params.eh.trigger('getsessiondata', function(data) {
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

var handlePage = function() {

  if (!pageReady || !sessionData) return;

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

      item.owned = item.oUid==sessionData.uid;

      item.admin = cn.contains(sessionData.reviews.admUids, item.uid) || item.owned;

      /*item.creds = {
        editor: availableEditorCred,
        community: availableCommunityCred
      };*/

      item.creds = false;

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
            '<% if (main) { %>agenda principal<% } else if (owned) { %>propriétaire<% } else if (admin) { %>administrateur<% } else { %>éditeur<% } %>',
          '</span>',
        '</div>',
      '</div>',
      '<div class="act">',
        '<% if (creds && (creds.editor || creds.community)) { %>',
        '<a class="button small"><i class="icon-certificate"></i></a>',
        '<% } %>',
        '<% if (admin) { %>',
        '<a class="button small" href="<%= \'/frontend_dev.php/slug/admin\'.replace(\'slug\', slug) %>">',
          '<i class="icon-cog"></i><span>gérer</span>',
        '</a>',
        '<% } %>',
        '<a href="<%= \'/frontend_dev.php/slug/addevent\'.replace(\'slug\', slug) %>" class="button small">publiez un événement</a>',
      '</div>',
    '</div>',
  '</li>'
].join('');