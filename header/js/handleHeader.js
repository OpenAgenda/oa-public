var handleHeader = function(params) {

  params = extend({
    deployed: false,
    logged: false,
    resEvent: '//cibul.net/ajax/event',
    resLocation: '//cibul.net/getsearch/location',
    env: 'prod',
    elems: {
      userMenu: false, // where the content of the logged user menu goes
    },
    templates: {
      userMenu: false, // this is the logged user menu
    }
  }, params);
  
  var session = {},

  init = function() {

    sEventHandler.getInstance().trigger('getsessiondata', function(data) {
      
      session = data;

      session.logged?_runLogged():_runUnlogged();

      _toggleDisplayedElements();

    });

    var hSearch = handleHeaderSearch({resEvent: params.resEvent, resLocation: params.resLocation, env: params.env });

    _applyDeployBehavior(hSearch.initMapAndSearch);

    $('.in-field').infieldize({position: false});

    apply_flash_behavior(false, params);

  },

  _runUnlogged = function() {

    var redirect = window.location.href.replace(/#[A-z0-9&=]+$/, '');

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

    handleContextMenu(getElementsByClassName(document, 'js_profile')[0], getElementsByClassName(document, 'js_profile_menu')[0], new EventHandler(), { left: false });

    // and needs to have logged values set in fields
    if (session.thumbnail) $('.js_user_thumb').attr('src', session.thumbnail);
    $('.js_full_name').html(session.fullName);

    // messages and notifications
    if (parseInt(session.notifications, 10)) $('.js_new_notification_count').removeClass('display-none').html(session.notifications);
    if (parseInt(session.messages,10)) $('.js_new_message_count').removeClass('display-none').html(session.messages); 

    _initUserMenu();

  },

  _toggleDisplayedElements = function() {

    forEach(getElementsByClassName(document, 'js_not_logged'), function(elem) { (session.logged?addClass:removeClass)(elem, 'display-none'); });
    forEach(getElementsByClassName(document, 'js_logged'), function(elem) { (session.logged?removeClass:addClass)(elem, 'display-none'); });

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

    };

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