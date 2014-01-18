var runAddButtonBehavior = function(params) {

  params = extend({
    collaborative: false,
    key: false,
    selectors: {
      frame: '.js_form_embed',
      login: '.js_login_embed',
      enabled: '.js_button_enabled',
      disabled: '.js_button_disabled'
    },
    events: { cssUpdate: 'cssupdate', layoutUpdate: 'layoutupdate' },
    height: 2090,
    classes: {
      none: 'display-none'
    },
    layoutWrapper: 'layout[%value%]',
    layout: ['fontsize', 'fontfamily', 'lang', 'color1', 'color2'], // layout params form is sensible to (other than customcss)
    res: { form: false, sandbox: false, loginSandbox: false }, // form is the production resource, sandbox is the one used in the config mode
    initLayout: false, // used to fetch configuration defined in config form
  }, params);

  var formFrame = el(params.selectors.frame),

  loginFrame = el(params.selectors.login),

  eh = sEventHandler.getInstance(),

  currentLayout = {}, currentCss,

  run = function() {

    if (!params.collaborative) return;

    forEach(els(params.selectors.disabled), function(elem) { addClass(elem, params.classes.none); });

    forEach(els(params.selectors.enabled), function(elem) { removeClass(elem, params.classes.none); });

    _extractFormLayout(params.initLayout);
    
    _updateFrames();

    eh.on(params.events.cssUpdate, function(css) {

      if (css!==currentCss) _syncCss(css);

    });

    eh.on(params.events.layoutUpdate, function(newLayout) {

      if (_extractFormLayout(newLayout)) _updateFrames();

    });

  },

  _extractFormLayout = function(newLayout) {

    var newFormLayout = {}, change = false;

    forEach(params.layout, function(layoutParam) {
      var param = params.layoutWrapper.replace('%value%', layoutParam);

      if (typeof newLayout[param] !== 'undefined') {
        newFormLayout[param] = newLayout[param];
      
        if (newLayout[param] !== currentLayout[param]) change = true;
      }
      
    });

    if (change) currentLayout = newFormLayout;

    return change;

  },

  _syncCss = function(css) {

    currentCss = css;

    formFrame.contentWindow.window.setCustomCss(css);

  },

  _updateFrames = function() {

    formFrame.src = params.res.sandbox.addUrlParameters(extend({ key: params.key }, currentLayout));
    formFrame.style.height = params.height + 'px';

    loginFrame.src = params.res.loginSandbox.addUrlParameters(extend({ key: params.key }, currentLayout));
    loginFrame.style.height = '350px';

  };

  run();

};