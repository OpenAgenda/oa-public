var runCategoriesBehavior = function() {

  var categoryItems, eh = sEventHandler.getInstance();

  addClass(getElementsByClassName(document, 'cibulCategories')[0], 'cbpgct');

  cibulEmbedWidget.controllers.categories(getElementsByClassName(document, 'cbpgct')[0], function() {

    categoryItems = getElementsByClassName(getElementsByClassName(document, 'categories')[0], 'filter-item');

    if (categoryItems.length) { 
      addClass(categoryItems[0], 'active');
      
      eh.trigger('showcategories');
    } 

  });

};