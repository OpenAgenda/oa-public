(function() {

  var params = {
    selectors: {
      gridFeature: '.featset',
      gridFeatureDesc: '.featdesc'
    },
    classes: {
      gridFeatureHead: 'feathead',
      selected: 'selected'
    }
  },

  _run = function() {

    _replicateGridDescriptions();

    /*forEach(els(params.selectors.gridFeature), function(gridFeatureElem) {
      forEach(els('li', gridFeatureElem), _onListItemHover);
    });*/

  },

  _onListItemHover = function(featureListItem) {

    if (hasClass(featureListItem, params.classes.gridFeatureHead)) return;

    addEvent(featureListItem, 'mouseover', function() {

      if (hasClass(featureListItem, params.classes.selected)) return;

      _forEachMatchingFeatureListItem(featureListItem, function(matchingItem) {

        addClass(matchingItem, 'selected');

      });

    });

    addEvent(featureListItem, 'mouseout', function() {

      if (!hasClass(featureListItem, params.classes.selected)) return;

      _forEachMatchingFeatureListItem(featureListItem, function(matchingItem) {

        removeClass(matchingItem, 'selected');

      });

    });

  },

  _forEachMatchingFeatureListItem = function(featureListItem, callback) {

    var index = getChildIndex(featureListItem);

    forEach(els(params.selectors.gridFeature), function(set) {

      callback(els('li', set)[index]);

    });

  },

  _replicateGridDescriptions = function() {

    var descElems = els(el(params.selectors.gridFeature), params.selectors.gridFeatureDesc);

    for (var i = descElems.length - 1; i >= 0; i--) {

      els(els(params.selectors.gridFeature)[1], params.selectors.gridFeatureDesc)[i].innerHTML = descElems[i].innerHTML;
      els(els(params.selectors.gridFeature)[2], params.selectors.gridFeatureDesc)[i].innerHTML = descElems[i].innerHTML;

    }

  };

  addEvent(window, 'load', function() {

    _run();

  });

})();