function extend(){
  for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
          if(arguments[i].hasOwnProperty(key))
              arguments[0][key] = arguments[i][key];
  return arguments[0];
}

$.fn.formatDate = function(date,separator,inverted){

  if(separator==undefined) separator = '/';
  if(inverted==undefined) inverted = true;

  var day = date.getDate();
  if(day<10) day = '0'+day;

  var month = date.getMonth() + 1;
  if(month<10) month = '0'+month;

  if(!inverted) return day + separator + month + separator + date.getFullYear();

  return date.getFullYear() + separator + month + separator + day;
};

$.fn.iScroll = function(){

  if (!document.addEventListener) return;

  document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

  if (typeof this.attr('id') == 'undefined') this.attr('id', Math.random(0,10000));
  if (this.attr('id').length == 0) this.attr('id', Math.random(0,10000));

  this.data('iScroll', new iScroll(this.attr('id'), { scrollbarClass: 'iScrollBar' }));

};

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

/* clearField */ $.fn.clearField=function(a){var b={eventAnchor:false,eventName:false};a=$.extend(b,a);$(this).after('<a class="remove-field" style="display: none">×</a>');$(this).next().click(function(){$(this).prev().removeClass('blur').val('');$(this).css('display','none');$(this).prev().blur();if(a.eventName)$(a.eventAnchor).trigger(a.eventName)});$(this).blur(function(){if($(this).val().length){$(this).addClass('blur');$(this).next().css('display','block')}}).blur().focus(function(){$(this).removeClass('blur');$(this).next().css('display','none')})};


function getElementsByClassName(node, classname) {
  var a = [];
  var re = new RegExp('(^| )'+classname+'( |$)');
  var els = node.getElementsByTagName("*");
  for(var i=0,j=els.length; i<j; i++)
      if(re.test(els[i].className))a.push(els[i]);
  return a;
}