var apply_review_add_tag_behavior = function(){

  $('.js_infield').infieldize({position: false});

  $('.js_current_tags a').click(function(e){

    e.preventDefault();
    
    $('.js_new_tag_field').val($(this).html()).blur();

  });
}