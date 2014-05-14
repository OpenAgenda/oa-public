var cn = require('../../js/lib/common/common.mod.js'),

ejs = require('ejs'),

debug = require('debug'),

log = debug('main'),

sessionData = false, pageReady = false,

params = {
  template: false, // see at the bottom
};

window.run = function(options) {

  if (options.debug) debug.enable('main');

  cn.extend({
    url: '/home/agenda'
  }, options);

  options.eh.trigger('getsessiondata', function(data) {
    log('session data fetched');
    sessionData = data;
  });

  cn.addEvent(window, 'load', function() {
    log('window loaded');
    pageReady = true;
  });

  

  // would be nice to load list now.
  // but list is available at same url as always.
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