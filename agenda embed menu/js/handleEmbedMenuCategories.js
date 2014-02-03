var runCategoriesBehavior = function() {

  var categoryItems, eh = sEventHandler.getInstance();

  addClass(el('.cibulCategories'), 'cbpgct');

  cibulEmbedWidget.controllers.categories(el('.cbpgct'), function() {

    categoryItems = els(el('.categories'), '.filter-item');

    if (categoryItems.length) {
      addClass(categoryItems[0], 'active');
      
      eh.trigger('showcategories');
    }

  });

};