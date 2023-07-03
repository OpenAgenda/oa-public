'use strict';

module.exports = [
  'event/inbox',
  'agenda/inbox',
  'agenda/requestContribute',
  'admin/agendas',
  'admin/index',
  'admin/users',
  'agenda/show',
  'agenda/embedShow',
  'agendaSearch/index',
  'auth/signin',
  'auth/signup',
  'auth/emailForm',
  'auth/activation',
  'auth/lostPassword',
  'auth/resetPassword',
  'event/show',
  'event/action',
  'event/embedShow',
  'event/action',
  'dialog/index',
  'search/agendas',
  'search/events',
  {
    uri: 'user/menu',
    public: true,
  },
  {
    uri: 'user/bsMenu',
    public: true,
  },

  'newsletter/show',
  'newsletter/unsubscribe',
  'newsletter/unsubscribeComplete',

  'adminRedirect/index',

  'agendaAdminEvents/index',

  'error/show',

  'eventLists/searchList',

  {
    js: 'layout/js/outdated.js',
    prod: 'outdated.js',
  },

  {
    js: 'layout/js/landing.js',
    prod: 'landing.js',
  },

  {
    js: 'widgets/spinner/spinner.js',
    prod: 'embed/oaSpinnerWidget.js',
  },

  {
    js: 'widgets/preview/preview.js',
    prod: 'embed/oaPreviewWidget.js',
  },

  {
    js: 'widgets/relative/relative.js',
    prod: 'embed/oaRelativeWidget.js',
  },

  {
    js: 'widgets/tags/tags.js',
    prod: 'embed/cibulTagsWidget.js',
  },
  {
    js: 'widgets/calendar/calendar.js',
    prod: 'embed/cibulCalendarWidget.js',
  },
  {
    js: 'widgets/search/search.js',
    prod: 'embed/cibulSearchWidget.js',
  },
  {
    js: 'widgets/age/age.js',
    prod: 'embed/oaAgeWidget.js',
  },
  {
    js: 'widgets/categories/categories.js',
    prod: 'embed/cibulCategoriesWidget.js',
  },
  {
    js: 'widgets/map/map.js',
    prod: 'embed/cibulMapWidget.js',
  },
  {
    js: 'widgets/activeFilters/activeFilters.js',
    prod: 'embed/oaActiveFilters.js',
  },
  {
    js: 'widgets/body/body.js',
    prod: 'embed/cibulBodyWidget.js',
  },
  {
    js: 'widgets/controller/main.js',
    prod: 'embed/cibulControllers.js',
  },
  {
    js: 'widgets/organizations/organizations.js',
    prod: 'embed/cibulOrganizationsWidget.js',
  },
  {
    js: 'widgets/map/admin/parent.js',
    prod: 'review/widgetMapConfig.js',
  },
  {
    js: 'widgets/map/admin/frame.js',
    prod: 'review/widgetMapConfigFrame.js',
  },
  {
    js: 'widgets/custom/custom.js',
    prod: 'embed/cibulCustomWidget.js',
  },
];
