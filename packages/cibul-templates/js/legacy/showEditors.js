var editors_split = function(val) { return val.split( /,\s*/ ); };

var submit_new_editors = function(fullNames){

  $('.js_add_editors').click(function(e){

    $(this).attr('disabled', 'disabled');

    e.preventDefault();

    // generate array of ids from input full names

    var inputNames = editors_split($('.js_editors').val());

    var inputIds = [];

    for (var i = 0; i < inputNames.length; i++) {

      if (typeof fullNames[inputNames[i]] != 'undefined') {

        if ($.inArray(fullNames[inputNames[i]], inputIds) == -1) inputIds.push(fullNames[inputNames[i]]);

      }

    }

    if (inputIds.length != 0) {

      $('.js_add_editors').lock();

      $.ajax({

        url: $('.js_editor_form').attr('action'),
        data: { csrf_token: $('.js_token').val(), new_editor_ids: inputIds },
        dataType: 'json',
        type: 'post',
        timeout: 5000,
        error: function(jqXHR, textStatus, errorThrown) {

          $('.js_add_editors').removeAttr('disabled');

          $('.js_add_editors').lock(false);

        },
        success: function(data, textStatus, jqXHR) {

          if (data.success) {

            window.location = data.redirect;

          } else {

            location.reload = true;

          }

        }

      });

    }

  });

};

var delete_editor_behavior = function(){

  $('.js_editor_delete').click(function(e){

    e.preventDefault();

    $(this).cGet({onSuccess: $.proxy(function(data){

      $(this).parents('.js_editor').remove();

    }, this)});

  });

};

var select_editor_behavior = function(listItems){

  $('.js_editors').bind('keydown', function(e){

    if (e.keyCode === $.ui.keyCode.TAB && $(this).data("autocomplete").menu.active) {
      e.preventDefault();
    }

  }).autocomplete({
    minLength: 0,
    source: function( request, response ) {

      // delegate back to autocomplete, but extract the last term
      response( $.ui.autocomplete.filter( listItems, editors_split(request.term).pop() ) );

    },
    focus: function() {
      // prevent value inserted on focus

      return false;
    },
    select: function( event, ui ) {

      var terms = editors_split( this.value );

      // remove the current input
      terms.pop();

      // add the selected item
      
      terms.push($('.js_fullname', ui.item.value).html().replace(/^\s+/g,'').replace(/\s+$/g,''));
      
      // add placeholder to get the comma-and-space at the end
      terms.push("");
      
      this.value = terms.join(", ");

      return false;
    }
  }).data("autocomplete")._renderItem = function( ul, item ) {

    return $("<li></li>")
      .data( "item.autocomplete", item )
      .append("<a>"+ item.label + "</a>")
      .appendTo(ul);
  };





};