var paths = {
  h:   '../home/js/',
  hv:  '../presentation/js/',
  hs:  '../header/js/',
  p:   '../agenda/js/',
  ps:  '../program search/js/',
  pl:  '../program small list page/js/',
  e:   '../event page/js/',
  el:  '../event list page/js/',
  ee:  '../event page embedded/js/',
  pe:  '../agenda embedded/js/',
  pef: '../agenda embedded form/js/',
  pf:  '../program edit menu/js/',
  pm:  '../program menu/js/',
  pa:  '../agenda admin/js/',
  npem: '../agenda embedded/js/',
  gl:  '../global/js/',
  jsc: '../js/cibul/',
  lib: '../js/lib/',
  vd:  '../js/vendors/',
  lg:  '../js/legacy/',
  m:   '../message/js/'
},

destPath = __dirname + '/../../../../cibul-symfony/web/js/',

destPublicTemplatePath = __dirname + '/../../../../cibul-symfony/web/templates/',

destCssPath = __dirname + '/../../../../cibul-symfony/web/css/compiled.css',

destEmbedCssPath = __dirname + '/../../../../cibul-symfony/web/css/embedDefault.css',

destAdminCssPath = __dirname + '/../../../../cibul-symfony/web/css/compiledAdmin.css',

destOACssPath = __dirname + '/../../../../cibul-symfony/web/css/oa.css',

destOAECssPath = __dirname + '/../../../../cibul-symfony/web/css/oae.css',

destOAETCssPath = __dirname + '/../../../../cibul-symfony/web/css/oaet.css',

files = {

  'message.min.js': [
    [paths.m, 'handleMessage.js'],
    [paths.lib, 'common/common.js'],
    [paths.vd, 'setLinks/src/setLinks.js']
  ],

  'event/list.min.js': [
    [paths.lib,
      'Base64/Base64.js', 'hash/hash.js', 'common/common.js',
      'urlStrings/urlStrings.js',
      'remote/remote.js', 'lightbox/lightbox.js', 'EventHandler/EventHandler.js',
      'inputWidgets/inputControllers.js', 'inputWidgets/inputWidgets.js'
    ],
    [paths.vd,
      'setLinks/src/setLinks.js',
      'spin/src/spin.min.js',
      'ejs/src/ejs_production.js',
    ],
    [paths.jsc,
      'handleList/src/handleList.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleNav/src/handleNav.js',
      'handleLock/src/handleLock.js',
      'handleAddToAgenda/src/handleAddToAgenda.bundle.js',
      'handleAddToAgenda/src/handleEventPublish.bundle.js'
    ],
    [paths.el,
      'handleEventList.js',
      'handleEventListFilters.js'
    ],
  ],

  'list.min.js': [
    [paths.lib,
      'Base64/Base64.js', 'hash/hash.js', 'common/common.js',
      'urlStrings/urlStrings.js',
      'remote/remote.js', 'lightbox/lightbox.js', 'EventHandler/EventHandler.js',
    ],
    [paths.vd,
      'setLinks/src/setLinks.js',
      'spin/src/spin.min.js',
      'ejs/src/ejs_production.js',
    ],
    [paths.jsc,
      'handleList/src/handleList.js',
      'handleSectionRemove/src/handleSectionRemove.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleNav/src/handleNav.js',
      'handleLock/src/handleLock.js',
    ],
    [paths.pl,
      'handleListPage.js',
    ],
  ],

  'review/adminList.min.js': [
    [paths.lib, 'common/common.js', 'remote/remote.js', 'lightbox/lightbox.js', 'urlStrings/urlStrings.js'],
    [paths.vd, 'spin/src/spin.min.js'],
    [paths.pa, 'handleAdminEventList.js']
  ],

  'review/adminDataviz.min.js': [
    [paths.pa, 'dataViz.bundle.js']
  ],

  'review/search.min.js': [
    [paths.lib,
      'common/common.js', 'EventHandler/EventHandler.js',
      'remote/remote.js', 'flowinate/flowinate.js'
    ],
    [paths.jsc,
      'handleList/src/handleList.js',
      'handleNav/src/handleNav.js',
      'handleLock/src/handleLock.js',
      'handleProgramSearch/src/handleProgramSearch.js'
    ],
    [paths.vd,
      'spin/src/spin.min.js',
      'ejs/src/ejs_production.js'
    ]
  ],

  'event/embedEvent.min.js': [
    [paths.jsc,
      'handleEventPlaces/src/handleEventPlaces.js',
      'handleEventDates/src/handleEventDates.js',
      'handleLanguages/src/handleLanguages.js',
      'handleOEmbed/src/handleOEmbed.js',
      'handleEvent/src/handleEvent.js',
      'mapHandler/src/mapHandler.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleShares/src/handleShares.js'
    ],
    [paths.lib,
      'common/common.js', 'EventHandler/EventHandler.js', 'Base64/Base64.js', 'iTunnel/iTunnel.js', 'hash/hash.js' ,
      'urlStrings/urlStrings.js', 'tabs/tabs.js', 'lineNav/lineNav.js',
      'maps/maps.js', 'maps/osm.maps.js', 'maps/leaflet.js',
      'remote/remote.js', 'loadJs/loadJs.js',
      'linkToImage/linkToImage.js'
    ],
    [paths.vd,
      'setLinks/src/setLinks.js',
      'spin/src/spin.min.js',
      'ejs/src/ejs_production.js'
    ],
    [paths.ee, 'handleEventTunnel.js', 'makeEventHeightGetter.js']
  ],

  'review/theme.min.js': [
    [paths.lib, 'common/common.js', 'lightbox/lightbox.js'],
    [paths.vd, 'colorpicker/src/colorpicker.js'],
    [paths.jsc, 'handleContextMenu/src/handleContextMenu.js'],
    [paths.pf, 'theme.js']
  ],

  'review/form.min.js': [
    [paths.lib, 'common/common.js', 'lightbox/lightbox.js'],
    [paths.pf, 'form.js']
  ],

  'review/embedList.min.js': [
    [paths.jsc,
      'handleList/src/handleList.js',
      'extractLocation/src/extractLocation.js',
      'mapHandler/src/mapHandler.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleNav/src/handleNav.js',
      'handleSectionRemove/src/handleSectionRemove.js',
      'handleHeadFilter/src/handleHeadFilter.js',
      'handleLock/src/handleLock.js',
      'handleProgramControlData/src/handleProgramControlData.js',
      'handleEventPlaces/src/handleEventPlaces.js',
      'handleEventDates/src/handleEventDates.js',
      'handleLanguages/src/handleLanguages.js',
      'handleOEmbed/src/handleOEmbed.js',
      'handleEvent/src/handleEvent.js',
      'handleShares/src/handleShares.js'
    ],
    [paths.lib,
      'Base64/Base64.js', 'iTunnel/iTunnel.js', 'hash/hash.js', 'common/common.js',
      'EventHandler/EventHandler.js', 'urlStrings/urlStrings.js', 'remote/remote.js',
      'tabs/tabs.js', 'lineNav/lineNav.js', 'maps/maps.js', 'maps/osm.maps.js',
      'maps/leaflet.js', 'loadJs/loadJs.js',
      'linkToImage/linkToImage.js', 'flowinate/flowinate.js'
    ],
    [paths.vd,
      'setLinks/src/setLinks.js',
      'spin/src/spin.min.js',
      'ejs/src/ejs_production.js',
    ],
    [paths.pe,
      'handleEventDisplay.js',
      'handleEmbeddedList.js',
      'handleEmbeddedTunnel.js'
    ],
    [paths.ee, 'handleEventTunnel.js', 'makeEventHeightGetter.js']
  ],

  'review/embedListFb.min.js': [
    [paths.jsc, 'handleCategories/src/handleCategories.js'],
    [paths.vd, 'iscroll/src/iscroll.js', 'ejs/src/ejs_production.js' ],
    [paths.lib, 'makeUnselectable/makeUnselectable.js'],
    [paths.pe, 'handleEmbeddedMap.js', 'handleEmbeddedScroll.js']
  ],

  'review/menu.min.js': [
    [paths.lib,
      'common/common.js', 'tabs/tabs.js', 'EventHandler/EventHandler.js',
      'remote/remote.js', 'lightbox/lightbox.js'
    ],
    [paths.vd, 'ejs/src/ejs_production.js', 'spin/src/spin.min.js' ],
    [paths.jsc,
      'embedCodeField/src/embedCodeField.js',
      'sendGetMessage/src/sendGetMessage.js'
    ],
    [paths.pm, 'specific.js', 'handleEditorsMenu.js', 'handleSourcesMenu.js']
  ],


  'review/embedMap.min.js': [
    [paths.vd, 'ejs/src/ejs_production.js' ],
    [paths.lib,
      'common/common.js', 'Base64/Base64.js', 'iTunnel/iTunnel.js',
      'hash/hash.js', 'urlStrings/urlStrings.js', 'remote/remote.js',
      'EventHandler/EventHandler.js', 'maps/maps.js',
      'maps/osm.maps.js', 'maps/leaflet.js'
    ],
    [paths.jsc,
      'handleProgramControlData/src/handleProgramControlData.js',
      'mapHandler/src/mapHandler.js',
      'mapHandler/src/mapSearchHandler.js',
      'extractLocation/src/extractLocation.js'
    ],
    [paths.pe, 'handleEmbeddedMap.js', 'handleEmbeddedMapTunnel.js']
  ],

  'review/cibulEmbed.min.js': [
    [paths.jsc, 'cibulEmbed/src/cibulEmbed.js'],
  ],

  'cmap.js': [[paths.lg, 'cmap.js']],
  'colorpicker.min.js': [[paths.lg, 'colorpicker.min.js']],
  'datepicker.js': [[paths.lg, 'datepicker.js']],
  'iscroll.js': [[paths.lg, 'iscroll.js']],
  'hashchange.min.js': [[paths.lg, 'hashchange.min.js']],
  'jquery-1.4.4.min.js': [[paths.lg, 'jquery-1.4.4.min.js']],
  'jquery.base64.js': [[paths.lg, 'jquery.base64.js']],
  'jquery.colorbox-min.js': [[paths.lg, 'jquery.colorbox-min.js']],
  'jquery.cookie.js': [[paths.lg, 'jquery.cookie.js']],
  'jquery.json-2.2.min.js': [[paths.lg, 'jquery.json-2.2.min.js']],
  'jquery.oembed.min.js': [[paths.lg, 'jquery.oembed.min.js']],
  'jquery.tools.min.js': [[paths.lg, 'jquery.tools.min.js']],
  'jquery-ui-1.8.11.custom.min.js': [[paths.lg, 'jquery-ui-1.8.11.custom.min.js']],
  'jScrollPane.js': [[paths.lg, 'jScrollPane.js']],
  /*'list.min.js': [[paths.lg, 'list.min.js']],*/
  'main28.js': [[paths.lg, 'main28.js']],
  
  'event/calendarExportMenu.js': [[paths.lg, 'calendarExportMenu.js']],
  'event/show.4.min.js': [[paths.lg, 'show.4.min.js']],
  'event/showEditors.min.js': [[paths.lg, 'showEditors.js']],

  'review/addTagMenu.min.js': [[paths.lg, 'addTagMenu.min.js']],
  'review/embedWidget.min.js': [[paths.lg, 'embedWidget.min.js']]

};

exports.files = files;
exports.destPath = destPath;
exports.destCssPath = destCssPath;
exports.destEmbedCssPath = destEmbedCssPath;
exports.destAdminCssPath = destAdminCssPath;
exports.destOACssPath = destOACssPath;
exports.destOAECssPath = destOAECssPath;
exports.destOAETCssPath = destOAETCssPath;
exports.destPublicTemplatePath = destPublicTemplatePath;