var handleCibulFollow = function(canvasElem, followers, params) {

  params = extend({
    user: false,
    follow: { template: '<a href="#"><i class="icon-arrow-right"></i><span>follow on cibul</span></a>', link: false},
    unfollow: { template: '<a href="#"><i class="icon-remove"></i><span>unfollow</span></a>', link: false},
    disabledClass: 'disabled',
    loginCallback: false,
    displayNoneClass: 'display-none'
  }, params);

  var requesting = false,
  lElem = false,
  init = function() {

    contains(followers, params.user)?_setLink('unfollow'):_setLink('follow');
    
  },
  _setLink = function(type) {

    var prevElem = lElem?lElem:false;

    if (prevElem) addClass(prevElem, params.displayNoneClass);

    lElem = document.createElement('li');
    lElem.innerHTML = params[type].template;

    addEvent(lElem, 'click', function(e){
      preventDefault(e);
      if (requesting) return;
      _processRequest(type);
    });

    if (prevElem) {
      prevElem.insertAdjacentElement('afterend', lElem);
      canvasElem.removeChild(prevElem);
    } else {
      canvasElem.insertAdjacentElement('afterbegin', lElem);
    }

  },
  _processRequest = function(type) {

    if (!params.user) if (params.loginCallback) return params.loginCallback();

    requesting = type;

    addClass(lElem, params.disabledClass);

    if (params[type].link) {
      remote.getXmlHttp(params[type].link, { timeout: 3000 }, function(data){
        _processResponse(data.success);
      });
    } else {
      setTimeout(function(){
        _processResponse(true);
      }, 200);
    }

  },
  _processResponse = function(success) {

    removeClass(lElem, params.disabledClass);

    var newType = requesting=='follow'?'unfollow':'follow';

    requesting = false;

    _setLink(newType);

  };

  init();


};