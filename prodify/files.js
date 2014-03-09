var paths = {
  hv:  '../home visitor/js',
  hs:  '../header/js/',
  p:   '../agenda/js/',
  ps:  '../program search/js/',
  pl:  '../program small list page/js/',
  e:   '../event page/js/',
  el:  '../event list page/js/',
  ee:  '../event page embedded/js/',
  ep:  '../event form/js/',
  pe:  '../agenda embedded/js/',
  pf:  '../program edit menu/js/',
  pm:  '../program menu/js/',
  pa:  '../agenda admin/js/',
  pem: '../agenda embed menu/',
  npem: '../agenda embedded/new/js/',
  gl:  '../global/js/',
  jsc: '../js/cibul/',
  lib: '../js/lib/',
  vd:  '../js/vendors/',
  lg:  '../js/legacy/',
  m:   '../message/js/'
},

destPath = '/home/kaore/Dev/www/cibul-symfony/web/js/',

files = {

  'global.min.js': [
    [paths.gl, 'handleMessageLinks.js', 'handleMobileMonitor.js', 'handleGlobals.js'],
    [paths.jsc, 'action/src/action.js'],
    [paths.lib, 'common/common.js', 'lightbox/lightbox.js', 'EventHandler/EventHandler.js']
  ],

  'message.min.js': [
    [paths.m, 'handleMessage.js'],
    [paths.lib, 'common/common.js'],
    [paths.vd, 'setLinks/src/setLinks.js']
  ],

  'event/eventPublish.min.js': [
    [paths.ep,
      'cibulEvent.js',
      'cibulEventValidator.js',
      'cibulEventDescription.js',
      'cibulEventLocation.js',
      'cibulEventImage.js',
      'cibulEventAgenda.js',
      'cibulEventSubmit.js',
      'cibulEventFormTunnel.js',
      'handlePricingSelection.js',
      'addNote.js'
    ],
    [paths.lib,
      'common/common.js', 'Base64/Base64.js', 'iTunnel/iTunnel.js',
      'urlStrings/urlStrings.js', 'verboseDate/verboseDate.js',
      'EventHandler/EventHandler.js', 'remote/remote.js',
      'inputWidgets/inputControllers.js', 'inputWidgets/inputWidgets.js',
      'inputWidgets/inputValidators.js', 'maps/maps.js', 'maps/google.maps.js',
      'lightbox/lightbox.js', 'inputCounter/inputCounter.js'
    ],
    [paths.vd,
      'spin/src/spin.min.js',
      'ejs/src/ejs_production.js',
      'CibulCalendar/src/CibulCalendar.js',
    ],
    [paths.jsc,
      'handleEventImage/src/handleEventImage.js',
      'handleDateSelection/src/handleDateSelection.js',
      'handleDateSelection/src/handleDatesAdd.js',
      'handleDateSelection/src/handleDatesList.js',
      'handlePlaceSelection/src/handlePlaceSelection.js',
      'handlePlaceSelection/src/handlePlaceSelectionList.js',
      'handlePlaceSelection/src/handlePlaceSelectionMap.js',
      'handlePlaceSelection/src/handlePlaceMapDrag.js',
      'handlePlaceFetch/src/makeLooseGet.js',
      'handlePlaceFetch/src/handlePlaceFetch.js',
      'handleEventPlaceEdit/src/handleEventPlaceEdit.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleSession/src/handleSession.js',
      'handleSuggestions/src/handleSuggestions.js',
      'inputCountry/src/inputCountry.js',
    ],
  ],

  'review/embedPublish.min.js': [
    [paths.ep,
      'cibulEvent.js',
      'cibulEventValidator.js',
      'cibulEventDescription.js',
      'cibulEventLocation.js',
      'cibulEventImage.js',
      'cibulEventAgenda.js',
      'cibulEventSubmit.js',
      'cibulEventFormTunnel.js',
      'handlePricingSelection.js',
      'addNote.js'
    ],
    [paths.lib,
      'common/common.js', 'Base64/Base64.js', 'iTunnel/iTunnel.js',
      'urlStrings/urlStrings.js', 'verboseDate/verboseDate.js', 'EventHandler/EventHandler.js',
      'remote/remote.js', 'inputWidgets/inputControllers.js', 'inputWidgets/inputWidgets.js',
      'inputWidgets/inputValidators.js', 'maps/leaflet.js', 'maps/maps.js',
      'maps/osm.maps.js', 'lightbox/lightbox.js', 'inputCounter/inputCounter.js',
    ],
    [paths.vd,
      'spin/src/spin.min.js',
      'ejs/src/ejs_production.js',
      'CibulCalendar/src/CibulCalendar.js',
      'Cookies-master/src/cookies.js',
    ],
    [paths.jsc,
      'handleEventImage/src/handleEventImage.js',
      'handleDateSelection/src/handleDateSelection.js',
      'handleDateSelection/src/handleDatesAdd.js',
      'handleDateSelection/src/handleDatesList.js',
      'handlePlaceSelection/src/handlePlaceSelection.js',
      'handlePlaceSelection/src/handlePlaceSelectionList.js',
      'handlePlaceSelection/src/handlePlaceSelectionMap.js',
      'handlePlaceSelection/src/handlePlaceMapDrag.js',
      'handlePlaceFetch/src/makeLooseGet.js',
      'handlePlaceFetch/src/handlePlaceFetch.js',
      'handleEventPlaceEdit/src/handleEventPlaceEdit.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleSession/src/handleSession.js',
      'handleSuggestions/src/handleSuggestions.js',
      'inputCountry/src/inputCountry.js',
    ],
  ],

  'review/embedComplete.min.js': [
    [paths.lib, 'common/common.js', 'Base64/Base64.js', 'iTunnel/iTunnel.js', 'urlStrings/urlStrings.js'],
    [paths.pe, 'handleCompleteTunnel.js']
  ],

  'review/embedLogin.min.js': [
    [paths.lib, 'common/common.js', 'Base64/Base64.js', 'iTunnel/iTunnel.js', 'urlStrings/urlStrings.js'],
    [paths.pe, 'handleLoginTunnel.js']
  ],

  'header/search.min.js': [
    [paths.hs, 'common.js', 'handleHeader.js', 'handleHeaderSearch.js', 'searchLib.js', 'geocoder.js', 'queryClient.js'],
    [paths.lib, 'common/common.js', 'EventHandler/EventHandler.js', 'remote/remote.js', 'Base64/Base64.js' ],
    [paths.vd,
      'CibulCalendar/src/CibulCalendar.js',
      'iscroll/src/iscroll.js',
      'ejs/src/ejs_production.js',
      'Cookies-master/src/cookies.js',
    ],
    [paths.jsc,
      'handleContextMenu/src/handleContextMenu.js',
      'handleSession/src/handleSession.js',
      'handleDisplayButton/src/handleDisplayButton.js'
    ]
  ],

  'home/visitor.min.js': [
    [paths.lib, 'common/common.js', 'EventHandler/EventHandler.js', 'flowinate/flowinate.js', 'remote/remote.js', 'urlStrings/urlStrings.js'],
    [paths.vd, 'ejs/src/ejs_production.js', 'spin/src/spin.min.js'],
    [paths.jsc,
      'handleList/src/handleList.js',
      'handleLock/src/handleLock.js',
      'handleNav/src/handleNav.js',
      'handleProgramSearch/src/handleProgramSearch.js'
    ]
  ],

  'event/event.min.js': [
    [paths.jsc,
      'handleEventPlaces/src/handleEventPlaces.js',
      'handleEventDates/src/handleEventDates.js',
      'handleLanguages/src/handleLanguages.js',
      'handleOEmbed/src/handleOEmbed.js',
      'handleEvent/src/handleEvent.js',
      'handleShares/src/handleShares.js',
      'mapHandler/src/mapHandler.js',
      'handleContextMenu/src/handleContextMenu.js',
      'action/src/action.js'
    ],
    [paths.lib,
      'Base64/Base64.js', 'common/common.js', 'remote/remote.js',
      'loadJs/loadJs.js', 'lightbox/lightbox.js',
      'urlStrings/urlStrings.js', 'EventHandler/EventHandler.js',
      'tabs/tabs.js', 'linkToImage/linkToImage.js',
      'maps/maps.js', 'maps/google.maps.js', 'lineNav/lineNav.js',
    ],
    [paths.vd,
      'setLinks/src/setLinks.js',
      'ejs/src/ejs_production.js',
      'ejs/src/ejs_production.js',
      'Cookies-master/src/cookies.js'
    ],
    [paths.e, 'handleEventAdmin.js']
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
    ],
    [paths.el,
      'handleEventList.js',
      'handleEventListFilters.js'
    ],
  ],

  'review/program.min.js': [
    [paths.lib,
      'Base64/Base64.js', 'hash/hash.js', 'common/common.js',
      'urlStrings/urlStrings.js', 'remote/remote.js',
      'loadJs/loadJs.js', 'maps/maps.js', 'maps/google.maps.js', 'lightbox/lightbox.js'
    ],
    [paths.vd,
      'setLinks/src/setLinks.js',
      'ejs/src/ejs_production.js',
      'CibulCalendar/src/CibulCalendar.js',
      'iscroll/src/iscroll.js',
      'spin/src/spin.min.js',
      'Cookies-master/src/cookies.js'
    ],
    [paths.jsc,
      'handleShares/src/handleShares.js',
      'handleList/src/handleList.js',
      'mapHandler/src/mapHandler.js',
      'mapHandler/src/mapSearchHandler.js',
      'handleCalendar/src/handleCalendar.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleNav/src/handleNav.js',
      'extractLocation/src/extractLocation.js',
      'handleSectionRemove/src/handleSectionRemove.js',
      'handleHeadFilter/src/handleHeadFilter.js',
      'handleLock/src/handleLock.js',
      'handleProgramControlData/src/handleProgramControlData.js',
      'action/src/action.js',
      'sendGetMessage/src/sendGetMessage.js',
      'handleSuggestions/src/handleSuggestions.js',
      'handleCategories/src/handleCategories.js',
      'handleDisplayButton/src/handleDisplayButton.js'
    ],
    [paths.p,
      'handleCibulFollow.js',
      'handleEdition.js',
      'handleMobile.js',
      'handleProgram.js',
      'handleEmptyProgram.js',
      'handleTags.js',
      'handleSourceMenu.js'
    ]
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
    [paths.lib, 'common/common.js'],
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
      'handleContextMenu/src/handleContextMenu.js',
      'handleSuggestions/src/handleSuggestions.js',
      'sendGetMessage/src/sendGetMessage.js'
    ],
    [paths.pm, 'specific.js', 'handleEditorsMenu.js', 'handleSourcesMenu.js']
  ],

  'review/embedMenu.min.js': [
    [paths.jsc, 'handleContextMenu/src/handleContextMenu.js', 'embedCodeField/src/embedCodeField.js'],
    [paths.lib, 'loadJs/loadJs.js', 'formWidgets/formWidgets.js', 'tabs/tabs.js', 'lightbox/lightbox.js'],
    [paths.pem, 'js/handleEmbedMenuList.js', 'js/handleEmbedMenuMap.js', 'js/handleEmbedMenuCategories.js', 'js/handleEmbedMenuTags.js', 'js/handleEmbedMenuCalendar.js', 'js/handleEmbedMenuFacebook.js', 'js/handleEmbedMenuAddButton.js', 'js/toggler.js']
  ],

  'review/embedMenuLib.min.js': [
    [paths.vd, 'ejs/src/ejs_production.js', 'CibulCalendar/src/CibulCalendar.js'],
    [paths.lib, 'common/common.js', 'remote/remote.js', 'maps/maps.js', 'maps/osm.maps.js', 'selectForm/selectForm.js'],
    [paths.npem, 'cibulSimpleController.js', 'cibulWidget.js', 'cibulStyle.js', 'cibulCategoriesWidget.js', 'cibulMapWidget.js', 'cibulTagsWidget.js', 'cibulCalendarWidget.js', 'cibulSearchWidget.js'],
    [paths.pem, 'tags/handleTagsSelect.js']
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
      'extractLocation/src/extractLocation.js',
      'handleContextMenu/src/handleContextMenu.js',
      'handleSuggestions/src/handleSuggestions.js',
    ],
    [paths.pe, 'handleEmbeddedMap.js', 'handleEmbeddedMapTunnel.js']
  ],

  'review/cibulEmbed.min.js': [
    [paths.jsc, 'cibulEmbed/src/cibulEmbed.js'],
  ],

  'embed/cibulWidgetLib.js': [
    [paths.vd, 'ejs/src/ejs_production.js', 'CibulCalendar/src/CibulCalendar.js', ],
    [paths.lib, 'common/common.js', 'remote/remote.js', 'Base64/Base64.js', 'maps/maps.js', 'maps/osm.maps.js', 'urlStrings/urlStrings.js', 'iTunnel/iTunnel.js'],
    [paths.npem, 'cibulControllers.js', 'cibulWidget.js', 'cibulStyle.js', 'cibulCategoriesWidget.js'],
  ],

  'embed/cibulListWidget.js': [
    [paths.npem, 'cibulListWidget.js']
  ],

  'embed/cibulMapWidget.js': [
    [paths.npem, 'cibulMapWidget.js']
  ],

  'embed/cibulCalendarWidget.js': [
    [paths.npem, 'cibulCalendarWidget.js']
  ],

  'embed/cibulSearchWidget.js': [
    [paths.npem, 'cibulSearchWidget.js']
  ],

  'embed/cibulCategoriesWidget.js': [
    [paths.npem, 'cibulCategoriesWidget.js']
  ],

  'embed/cibulTagsWidget.js': [
    [paths.npem, 'cibulTagsWidget.js']
  ],

  'embed/cibulFormWidget.js': [
    [paths.npem, 'cibulFormWidget.js']
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
  
  'event/calendarExportMenu.2.min.js': [[paths.lg, 'calendarExportMenu.2.min.js']],
  'event/show.4.min.js': [[paths.lg, 'show.4.min.js']],
  'event/showEditors.min.js': [[paths.lg, 'showEditors.js']],

  'review/addTagMenu.min.js': [[paths.lg, 'addTagMenu.min.js']],
  'review/embedWidget.min.js': [[paths.lg, 'embedWidget.min.js']]

  // menu, map, cibulEmbed.
};

exports.files = files;
exports.destPath = destPath;