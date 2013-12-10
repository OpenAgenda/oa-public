if (typeof Object.create === 'undefined') {
    Object.create = function (o) { 
        function F() {} 
        F.prototype = o; 
        return new F(); 
    };
}

var poppit = {
  init: function (options, elem) {

    this.options = $.extend({}, $.extend($.extend({}, this.defaults), options));

    this.elem = $(elem);
    this.dom = elem;

    switch (this.options.relative) {

      case 'prev':
      case 'next':

        this.target = $(this.elem)[this.options.relative](this.options.target);

        break;

      case 'inside':

        this.target = $(this.options.target, this.elem);

        break;

      default:

        this.target = $(this.options.target);        

    }

    this.hide();

    this.clicked = false; // flag that tells wether either the element or the popup was clicked or not.
    this.checked = false; // flag that tells wether a check was called for but not done yet

    this.eventify();
  },
  defaults: {
    my: 'left top',
    at: 'left bottom',
    offset: '0 0',
    collision: 'none',
    hideOnClick: false,
    onShow: function(){},
    relative: false
  },
  eventify: function() {
    $('body').bind('click.poppit', $.proxy(this.bodyTrigger, this));
    this.elem.bind('focus.poppit click.poppit', $.proxy(this.selfTrigger, this));
    this.target.bind('focus.poppit click.poppit', $.proxy(this.targetTrigger, this));

  },
  bodyTrigger: function(e){
    //console.log(this);
    //console.log('bodyTrigger');
    //console.log('bodyTrigger check: ' + this.checked);
    if (this.displayed) {
      if (!this.checked) this.hide(e);
      this.checked = false;
    }
  },
  targetTrigger: function(e){
    //console.log(this);
    //console.log('targetTrigger');
    //console.log('targetTrigger - displayed: ' + this.displayed);
    
    if (this.displayed && this.options.hideOnClick) this.hide(e);

    this.checked = true;

  },
  selfTrigger: function(e){
    // run only if should not be hidden on click
    //console.log(this);
    //console.log('selfTrigger');
    //console.log('selfTrigger - displayed: ' + this.displayed);

    e.preventDefault();

    if (!this.displayed) {
      this.show(e, this.elem);
    } else {
      if (this.options.hideOnClick) this.hide(e);
    }

    this.checked = true;
  },
  hide: function(e){
    //console.log('hiding target element');
    this.target.css('display', 'none');
    this.displayed = false;
  },
  show: function(e, elem){
    //console.log('showing target element');
    this.target.css('display', 'block');
    this.target.position({at: this.options.at, my: this.options.my, of: this.dom, offset: this.options.offset, collision: this.options.collision});
    this.options.onShow(e, elem);
    this.displayed = true;
  }
};


(function($){
  $.fn.extend({
    poppit: function(options){

      if(!this.length) return this;

      return this.each(function(){
        var myPoppit = Object.create(poppit);
        myPoppit.init(options, this);
        $(this).data('poppit', myPoppit);
      })
    }
  })
})(jQuery);