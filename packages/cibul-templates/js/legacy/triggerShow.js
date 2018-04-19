if (typeof Object.create === 'undefined') {
    Object.create = function (o) { 
        function F() {} 
        F.prototype = o; 
        return new F(); 
    };
}

var triggerShow = {
  
  init: function(options, elem, target) {
    
    this.options = $.extend({}, $.extend($.extend({}, this.defaults), options));
    
    this.elem = $(elem);

    this.target = $(target);

    this.onShow = function(){};
    this.onHide = function(){};
    if (this.options.onShow) this.onShow = this.options.onShow;
    if (this.options.onHide) this.onHide = this.options.onHide;

    this.eventify();
  },
  defaults: {
    hiddenStatusClass: 'hiding',
    showingStatusClass: 'showing',
    hiddenClassName: 'display-none',
    onShow: function(){},
    onHide: function(){}
  },
  eventify: function(){
    this.hidden = false;
    if (this.target.hasClass(this.options.hiddenClassName)) this.hidden = true;

    this.elem.bind('click', $.proxy(function(e){
      e.preventDefault();

      if (this.hidden) this.show();
      else this.hide();
    }, this));
  },
  hide: function(){
    this.target.addClass(this.options.hiddenClassName);
    this.elem.removeClass(this.options.showingStatusClass);
    this.elem.addClass(this.options.hiddenStatusClass);
    this.hidden = true;

    this.onHide();
  },
  show: function(){
    this.target.removeClass(this.options.hiddenClassName);
    this.elem.addClass(this.options.showingStatusClass);
    this.elem.removeClass(this.options.hiddenStatusClass);
    this.hidden = false;

    this.onShow();
  }
};

(function($){
  $.fn.extend({
    triggerShow: function(target, options){

      if(!this.length) return this;

      return this.each(function(){
        var myShow = Object.create(triggerShow);
        myShow.init(options, this, target);
        $(this).data('triggerShow', myShow);
      })
    }
  })
})(jQuery);