'use strict';

// 'agenda/show',
// 'agenda/embedShow',
// 'event/show',
// 'event/action',
// 'event/embedShow',
// 'search/agendas',
// 'search/events',
// 'newsletter/show',
// 'newsletter/unsubscribe',
// 'newsletter/unsubscribeComplete',
// 'error/show',

module.exports = [
  'event/inbox',
  'agenda/inbox',
  'agenda/requestContribute',
  'admin/agendas',
  'admin/index',
  'admin/users',
  'auth/signin',
  'auth/emailForm',
  'auth/activation',
  'auth/lostPassword',
  'auth/resetPassword',
  'event/embedInbox',
  {
    uri: 'user/bsMenu',
    public: true,
  },

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
  // {
  //   js: 'widgets/map/admin/parent.js',
  //   prod: 'review/widgetMapConfig.js',
  // },
  // {
  //   js: 'widgets/map/admin/frame.js',
  //   prod: 'review/widgetMapConfigFrame.js',
  // },
  {
    js: 'widgets/custom/custom.js',
    prod: 'embed/cibulCustomWidget.js',
  },
];
