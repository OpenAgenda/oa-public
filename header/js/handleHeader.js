var handleHeader = function(params) {

  params = extend({
    deployed: false,
    logged: false,
    resEvent: '//openagenda.com/ajax/event',
    resLocation: '//openagenda.com/getsearch/location',
    env: 'prod',
    selectors: {
      header: 'header',
      mobileAnchor: '.js_mobile_anchor',
      searchMenu: '.js_header_search',
      connect: '.js_connect_section'
    },
    elems: {
      userMenu: false, // where the content of the logged user menu goes
    },
    events: {
      mobile: 'mobilecheck'
    },
    classes: {
      displayNone: 'display-none',
      active: 'active',
      mobile: 'mobile'
    }
  }, params);

  params.templates = extend({
    userMenu: false, // this is the logged user menu
    mobileSearch: '<i class="icon-search head-icon"></i>',
    mobileConnect: '<i class="icon-signin head-icon"></i>'
  }, params.templates?params.templates:{});
  
  var session = {},

  init = function() {

    sEventHandler.getInstance().trigger('getsessiondata', function(data) {
      
      session = data;

      session.logged?_runLogged():_runUnlogged();

      _mobileSetup(session.logged);

      _toggleDisplayedElements();

    });

  },

  _runUnlogged = function() {

    $('.js_signin_link').attr( 'href', $('.js_signin_link').attr( 'href' ) + '?redirect=' + $.base64Encode( window.location.href ) );

  },

  _runLogged = function() {

    handleContextMenu(el('.js_profile'), el('.js_profile_menu'), new EventHandler(), { left: false });

    // and needs to have logged values set in fields
    if (session.thumbnail) {

      $('.js_user_thumb').attr('src', session.thumbnail.replace('cibultest', 'cibul') ).removeClass('display-none');
      
    }

    var fullName = session.fullName ? session.fullName : ( session.culture == 'fr' ? 'Mon Profil' : 'My Profile' );

    el( '.js_user_thumb' ).insertAdjacentHTML( 'afterend', '<label>' + fullName + '</label>' );

    if ( !session.thumbnail ) {

      $('.js_user_thumb').remove();

    }

    $('.js_logo_link').attr('href', $('.js_logo_link').attr('href') + 'home');

    // messages and notifications
    if (!session.basic) {
      if (parseInt(session.counts.newnotifications, 10)) $('.js_new_notification_count').removeClass('display-none').html(session.counts.newnotifications);
      if (parseInt(session.counts.newmessages,10)) $('.js_new_message_count').removeClass('display-none').html(session.counts.newmessages);
    }

    _initUserMenu();

  },

  _toggleDisplayedElements = function() {

    forEach(els('.js_not_logged'), function(elem) { (session.logged?addClass:removeClass)(elem, 'display-none'); });
    forEach(els('.js_logged'), function(elem) { (session.logged?removeClass:addClass)(elem, 'display-none'); });

    forEach(els('.js_full_logged'), function(elem) { (session.logged&&!session.basic?removeClass:addClass)(elem, 'display-none'); });

  },


  /**
   * switch to mobile behavior if is mobile
   */
  
  _mobileSetup = function(logged) {

    sEventHandler.getInstance().trigger(params.events.mobile, function(isMobile) {

      if (!isMobile) return;

      if (!logged) el(params.selectors.mobileAnchor).insertAdjacentElement('afterend', handleDisplayButton(params.templates.mobileConnect, el(params.selectors.connect), {event: 'headerbuttontapped' }));

      el(params.selectors.mobileAnchor).insertAdjacentElement('afterend', handleDisplayButton(params.templates.mobileSearch, el(params.selectors.searchMenu), {event: 'headerbuttontapped'}));

      addClass(el(params.selectors.header), params.classes.mobile);

    });

  },


  _initUserMenu = function() {

    var userMenu = new EJS({text: params.templates.userMenu });

    params.elems.userMenu.innerHTML = userMenu.render(session);

  };

  init();

};

var apply_firefox_fix = function() {

  if (typeof document.headerOptions !='undefined') if (document.headerOptions.env!='template') {
    $.getPersistentCookie(true);
    $.getFlash();
    $.getPersistentCookie(true);
    $.getFlash();  
  }
  
}