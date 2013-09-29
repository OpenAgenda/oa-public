var runCategoriesBehavior = function(eh, cHandler, programUid, embedUid, key, embedScriptPath, controlData) {

  var categoryItems,
  codeElement = getElementsByClassName(document, 'js_category_code')[0],
  initEmbedCode = [
    '<script type="text/javascript" src="', embedScriptPath, '"></script>',
    '<div class="cibulCategories cbpgct" data-cbctl="', programUid, '/', embedUid, '|', key, '"></div>'
  ].join(''),
  _run = function() {

    codeElement.value = initEmbedCode;
    codeElement.removeAttribute('disabled');

    addClass(getElementsByClassName(document, 'cibulCategories')[0], 'cbpgct');

    cibulEmbedWidget.controllers.categories(getElementsByClassName(document, 'cbpgct')[0], function() {

      categoryItems = getElementsByClassName(getElementsByClassName(document, 'categories')[0], 'filter-item');

      if (categoryItems.length) { 
        addClass(categoryItems[0], 'active');
        
        eh.trigger('showcategories');
      } 

    });

  };

  _run();
};