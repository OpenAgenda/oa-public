var handleHeader = function(params) {

  params = extend({
    deployed: false,
    logged: false,
    resEvent: '//cibul.net/ajax/event',
    resLocation: '//cibul.net/getsearch/location',
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

    var hSearch = handleHeaderSearch({resEvent: params.resEvent, resLocation: params.resLocation, env: params.env });

    _applyDeployBehavior(hSearch.initMapAndSearch);

    $('.in-field').infieldize({position: false});

    apply_flash_behavior(false, params);

  },

  _runUnlogged = function() {

    var redirect = window.location.href.replace(/#[A-z0-9&=]+$/, '');

    if (redirect.replace(/\/frontend_dev.php|http(|s):\/\/(d.|)|\/$/g, '')=='cibul.net') redirect = '//' + (params.env!=='prod'?'d.cibul.net/frontend_dev.php':'cibul.net') + '/home';

    forEach(els('.js_page_redirect'), function(linkElem) {
      linkElem.setAttribute('href', linkElem.getAttribute('href') + '?redirect=' + redirect);
    });

    $('.js_language').poppit({ target: '.js_language_list', at: 'right bottom', my: 'right top' });

    $('.js_signin_form').attr('action', $('.js_signin_form').attr('action') + '?redirect=' + $.base64Encode(redirect));

    // submit signin
    $('a', '.js_signin_form').click(function(e){
      e.preventDefault();
      $('.js_signin_form').submit();
    });

    $('input', '.js_signin_form').keyup(function(e){
      if (e.keyCode==13) $('.js_signin_form').submit();
    });

    handleContextMenu(getElementsByClassName(document, 'js_connect_link')[0], nextObject(getElementsByClassName(document, 'js_connect_link')[0]), new EventHandler());

  },

  _runLogged = function() {

    handleContextMenu(el('.js_profile'), el('.js_profile_menu'), new EventHandler(), { left: false });

    // and needs to have logged values set in fields
    if (session.thumbnail) $('.js_user_thumb').attr('src', session.thumbnail);
    $('.js_full_name').html(session.fullName);

    $('.js_logo_link').attr('href', $('.js_logo_link').attr('href') + 'home');

    // messages and notifications
    if (parseInt(session.counts.newnotifications, 10)) $('.js_new_notification_count').removeClass('display-none').html(session.counts.newnotifications);
    if (parseInt(session.counts.newmessages,10)) $('.js_new_message_count').removeClass('display-none').html(session.counts.newmessages);

    _initUserMenu();

  },

  _toggleDisplayedElements = function() {

    forEach(els('.js_not_logged'), function(elem) { (session.logged?addClass:removeClass)(elem, 'display-none'); });
    forEach(els('.js_logged'), function(elem) { (session.logged?removeClass:addClass)(elem, 'display-none'); });

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

  _applyDeployBehavior = function(onDeployCallback) {

    if (params.deployed) {

      $('.js_deployable').removeClass('h0');

      onDeployCallback();

    } else {

      $('.js_deploy').bind('focus.deploy',function(e){

        onDeployCallback();

        var self=this;

        $('.js_deployable').animate({'height': $('.js_map').height()}, function(){ window.scrollTo(0, $(self).offset().top - $(window).height() + 50); });
      
        $(this).unbind('focus.deploy');
      
      });

    }

  },

  _initUserMenu = function() {

    var userMenu = new EJS({text: params.templates.userMenu });

    params.elems.userMenu.innerHTML = userMenu.render(session);

  };

  init();

};

var apply_flash_behavior = function(message, options){

  if (message == undefined) message = false;

  if (message) var flash = message;
  else {

    var flash = (options.env=='template')?false:$.getFlash(); // get flash from cookie
    
  }

  if (flash) {

    if ($.getFlashType() == 'error') {
      $('.js_error_flash').html(flash);
      $('.js_info_flash').html('');
    } else {
      $('.js_error_flash').html('');
      $('.js_info_flash').html(flash);
    }

    $('.js_flash_bar').removeClass('display-none');

    $('.js_flash_close').unbind('click').click(function(e){ e.preventDefault(); $('.js_flash_bar').addClass('display-none')});
  }

  if (!message) setTimeout("apply_firefox_fix()", 2000);
}

var apply_firefox_fix = function() {

  if (typeof document.headerOptions !='undefined') if (document.headerOptions.env!='template') {
    $.getPersistentCookie(true);
    $.getFlash();
    $.getPersistentCookie(true);
    $.getFlash();  
  }
  
}